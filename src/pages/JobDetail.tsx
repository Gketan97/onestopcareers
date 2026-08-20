import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import type { Job } from '../lib/jobs/types'
import { postedLabel } from '../lib/format'

export default function JobDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [job, setJob] = useState<Job | null | undefined>(undefined) // undefined = loading, null = not found

  useEffect(() => {
    fetchJobs()
      .then((jobs) => setJob(jobs.find((j) => j.id === id) ?? null))
      .catch(() => setJob(null))
  }, [id])

  const backHref = `/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto px-6 md:px-12 py-14">
        <Link to={backHref} className="text-sm text-text-secondary hover:text-text-primary">
          ← Back to jobs
        </Link>

        {job === undefined && (
          <div className="mt-8 flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        )}

        {job === null && (
          <div className="mt-16 text-center">
            <h1 className="font-display text-3xl mb-2">Role not found</h1>
            <p className="text-text-secondary text-sm">
              This listing may have closed or moved. <Link to="/jobs" className="text-accent">Browse open roles →</Link>
            </p>
          </div>
        )}

        {job && (
          <div className="mt-8">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-1 h-8 rounded-full" style={{ background: job.color || '#D65A2B' }} />
              <span className="text-sm text-text-secondary">{job.company}</span>
            </div>
            <h1 className="font-display text-4xl leading-tight">{job.title}</h1>

            <div className="flex gap-2 flex-wrap mt-5">
              <Badge tone="accent">{job.fn}</Badge>
              {job.city && <Badge tone="neutral">📍 {job.city}</Badge>}
              {job.mode && <Badge tone="neutral" className="capitalize">{job.mode}</Badge>}
              {job.seniority && <Badge tone="neutral" className="capitalize">{job.seniority}</Badge>}
            </div>

            <p className="font-mono text-xs text-text-tertiary mt-5">
              Posted {postedLabel(job.posted_at)} · via {job.src}
            </p>

            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <Button className="mt-8">Apply on {job.company} →</Button>
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
}
