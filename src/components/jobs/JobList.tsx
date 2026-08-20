import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
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

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [activeFn, setActiveFn] = useState<string | null>(null)
  const [remoteOnly, setRemoteOnly] = useState(false)
  // Grid is the default — denser, more roles visible without scrolling.
  const [view, setView] = useState<ViewMode>('grid')

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

  const filtered = useMemo(() => {
    let result = jobs
    if (q) {
      const ql = q.toLowerCase()
      result = result.filter(
        (j) => j.title.toLowerCase().includes(ql) || j.company.toLowerCase().includes(ql),
      )
    }
    if (activeFn) result = result.filter((j) => j.fn === activeFn)
    if (remoteOnly) result = result.filter((j) => j.mode === 'remote')
    return result
  }, [jobs, q, activeFn, remoteOnly])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length

  return (
    <div>
      <div className="flex gap-3 flex-wrap items-center mb-6">
        <JobSearch value={q} onChange={setQ} />
        <JobFilters
          functions={functions}
          activeFn={activeFn}
          onFnChange={(fn) => {
            setPage(1)
            setActiveFn(fn)
          }}
          remoteOnly={remoteOnly}
          onRemoteToggle={() => {
            setPage(1)
            setRemoteOnly((v) => !v)
          }}
        />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {!loading && !error && (
        <div className="font-mono text-xs text-text-tertiary mb-4">
          {filtered.length.toLocaleString()} role{filtered.length !== 1 ? 's' : ''} match
        </div>
      )}

      {error && (
        <p className="text-red text-sm py-8">Couldn&apos;t load jobs right now: {error}</p>
      )}

      {loading && (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'flex flex-col gap-3'}>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className={view === 'grid' ? 'h-[132px]' : 'h-[92px]'} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && <EmptyState query={q} />}

      {!loading && !error && filtered.length > 0 && (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'flex flex-col gap-3'
          }
        >
          {paginated.map((job) => (
            <JobCard key={job.id} job={job} query={q} compact={view === 'grid'} />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center mt-6">
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Load {Math.min(PAGE_SIZE, filtered.length - paginated.length)} more
          </Button>
        </div>
      )}
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-bg-surface border border-border-default rounded-md p-1 ml-auto">
      <button
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          view === 'grid' ? 'bg-accent-soft text-accent' : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => onChange('list')}
        aria-label="List view"
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          view === 'list' ? 'bg-accent-soft text-accent' : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        List
      </button>
    </div>
  )
}
