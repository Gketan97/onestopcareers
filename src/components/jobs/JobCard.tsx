import { useNavigate } from 'react-router-dom'
import { MapPin, Wifi, Building2 } from 'lucide-react'
import type { Job } from '../../lib/jobs/types'
import { postedLabel, recencyTier } from '../../lib/format'
import Badge from '../ui/Badge'

const recencyTone = { fresh: 'green', aging: 'amber', stale: 'gray' } as const
const KNOWN_FUNCTIONS = ['data', 'product', 'bizops', 'engineering', 'finance', 'design']

const ModeIcon = ({ mode, size }: { mode: string; size: number }) =>
  mode === 'remote' ? <Wifi size={size} aria-hidden="true" /> : <Building2 size={size} aria-hidden="true" />

export default function JobCard({
  job,
  query,
  compact = false,
  index = 0,
}: {
  job: Job
  query?: string
  compact?: boolean
  index?: number
}) {
  const navigate = useNavigate()
  const showFnBadge = KNOWN_FUNCTIONS.includes(job.fn)
  const recency = recencyTier(job.posted_at)
  const style = { animationDelay: `${Math.min(index, 12) * 35}ms` }

  const RecencyDot = (
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        recency === 'fresh' ? 'bg-green' : recency === 'aging' ? 'bg-amber' : 'bg-gray'
      }`}
    />
  )

  if (compact) {
    return (
      <div
        onClick={() => navigate(`/jobs/${job.id}${query ? `?q=${encodeURIComponent(query)}` : ''}`)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job.id}`)}
        role="button"
        tabIndex={0}
        style={style}
        className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md p-4 flex flex-col gap-2.5 cursor-pointer transition-all hover:border-border-default hover:-translate-y-px hover:shadow-md h-full"
      >
        <div className="flex items-start justify-between gap-2">
          <div
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ background: job.color || '#E86B35' }}
          />
          <span className={`flex items-center gap-1.5 font-mono text-[10.5px] ${recencyTone[recency] === 'green' ? 'text-green' : recencyTone[recency] === 'amber' ? 'text-amber' : 'text-gray'}`}>
            {RecencyDot}
            {postedLabel(job.posted_at)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-snug line-clamp-2">{job.title}</div>
          <div className="text-xs text-text-secondary mt-1">{job.company}</div>
        </div>
        <div className="flex gap-2 flex-wrap mt-auto pt-1 items-center">
          {showFnBadge && <Badge tone="neutral" className="!text-[10px] !px-2 !py-0.5">{job.fn}</Badge>}
          {job.mode && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-text-tertiary capitalize">
              <ModeIcon mode={job.mode} size={11} />
              {job.mode}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}${query ? `?q=${encodeURIComponent(query)}` : ''}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job.id}`)}
      role="button"
      tabIndex={0}
      style={style}
      className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md px-6 py-5 flex items-center justify-between gap-6 cursor-pointer transition-all hover:border-border-default hover:-translate-y-px hover:shadow-md"
    >
      <div className="flex gap-4 items-start flex-1 min-w-0">
        <div
          className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5"
          style={{ background: job.color || '#E86B35' }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-base font-semibold">{job.title}</span>
            {showFnBadge && <Badge tone="neutral">{job.fn}</Badge>}
          </div>
          <div className="text-sm text-text-secondary mt-1">{job.company}</div>
          <div className="flex gap-3.5 mt-2.5 flex-wrap font-mono text-[11.5px] text-text-tertiary">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                {job.city}
              </span>
            )}
            {job.mode && (
              <span className="flex items-center gap-1 capitalize">
                <ModeIcon mode={job.mode} size={12} />
                {job.mode}
              </span>
            )}
            {job.seniority && <span className="capitalize">{job.seniority}</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
        <Badge tone={recencyTone[recency]} className="!bg-transparent !border-0 !px-0 font-medium flex items-center gap-1.5">
          {RecencyDot}
          {postedLabel(job.posted_at)}
        </Badge>
      </div>
    </div>
  )
}
