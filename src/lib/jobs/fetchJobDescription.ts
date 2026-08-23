import type { Job } from './types'

export interface JobDescriptionResult {
  available: boolean
  description?: string
  reason?: string
}

// Calls the on-demand description function (netlify/functions/job-description.js).
// Same-origin — no CORS setup needed. Fails soft: any error or unsupported
// source returns { available: false }, never throws, so JobDetail can
// always render something (the fallback "view on {company}'s site" link)
// rather than an error state for what's an enhancement, not core content.
export async function fetchJobDescription(job: Job): Promise<JobDescriptionResult> {
  try {
    const params = new URLSearchParams({ src: job.src, url: job.url, id: job.id })
    const res = await fetch(`/.netlify/functions/job-description?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return { available: false, reason: 'http_error' }
    return await res.json()
  } catch {
    return { available: false, reason: 'network_error' }
  }
}
