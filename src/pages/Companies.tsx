import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import Layout from '../components/shell/Layout'
import Skeleton from '../components/ui/Skeleton'
import CompanyLogo from '../components/jobs/CompanyLogo'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import { deriveCompanies, type CompanyAggregate } from '../lib/jobs/companies'
import { fnLabel } from '../lib/jobs/functionLabels'
import type { Job } from '../lib/jobs/types'
import { analytics } from '../lib/analytics/posthog'

// v2 (2026-08-23): a real discovery page, not the Jobs sidebar moved
// elsewhere — gained search and a function filter, real logos (via
// CompanyLogo, matching the Jobs page cards), and card copy reframed
// around Company -> open roles -> areas hiring rather than a bare stat
// block. Still fully derived from the existing job list, no new
// crawler fields or backend.
export default function Companies() {
  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [q, setQ] = useState('')
  const [activeFn, setActiveFn] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs().then(setJobs).catch(() => setJobs([]))
  }, [])

  const allCompanies: CompanyAggregate[] | null = jobs ? deriveCompanies(jobs) : null

  const functions = useMemo(
    () => (allCompanies ? Array.from(new Set(allCompanies.flatMap((c) => Object.keys(c.byFunction)))).sort() : []),
    [allCompanies],
  )

  const companies = useMemo(() => {
    if (!allCompanies) return null
    let result = allCompanies
    if (q) {
      const ql = q.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(ql))
    }
    if (activeFn) result = result.filter((c) => c.byFunction[activeFn] > 0)
    return result
  }, [allCompanies, q, activeFn])

  // Debounced, same reasoning as the Jobs search tracking — avoid
  // flooding analytics with a partial-query event per keystroke.
  useEffect(() => {
    if (!q || companies === null) return
    const t = setTimeout(() => {
      analytics.companiesSearch({ result_count: companies.length, has_query: true })
    }, 600)
    return () => clearTimeout(t)
  }, [q, companies])

  return (
    <Layout>
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-14">
        <h1 className="font-display text-4xl md:text-[42px]">Companies</h1>
        <p className="text-text-secondary mt-2.5 text-[15px] max-w-xl">
          Every company hiring across the market — updated with every crawl, not a static directory.
        </p>

        <div className="flex items-center gap-2.5 bg-bg-surface border border-border-default rounded-md px-4 py-3 mt-8 max-w-md transition-colors focus-within:border-accent">
          <Search size={16} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search companies..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-0 outline-none bg-transparent text-sm w-full text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {functions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <FnPill active={!activeFn} onClick={() => setActiveFn(null)}>All</FnPill>
            {functions.map((fn) => (
              <FnPill key={fn} active={activeFn === fn} onClick={() => setActiveFn(activeFn === fn ? null : fn)}>
                {fnLabel(fn)}
              </FnPill>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies === null && [...Array(9)].map((_, i) => <Skeleton key={i} className="h-[128px]" />)}
          {companies !== null && companies.length === 0 && (
            <p className="text-text-tertiary text-sm py-8 col-span-full text-center">No companies match.</p>
          )}
          {companies !== null && companies.map((c, i) => (
            <Link
              key={c.slug}
              to={`/companies/${c.slug}`}
              className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md p-5 flex flex-col gap-3 transition-all hover:border-accent-border hover:-translate-y-px hover:shadow-lg"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <div className="flex items-center gap-3">
                <CompanyLogo name={c.name} color={c.color} size={40} />
                <div className="min-w-0">
                  <div className="font-display text-lg truncate">{c.name}</div>
                  <div className="font-mono text-[11px] text-text-tertiary">
                    {c.totalRoles} open role{c.totalRoles !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {Object.keys(c.byFunction).slice(0, 3).map((fn) => (
                  <span key={fn} className="text-[10px] font-mono text-text-tertiary bg-bg-sunken px-2 py-0.5 rounded-sm">
                    {fnLabel(fn)}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function FnPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 rounded-full text-[13px] font-medium border whitespace-nowrap transition-colors ${
        active
          ? 'bg-accent-soft border-accent-border text-accent'
          : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary'
      }`}
    >
      {children}
    </button>
  )
}
