import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, ArrowDownAZ } from 'lucide-react'
import { fetchJobs } from '../../lib/jobs/fetchJobs'
import type { Job } from '../../lib/jobs/types'
import JobCard from './JobCard'
import JobSearch from './JobSearch'
import JobFilters from './JobFilters'
import EmptyState from './EmptyState'
import Skeleton from '../ui/Skeleton'
import Button from '../ui/Button'

const PAGE_SIZE = 24
type ViewMode = 'grid' | 'list'
type SortMode = 'newest' | 'relevant'

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [activeFn, setActiveFn] = useState<string | null>(null)
  const [activeSeniority, setActiveSeniority] = useState<string | null>(null)
  const [remoteOnly, setRemoteOnly] = useState(false)
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
    if (remoteOnly) result = result.filter((j) => j.mode === 'remote')
    return result
  }, [jobs, q, activeFn, activeSeniority, remoteOnly])

  // "Newest" is genuinely chronological (posted_at desc). "Most relevant"
  // only means something when there's a search query — exact title
  // matches first, then title-contains, then company matches, falling
  // back to recency as a tiebreak. With no query it's identical to
  // Newest, so the toggle is disabled in that state rather than
  // pretending there's a ranking signal we don't have.
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
  const hasMore = paginated.length < sorted.length

  return (
    <div>
      <div className="flex gap-3 flex-wrap items-center mb-4">
        <JobSearch value={q} onChange={setQ} />
        <JobFilters
          functions={functions}
          activeFn={activeFn}
          onFnChange={(fn) => { setPage(1); setActiveFn(fn) }}
          seniorities={seniorities}
          activeSeniority={activeSeniority}
          onSeniorityChange={(s) => { setPage(1); setActiveSeniority(s) }}
          remoteOnly={remoteOnly}
          onRemoteToggle={() => { setPage(1); setRemoteOnly((v) => !v) }}
        />
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {!loading && !error && (
          <div className="font-mono text-xs text-text-tertiary">
            {sorted.length.toLocaleString()} role{sorted.length !== 1 ? 's' : ''} match
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <SortToggle sort={sort} onChange={setSort} disabled={!q} />
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {error && (
        <p className="text-red text-sm py-8">Couldn’t load jobs right now: {error}</p>
      )}

      {loading && (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'flex flex-col gap-3'}>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className={view === 'grid' ? 'h-[132px]' : 'h-[92px]'} />
          ))}
        </div>
      )}

      {!loading && !error && sorted.length === 0 && <EmptyState query={q} />}

      {!loading && !error && sorted.length > 0 && (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'flex flex-col gap-3'
          }
        >
          {paginated.map((job, i) => (
            <JobCard key={job.id} job={job} query={q} compact={view === 'grid'} index={i} />
          ))}
        </div>
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
