import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/shell/Layout'
import Skeleton from '../components/ui/Skeleton'
import CompanyAvatar from '../components/jobs/CompanyAvatar'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import { deriveCompanies, type CompanyAggregate } from '../lib/jobs/companies'
import type { Job } from '../lib/jobs/types'

// Derived entirely from the existing job list — no new crawler fields,
// no separate Company entity/backend. Open-role counts and function
// breakdowns are computed live from real data every time this loads.
// See design doc for why this was chosen over the fuller relational
// Company/Job schema the original brief proposed.
export default function Companies() {
  const [jobs, setJobs] = useState<Job[] | null>(null)

  useEffect(() => {
    fetchJobs().then(setJobs).catch(() => setJobs([]))
  }, [])

  const companies: CompanyAggregate[] | null = jobs ? deriveCompanies(jobs) : null

  return (
    <Layout>
      <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-14">
        <h1 className="font-display text-4xl md:text-[42px]">Companies</h1>
        <p className="text-text-secondary mt-2.5 text-[15px]">
          Explore companies hiring across the market — updated with every crawl, not a static directory.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies === null && [...Array(9)].map((_, i) => <Skeleton key={i} className="h-[104px]" />)}
          {companies !== null && companies.map((c, i) => (
            <Link
              key={c.slug}
              to={`/companies/${c.slug}`}
              className="animate-fade-in-up bg-bg-surface border border-border-subtle rounded-md p-5 flex flex-col gap-3 transition-all hover:border-border-default hover:-translate-y-px hover:shadow-md"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <div className="flex items-center gap-3">
                <CompanyAvatar name={c.name} color={c.color} size={36} />
                <span className="font-medium truncate">{c.name}</span>
              </div>
              <div className="font-mono text-[11px] text-text-tertiary">
                {c.totalRoles} open role{c.totalRoles !== 1 ? 's' : ''}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {Object.keys(c.byFunction).slice(0, 3).map((fn) => (
                  <span key={fn} className="text-[10px] font-mono capitalize text-text-tertiary bg-bg-sunken px-2 py-0.5 rounded-sm">
                    {fn}
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
