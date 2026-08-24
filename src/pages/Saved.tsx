import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import Layout from '../components/shell/Layout'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import JobCard from '../components/jobs/JobCard'
import { useAuth } from '../lib/auth/AuthContext'
import { useSavedJobs } from '../lib/jobs/useSavedJobs'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import type { Job } from '../lib/jobs/types'

// Saved job ids live in Supabase; the actual job records don't (see
// design doc — no jobs mirror). This page fetches the current jobs.json
// (same as every other page) and filters to the ids the user saved. A
// real consequence, stated plainly: if a job ages out of the crawler's
// 30-day window, it simply disappears from this list too — there's no
// separate archive of a saved job's details once the source listing is
// gone. Acceptable for now, but worth knowing.
export default function Saved() {
  const { user, loading: authLoading, available } = useAuth()
  const { savedIds, loading: savedLoading } = useSavedJobs()
  const [allJobs, setAllJobs] = useState<Job[] | null>(null)

  useEffect(() => {
    fetchJobs().then(setAllJobs).catch(() => setAllJobs([]))
  }, [])

  const loading = authLoading || savedLoading || allJobs === null
  const savedJobs = allJobs?.filter((j) => savedIds.has(j.id)) ?? []

  if (!available) {
    return (
      <Layout>
        <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-24 text-center">
          <p className="text-text-secondary">This feature isn&#8217;t available right now.</p>
        </div>
      </Layout>
    )
  }

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-24 text-center">
          <Bookmark size={28} className="text-text-tertiary mx-auto mb-4" aria-hidden="true" />
          <h1 className="font-display text-2xl mb-2">Log in to see your saved jobs.</h1>
          <p className="text-text-secondary mb-7">Saving jobs needs an account, so your list is there next time.</p>
          <Link to={`/login?next=${encodeURIComponent('/saved')}`}>
            <Button>Log in</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-14">
        <h1 className="font-display text-4xl md:text-[42px]">Saved jobs</h1>
        <p className="text-text-secondary mt-2.5 text-[15px]">
          {loading ? 'Loading…' : `${savedJobs.length} job${savedJobs.length !== 1 ? 's' : ''} saved`}
        </p>

        <div className="mt-8">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[110px]" />)}
            </div>
          )}

          {!loading && savedJobs.length === 0 && (
            <div className="text-center py-16">
              <Bookmark size={28} className="text-text-tertiary mx-auto mb-4" aria-hidden="true" />
              <p className="text-text-secondary mb-6">Nothing saved yet.</p>
              <Link to="/jobs"><Button variant="secondary">Browse jobs</Button></Link>
            </div>
          )}

          {!loading && savedJobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedJobs.map((job, i) => <JobCard key={job.id} job={job} compact index={i} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
