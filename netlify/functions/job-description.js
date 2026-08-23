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

function htmlToText(html) {
  if (!html) return ''
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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
  return d?.content ? htmlToText(d.content) : null
}

async function fetchLever(url, id) {
  const m = url.match(/jobs\.lever\.co\/([^/]+)\/([a-zA-Z0-9-]+)/)
  if (!m) return null
  const d = await fetchJSON(`https://api.lever.co/v0/postings/${m[1]}/${m[2]}?mode=json`)
  const parts = [d?.descriptionPlain || htmlToText(d?.description)]
  if (Array.isArray(d?.lists)) {
    for (const list of d.lists) {
      if (list?.text) parts.push(`\n${list.text}`)
      if (list?.content) parts.push(htmlToText(list.content))
    }
  }
  const text = parts.filter(Boolean).join('\n')
  return text || null
}

async function fetchAshby(url, id) {
  const m = url.match(/jobs\.ashbyhq\.com\/([^/]+)/)
  const abId = id.replace(/^ab-/, '')
  if (!m) return null
  const d = await fetchJSON(`https://api.ashbyhq.com/posting-api/job-board/${m[1]}`)
  const posting = (d?.jobPostings || []).find((j) => j.id === abId)
  return posting?.descriptionHtml ? htmlToText(posting.descriptionHtml) : null
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
    const description = await fetcher(url, id)
    if (!description) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
        body: JSON.stringify({ available: false, reason: 'no_content_found' }),
      }
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify({ available: true, description }),
    }
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify({ available: false, reason: 'fetch_failed', detail: String(e.message || e) }),
    }
  }
}
