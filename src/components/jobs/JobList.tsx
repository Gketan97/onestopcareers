import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, ArrowDownAZ, ArrowRight } from 'lucide-react'
import { fetchJobs } from '../../lib/jobs/fetchJobs'
import type { Job } from '../../lib/jobs/types'
import { deriveCompanies } from '../../lib/jobs/companies'
import { fnLabel } from '../../lib/jobs/functionLabels'
import CompanyLogo from './CompanyLogo'
import JobCard from './JobCard'
import JobSearch from './JobSearch'
import JobFilters, { type PostedFilter } from './JobFilters'
import EmptyState from './EmptyState'
import Skeleton from '../ui/Skeleton'
import Button from '../ui/Button'
import { analytics } from '../../lib/analytics/posthog'

const PAGE_SIZE = 24
const DISCOVERY_AFTER = 8 // insert the companies module after this many results
type ViewMode = 'grid' | 'list'
type SortMode = 'newest' | 'relevant'

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [activeFn, setActiveFn] = useState<string | null>('data')
  const [activeSeniority, setActiveSeniority] = useState<string | null>(null)
  const [workMode, setWorkMode] = useState<string | null>(null)
  const [activeCity, setActiveCity] = useState<string | null>(null)
  const [postedFilter, setPostedFilter] = useState<PostedFilter>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortMode>('newest')

  const q = searchParams.get('q') || ''

  const setQ = useCallback(
    (val: string) => {
      setPage(1)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (val) next.set('q', val)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const functions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.fn))).sort(),
    [jobs],
  )
  const seniorities = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.seniority).filter(Boolean))).sort(),
    [jobs],
  )
  const cities = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.city).filter(Boolean))).sort(),
    [jobs],
  )

  const filtered = useMemo(() => {
    let result = jobs
    if (q) {
      const ql = q.toLowerCase()
      result = result.filter(
        (j) => j.title.toLowerCase().includes(ql) || j.company.toLowerCase().includes(ql),
      )
    }
    if (activeFn) result = result.filter((j) => j.fn === activeFn)
    if (activeSeniority) result = result.filter((j) => j.seniority === activeSeniority)
    if (workMode) result = result.filter((j) => j.mode === workMode)
    if (activeCity) result = result.filter((j) => j.city === activeCity)
    if (postedFilter) {
      const days = postedFilter === 'today' ? 1 : postedFilter === 'week' ? 7 : 30
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      result = result.filter((j) => j.posted_at >= cutoffStr)
    }
    return result
  }, [jobs, q, activeFn, activeSeniority, workMode, activeCity, postedFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'newest' || !q) {
      return arr.sort((a, b) => b.posted_at.localeCompare(a.posted_at))
    }
    const ql = q.toLowerCase()
    const score = (j: Job) => {
      const title = j.title.toLowerCase()
      if (title === ql) return 3
      if (title.startsWith(ql)) return 2
      if (title.includes(ql)) return 1
      return 0
    }
    return arr.sort((a, b) => score(b) - score(a) || b.posted_at.localeCompare(a.posted_at))
  }, [filtered, sort, q])

  const paginated = sorted.slice(0, page * PAGE_SIZE)

  // Debounced — JobSearch fires onChange on every keystroke (by design,
  // for instant filtering), but tracking on every keystroke would flood
  // PostHog with partial-query noise. Waits 600ms after typing stops.
  useEffect(() => {
    if (!q) return
    const t = setTimeout(() => {
      analytics.jobSearch({ result_count: sorted.length, has_query: true })
    }, 600)
    return () => clearTimeout(t)
  }, [q, sorted.length])
  const hasMore = paginated.length < sorted.length

  // Contextual to the CURRENT filtered set, not the global job list —
  // "companies hiring for X" should mean companies with open X roles,
  // not companies hiring for anything. Heading text adapts to which
  // filters are active, matching the brief's exact examples.
  const discoveryCompanies = useMemo(() => deriveCompanies(filtered).slice(0, 4), [filtered])
  const discoveryHeading = useMemo(() => {
    if (activeFn && workMode) return `Companies hiring ${workMode} ${fnLabel(activeFn).toLowerCase()} talent`
    if (activeFn) return `Companies hiring for ${fnLabel(activeFn)}`
    if (workMode) return `Companies hiring ${workMode} roles`
    return 'Companies hiring now'
  }, [activeFn, workMode])

  const firstChunk = paginated.slice(0, DISCOVERY_AFTER)
  const restChunk = paginated.slice(DISCOVERY_AFTER)
  const showDiscovery = !loading && !error && paginated.length > DISCOVERY_AFTER && discoveryCompanies.length > 0

  const gridClass = view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'flex flex-col gap-3'

  return (
    <div>
      <div className="flex gap-3 flex-wrap items-center mb-4">
        <JobSearch value={q} onChange={setQ} />
      </div>

      <JobFilters
        functions={functions}
        activeFn={activeFn}
        onFnChange={(fn) => { setPage(1); setActiveFn(fn); if (fn) analytics.jobFilterApplied({ filter_type: 'function', filter_value: fn }) }}
        seniorities={seniorities}
        activeSeniority={activeSeniority}
        onSeniorityChange={(s) => { setPage(1); setActiveSeniority(s); if (s) analytics.jobFilterApplied({ filter_type: 'level', filter_value: s }) }}
        workMode={workMode}
        onWorkModeChange={(m) => { setPage(1); setWorkMode(m); if (m) analytics.jobFilterApplied({ filter_type: 'work_mode', filter_value: m }) }}
        cities={cities}
        activeCity={activeCity}
        onCityChange={(c) => { setPage(1); setActiveCity(c); if (c) analytics.jobFilterApplied({ filter_type: 'location', filter_value: c }) }}
        postedFilter={postedFilter}
        onPostedFilterChange={(p) => { setPage(1); setPostedFilter(p); if (p) analytics.jobFilterApplied({ filter_type: 'posted', filter_value: p }) }}
      />

      <div className="flex items-center gap-3 my-6 flex-wrap">
        {!loading && !error && (
          <div className="font-mono text-xs text-text-tertiary">
            {sorted.length.toLocaleString()} open role{sorted.length !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <SortToggle sort={sort} onChange={setSort} disabled={!q} />
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {error && (
        <p className="text-red text-sm py-8">Couldn&#8217;t load jobs right now: {error}</p>
      )}

      {loading && (
        <div className={gridClass}>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className={view === 'grid' ? 'h-[110px]' : 'h-[76px]'} />
          ))}
        </div>
      )}

      {!loading && !error && sorted.length === 0 && <EmptyState query={q} />}

      {!loading && !error && sorted.length > 0 && (
        <>
          <div className={gridClass}>
            {firstChunk.map((job, i) => (
              <JobCard key={job.id} job={job} query={q} compact={view === 'grid'} index={i} />
            ))}
          </div>

          {showDiscovery && (
            <div className="my-8 bg-bg-surface border border-border-subtle rounded-lg p-5 md:p-6">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-display text-xl">{discoveryHeading}</h3>
              </div>
              <p className="text-text-tertiary text-[13px] mb-5">Companies with the most relevant open roles.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {discoveryCompanies.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/companies/${c.slug}`}
                    className="flex items-center gap-2.5 bg-bg-elevated rounded-md px-3 py-2.5 transition-colors hover:bg-bg-sunken"
                  >
                    <CompanyLogo name={c.name} color={c.color} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-text-primary truncate">{c.name}</div>
                      <div className="font-mono text-[10.5px] text-text-tertiary">{c.totalRoles} role{c.totalRoles !== 1 ? 's' : ''}</div>
                    </div>
                    <ArrowRight size={13} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link to="/companies" className="inline-block text-[13px] text-accent hover:underline mt-5">
                Explore all companies →
              </Link>
            </div>
          )}

          {restChunk.length > 0 && (
            <div className={gridClass}>
              {restChunk.map((job, i) => (
                <JobCard key={job.id} job={job} query={q} compact={view === 'grid'} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {hasMore && !loading && (
        <div className="text-center mt-6">
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Load {Math.min(PAGE_SIZE, sorted.length - paginated.length)} more
          </Button>
        </div>
      )}
    </div>
  )
}

function SortToggle({ sort, onChange, disabled }: { sort: SortMode; onChange: (s: SortMode) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onChange(sort === 'newest' ? 'relevant' : 'newest')}
      disabled={disabled}
      title={disabled ? 'Search for something to sort by relevance' : undefined}
      className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed border border-border-default rounded-md px-3 py-1.5 transition-colors"
    >
      <ArrowDownAZ size={13} aria-hidden="true" />
      {sort === 'newest' ? 'Newest' : 'Most relevant'}
    </button>
  )
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-bg-surface border border-border-default rounded-md p-1">
      <button
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          view === 'grid' ? 'bg-accent-soft text-accent' : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        <LayoutGrid size={14} aria-hidden="true" />
        Grid
      </button>
      <button
        onClick={() => onChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          view === 'list' ? 'bg-accent-soft text-accent' : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        <ListIcon size={14} aria-hidden="true" />
        List
      </button>
    </div>
  )
}
