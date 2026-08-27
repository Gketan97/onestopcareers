import type { Job } from './types'

// Cutover completed 2026-08-26 — was pointing at the old, pre-merge
// jobscout-date repo this entire time (confirmed via the engineering
// audit, OSC-002). The new crawler in crawler/ has been running
// successfully for a while (real commits like "chore: crawl incremental
// — 496 jobs" in this repo's own history), but the frontend never
// actually switched over. Do NOT pause the old repo's Action until
// this exact URL has been confirmed live and showing real jobs — the
// old repo being paused before this cutover would freeze the site on
// stale data forever, since jsDelivr just keeps serving whatever was
// last committed.
const CDN = 'https://cdn.jsdelivr.net/gh/Gketan97/onestopcareers@main/crawler/data/jobs.json'

// NOTE: the crawler's current output is a bare Job[], not yet wrapped with
// schema_version (see docs/DESIGN_DOC.md §6 — adding schema_version is a
// recommended follow-up, not done yet). This fetcher handles both shapes
// so the frontend doesn't break the moment that change lands.
export async function fetchJobs(): Promise<Job[]> {
  // Timeout added 2026-08-26 (OSC-005 from the engineering audit) — this
  // is the single most-depended-on fetch in the app; every page needs
  // it, and it previously had no timeout at all, meaning a slow/hanging
  // CDN response meant an infinite loading spinner sitewide. Matches
  // the same pattern already used in fetchJobDescription.ts.
  const res = await fetch(CDN, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`Failed to fetch jobs: HTTP ${res.status}`)
  const data = await res.json()
  const jobs: Job[] = Array.isArray(data) ? data : data.jobs
  if (!Array.isArray(jobs)) throw new Error('Unexpected jobs feed shape')
  return jobs
}
