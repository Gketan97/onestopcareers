import type { Job } from './types'

const CDN = 'https://cdn.jsdelivr.net/gh/Gketan97/jobscout-date@main/data/jobs.json'

// NOTE: the crawler's current output is a bare Job[], not yet wrapped with
// schema_version (see docs/DESIGN_DOC.md §6 — adding schema_version is a
// recommended follow-up, not done yet). This fetcher handles both shapes
// so the frontend doesn't break the moment that change lands.
export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(CDN)
  if (!res.ok) throw new Error(`Failed to fetch jobs: HTTP ${res.status}`)
  const data = await res.json()
  const jobs: Job[] = Array.isArray(data) ? data : data.jobs
  if (!Array.isArray(jobs)) throw new Error('Unexpected jobs feed shape')
  return jobs
}
