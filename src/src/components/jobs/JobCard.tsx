import { useNavigate } from 'react-router-dom'
import type { Job } from '../../lib/jobs/types'
import { postedLabel, recencyTier } from '../../lib/format'
import Badge from '../ui/Badge'

const recencyTone = { fresh: 'green', aging: 'amber', stale: 'gray' } as const

export default function JobCard({ job, query }: { job: Job; query?: string }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}${query ? `?q=${encodeURIComponent(query)}` : ''}`)}
      className="bg-bg-surface border border-border-subtle rounded-md px-6 py-5 flex items-center justify-between gap-6 cursor-pointer transition-all hover:border-border-default hover:-translate-y-px"
    >
      <div className="flex gap-4 items-start flex-1 min-w-0">
        <div
          className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5"
          style={{ background: job.color || '#D65A2B' }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-base font-semibold">{job.title}</span>
            <Badge tone="neutral">{job.fn}</Badge>
          </div>
          <div className="text-sm text-text-secondary mt-1">{job.company}</div>
          <div className="flex gap-3.5 mt-2.5 flex-wrap font-mono text-[11.5px] text-text-tertiary">
            {job.city && <span>📍 {job.city}</span>}
            {job.mode && <span className="capitalize">{job.mode}</span>}
            {job.seniority && <span className="capitalize">{job.seniority}</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
        <Badge tone={recencyTone[recencyTier(job.posted_at)]} className="!bg-transparent !border-0 !px-0 font-medium flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              recencyTier(job.posted_at) === 'fresh'
                ? 'bg-green'
                : recencyTier(job.posted_at) === 'aging'
                ? 'bg-amber'
                : 'bg-gray'
            }`}
          />
          {postedLabel(job.posted_at)}
        </Badge>
      </div>
    </div>
  )
}
