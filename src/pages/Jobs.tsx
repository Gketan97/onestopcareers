import { useEffect, useState } from 'react'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import type { Job } from '../lib/jobs/types'

// Placeholder page — real implementation composes jobs/JobSearch,
// jobs/JobFilters, jobs/JobList per docs/DESIGN_DOC.md §5 (Phase 2).
export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-[1040px] mx-auto px-12 py-14">
      <h1 className="font-display text-4xl">Jobs</h1>
      {loading && <p className="text-text-secondary mt-4">Loading…</p>}
      {error && <p className="text-red mt-4">Couldn&apos;t load jobs: {error}</p>}
      {!loading && !error && (
        <p className="text-text-secondary mt-4">{jobs.length} roles loaded.</p>
      )}
    </main>
  )
}
