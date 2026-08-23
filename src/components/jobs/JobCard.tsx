import { useNavigate, Link } from 'react-router-dom'
import type { MouseEvent } from 'react'
import { MapPin, Wifi, Building2 } from 'lucide-react'
import type { Job } from '../../lib/jobs/types'
import { postedLabel, recencyTier } from '../../lib/format'
import { jobSlug } from '../../lib/jobs/slug'
import { companySlug } from '../../lib/jobs/companies'
import CompanyAvatar from './CompanyAvatar'
import Badge from '../ui/Badge'

const recencyTone = { fresh: 'green', aging: 'amber', stale: 'gray' } as const
const KNOWN_FUNCTIONS = ['data', 'product', 'bizops', 'engineering', 'finance', 'design']

const ModeIcon = ({ mode, size }: { mode: string; size: number }) =>
  mode === 'remote' ? <Wifi size={size} aria-hidden="true" /> : <Building2 size={size} aria-hidden="true" />

// Redesigned 2026-08-23 per the Jobs/Companies architecture brief: company
// is now the primary visual anchor (avatar + name), not an unexplained
// colored bar. Hierarchy: company -> title -> location/mode -> function/
// level -> posted date, matching the brief's card spec exactly. Company
// name is independently clickable (-> /companies/:slug), same "click
// state per element" requirement from the brief.
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
  const color = job.color || '#E86B35'

  const RecencyDot = (
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        recency === 'fresh' ? 'bg-green' : recency === 'aging' ? 'bg-amber' : 'bg-gray'
      }`}
    />
  )

  const goToJob = () => navigate(`/jobs/${jobSlug(job)}${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  const stopAndGoToCompany = (e: MouseEvent) => e.stopPropagation()

  if (compact) {
    return (
      <div
        onClick={goToJob}
        onKeyDown={(e) => e.key === 'Enter' && goToJob()}
        role="button"
        tabIndex={0}
        style={style}
        className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md p-4 flex flex-col gap-3 cursor-pointer transition-all hover:border-border-default hover:-translate-y-px hover:shadow-md h-full"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CompanyAvatar name={job.company} color={color} size={26} />
            <Link
              to={`/companies/${companySlug(job.company)}`}
              onClick={stopAndGoToCompany}
              className="text-xs text-text-secondary hover:text-text-primary truncate"
            >
              {job.company}
            </Link>
          </div>
          <span className={`flex items-center gap-1.5 font-mono text-[10.5px] flex-shrink-0 ${recencyTone[recency] === 'green' ? 'text-green' : recencyTone[recency] === 'amber' ? 'text-amber' : 'text-gray'}`}>
            {RecencyDot}
            {postedLabel(job.posted_at)}
          </span>
        </div>
        <div className="text-sm font-semibold leading-snug line-clamp-2">{job.title}</div>
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
      onClick={goToJob}
      onKeyDown={(e) => e.key === 'Enter' && goToJob()}
      role="button"
      tabIndex={0}
      style={style}
      className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md px-6 py-5 flex items-center justify-between gap-6 cursor-pointer transition-all hover:border-border-default hover:-translate-y-px hover:shadow-md"
    >
      <div className="flex gap-4 items-start flex-1 min-w-0">
        <CompanyAvatar name={job.company} color={color} size={40} />
        <div className="min-w-0">
          <Link
            to={`/companies/${companySlug(job.company)}`}
            onClick={stopAndGoToCompany}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {job.company}
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
            <span className="text-base font-semibold">{job.title}</span>
          </div>
          <div className="flex gap-3.5 mt-2.5 flex-wrap font-mono text-[11.5px] text-text-tertiary items-center">
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
            {showFnBadge && <Badge tone="neutral" className="!text-[10px]">{job.fn}</Badge>}
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
