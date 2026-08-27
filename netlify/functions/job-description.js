// On-demand job description fetcher. Called once per job-detail-page view
// (see src/lib/jobs/fetchJobDescription.ts), NOT part of the daily batch
// crawl — this keeps jobs.json small (most jobs never get their
// description read) and descriptions always fresh (fetched live, not
// stored/aging in a database we'd have to keep in sync).
//
// Covers Greenhouse, Lever, Ashby — together ~87% of active companies
// (163 of 186) as of the v8 crawler audit. Every other source falls back
// to { available: false }, and the frontend shows a "view on {company}'s
// site" link instead of fabricating content we don't have.
//
// IMPORTANT — not verified against live APIs: this sandbox has no network
// access to boards-api.greenhouse.io / api.lever.co / api.ashbyhq.com, so
// these API shapes are built from documented/known response formats, not
// confirmed by an actual live call. Each source is wrapped in its own
// try/catch so a wrong assumption about one source's shape degrades to
// "unavailable" for that source only, not a broken function. Needs a real
// post-deploy smoke test against a few live job URLs per source — see
// design doc §6 open questions.

// Structured description parser — replaces the old flat htmlToText()
// (2026-08-26). Returns clean sections instead of a raw text blob, and
// strips company-boilerplate content (funding history, "equal
// opportunity employer" legalese, "follow us on LinkedIn," founding
// story) that isn't actually about the role. Verified against a real
// job posting sample before shipping — two real bugs were caught this
// way, not assumed away: (1) <br> tags sitting inside <strong></strong>
// tags in real HTML split the heading-detection sentinel across two
// lines, breaking heading detection entirely; (2) a trailing boilerplate
// paragraph with no heading of its own was silently attaching to
// whatever section happened to be open, causing the combined-text
// boilerplate check to wrongly discard that entire section — including
// its legitimate bullet items — not just the boilerplate sentence
// itself. Deliberately returns structured data (never raw HTML) so the
// frontend never needs dangerouslySetInnerHTML at all — sidesteps any
// HTML-injection risk entirely rather than sanitizing and managing it.
const BOILERPLATE_PATTERNS = [
  /\bfounded in \d{4}\b/i,
  /\bbacked by\b.{0,80}(investors|capital|ventures|partners)/i,
  /\braised over \$/i,
  /\bannualized transactions\b/i,
  /\bequal employment opportunity\b/i,
  /\bequal opportunity employer\b/i,
  /doesn.t discriminate/i,
  /\bfollow us on\b/i,
  /\$\d+\+?\s?(billion|million)\b/i,
  /\bone of india.s leading\b/i,
  /\bfintech powerhouse\b/i,
]

function isBoilerplate(text) {
  return BOILERPLATE_PATTERNS.some((re) => re.test(text))
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
}

function parseDescription(html) {
  if (!html) return []

  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>\s*(<\/(strong|b)>)/gi, '$1')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '\x01$1\x01')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '\x01$1\x01')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n\x02 ')
    .replace(/<[^>]+>/g, '')

  text = decodeEntities(text)

  const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  const sections = []
  let current = null

  const pushCurrent = () => {
    if (!current) return
    const combinedText = [...current.paragraphs, ...current.items].join(' ')
    if (!combinedText.trim()) return
    if (!current.heading && isBoilerplate(combinedText)) return
    sections.push(current)
  }

  for (let line of rawLines) {
    const headingMatch = line.match(/^\x01([^\x01]+)\x01\s*:?\s*$/)
    if (headingMatch) {
      const headingText = headingMatch[1].replace(/:$/, '').trim()
      if (headingText.length < 60) {
        pushCurrent()
        current = { heading: headingText, paragraphs: [], items: [] }
        continue
      }
    }

    line = line.replace(/\x01/g, '')
    const isBullet = line.startsWith('\x02') || /^[●•▪‣*-]\s/.test(line)
    const cleanLine = line.replace(/^\x02\s*/, '').replace(/^[●•▪‣*-]\s*/, '').trim()
    if (!cleanLine) continue

    if (!current) current = { heading: null, paragraphs: [], items: [] }

    if (isBullet) {
      current.items.push(cleanLine)
    } else {
      if (isBoilerplate(cleanLine)) continue
      current.paragraphs.push(cleanLine)
    }
  }
  pushCurrent()

  let kept = sections.filter((s) => {
    const combined = [...s.paragraphs, ...s.items].join(' ')
    return !isBoilerplate(combined)
  })

  const hasHeadedSection = kept.some((s) => s.heading)
  if (hasHeadedSection) kept = kept.filter((s) => s.heading)

  return kept.map((s) => ({
    heading: s.heading,
    paragraph: s.paragraphs.length ? s.paragraphs.join(' ') : null,
    items: s.items,
  }))
}

async function fetchJSON(url, options = {}) {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000), ...options })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

async function fetchGreenhouse(url, id) {
  const boardMatch = url.match(/boards\.greenhouse\.io\/([^/]+)/)
  const ghId = id.replace(/^gh-/, '')
  if (!boardMatch) return null
  const d = await fetchJSON(
    `https://boards-api.greenhouse.io/v1/boards/${boardMatch[1]}/jobs/${ghId}?content=true`,
  )
  return d?.content ? parseDescription(d.content) : null
}

async function fetchLever(url, id) {
  const m = url.match(/jobs\.lever\.co\/([^/]+)\/([a-zA-Z0-9-]+)/)
  if (!m) return null
  const d = await fetchJSON(`https://api.lever.co/v0/postings/${m[1]}/${m[2]}?mode=json`)
  // Lever's API already separates the intro description from labeled
  // lists (e.g. "Requirements," "What You'll Do") — rather than writing
  // bespoke section-building logic for this one source, feed it into
  // the same parseDescription() used everywhere else by reconstructing
  // each list's label as a <strong> heading, so all three sources go
  // through one consistently-tested code path.
  let combinedHtml = d?.description || ''
  if (Array.isArray(d?.lists)) {
    for (const list of d.lists) {
      if (list?.text) combinedHtml += `<p><strong>${list.text}</strong></p>`
      if (list?.content) combinedHtml += list.content
    }
  }
  return combinedHtml ? parseDescription(combinedHtml) : null
}

async function fetchAshby(url, id) {
  const m = url.match(/jobs\.ashbyhq\.com\/([^/]+)/)
  const abId = id.replace(/^ab-/, '')
  if (!m) return null
  const d = await fetchJSON(`https://api.ashbyhq.com/posting-api/job-board/${m[1]}`)
  const posting = (d?.jobPostings || []).find((j) => j.id === abId)
  return posting?.descriptionHtml ? parseDescription(posting.descriptionHtml) : null
}

const FETCHERS = { greenhouse: fetchGreenhouse, lever: fetchLever, ashby: fetchAshby }

exports.handler = async (event) => {
  const { src, url, id } = event.queryStringParameters || {}

  if (!src || !url || !id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'src, url, and id are required' }) }
  }

  const fetcher = FETCHERS[src]
  if (!fetcher) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify({ available: false, reason: 'source_not_supported' }),
    }
  }

  try {
    const sections = await fetcher(url, id)
    if (!sections || sections.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
        body: JSON.stringify({ available: false, reason: 'no_content_found' }),
      }
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify({ available: true, sections }),
    }
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify({ available: false, reason: 'fetch_failed', detail: String(e.message || e) }),
    }
  }
}
