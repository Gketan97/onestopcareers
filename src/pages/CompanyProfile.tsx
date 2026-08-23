import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '../components/shell/Layout'
import Skeleton from '../components/ui/Skeleton'
import CompanyAvatar from '../components/jobs/CompanyAvatar'
import JobCard from '../components/jobs/JobCard'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import { deriveCompanies, type CompanyAggregate } from '../lib/jobs/companies'
import type { Job } from '../lib/jobs/types'

export default function CompanyProfile() {
  const { slug } = useParams()
  const [jobs, setJobs] = useState<Job[] | null>(null)

  useEffect(() => {
    fetchJobs().then(setJobs).catch(() => setJobs([]))
  }, [])

  if (jobs === null) {
    return (
      <Layout>
        <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-14">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    )
  }

  const company: CompanyAggregate | undefined = deriveCompanies(jobs).find((c) => c.slug === slug)

  if (!company) {
    return <Navigate to="/companies" replace />
  }

  return (
    <Layout>
      <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-14">
        <Link to="/companies" className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft size={15} aria-hidden="true" />
          All companies
        </Link>

        <div className="flex items-center gap-4">
          <CompanyAvatar name={company.name} color={company.color} size={56} />
          <div>
            <h1 className="font-display text-3xl md:text-4xl">{company.name}</h1>
            <p className="text-text-secondary text-sm mt-1">
              {company.totalRoles} open role{company.totalRoles !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mt-6">
          {Object.entries(company.byFunction).map(([fn, count]) => (
            <span key={fn} className="text-xs font-mono capitalize text-text-secondary border border-border-default rounded-full px-3 py-1.5">
              {fn} · {count}
            </span>
          ))}
        </div>

        <h2 className="font-mono text-xs uppercase tracking-wide text-text-tertiary mt-10 mb-4">
          Open roles
        </h2>
        <div className="flex flex-col gap-3">
          {company.jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
        </div>
      </div>
    </Layout>
  )
}
