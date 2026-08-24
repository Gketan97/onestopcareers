import { useNavigate, Link } from 'react-router-dom'
import type { MouseEvent } from 'react'
import { MapPin, Wifi, Building2 } from 'lucide-react'
import type { Job } from '../../lib/jobs/types'
import { postedLabel } from '../../lib/format'
import { jobSlug } from '../../lib/jobs/slug'
import { companySlug } from '../../lib/jobs/companies'
import { fnLabel } from '../../lib/jobs/functionLabels'
import CompanyLogo from './CompanyLogo'

const ModeIcon = ({ mode, size }: { mode: string; size: number }) =>
  mode === 'remote' ? <Wifi size={size} aria-hidden="true" /> : <Building2 size={size} aria-hidden="true" />

// v6 (2026-08-23): several explicit reversals from the previous pass —
// (1) real company logos (CompanyLogo, with monogram fallback) instead
// of always-initials; (2) the per-company colored top/left border
// removed — it was decorative, not semantic, and orange usage is now
// reserved for selected/interactive states only, not card chrome; (3)
// the raw `fn` badge (which literally showed "data" — ambiguous) now
// uses fnLabel() for a real word ("Analytics"); (4) posted date
// de-emphasized — no more color-coded recency dot/tone, just quiet
// muted text; (5) tightened padding to cut empty vertical space.
// Hierarchy unchanged: company -> title -> location/mode/function ->
// posted date, still matches the brief.
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
  const color = job.color || '#E86B35'
  const style = { animationDelay: `${Math.min(index, 12) * 35}ms` }

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
        className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all hover:border-accent-border hover:-translate-y-px hover:shadow-lg h-full"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CompanyLogo name={job.company} color={color} size={26} />
          <Link
            to={`/companies/${companySlug(job.company)}`}
            onClick={stopAndGoToCompany}
            className="text-[13px] font-medium text-text-primary hover:text-accent truncate"
          >
            {job.company}
          </Link>
        </div>
        <div className="text-sm font-semibold leading-snug line-clamp-2">{job.title}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10.5px] text-text-tertiary items-center">
          {job.city && (
            <span className="flex items-center gap-1">
              <MapPin size={10} aria-hidden="true" />
              {job.city}
            </span>
          )}
          {job.mode && (
            <span className="flex items-center gap-1 capitalize">
              <ModeIcon mode={job.mode} size={10} />
              {job.mode}
            </span>
          )}
          <span>{fnLabel(job.fn)}</span>
        </div>
        <span className="font-mono text-[10px] text-text-tertiary mt-auto pt-1">{postedLabel(job.posted_at)}</span>
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
      className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md px-5 py-4 flex items-center justify-between gap-6 cursor-pointer transition-all hover:border-accent-border hover:-translate-y-px hover:shadow-lg"
    >
      <div className="flex gap-3.5 items-center flex-1 min-w-0">
        <CompanyLogo name={job.company} color={color} size={38} />
        <div className="min-w-0">
          <Link
            to={`/companies/${companySlug(job.company)}`}
            onClick={stopAndGoToCompany}
            className="text-[13px] text-text-secondary hover:text-accent"
          >
            {job.company}
          </Link>
          <div className="text-base font-semibold mt-0.5">{job.title}</div>
          <div className="flex gap-3 mt-1.5 flex-wrap font-mono text-[11.5px] text-text-tertiary items-center">
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
            <span>{fnLabel(job.fn)}</span>
            {job.seniority && <span className="capitalize">{job.seniority}</span>}
          </div>
        </div>
      </div>

      <span className="font-mono text-[11px] text-text-tertiary flex-shrink-0">{postedLabel(job.posted_at)}</span>
    </div>
  )
}
