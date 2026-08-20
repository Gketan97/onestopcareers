import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import JobCard from '../components/jobs/JobCard'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import type { Job } from '../lib/jobs/types'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
      .then((all) => setJobs(all.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      {/* ===================== PLATFORM HERO ===================== */}
      {/* Pain-point stack → resolve. This is the brand-level promise —
          applies to Jobs AND every future module (Resources, Success
          stories, CareerCircle). It answers "why trust this site at all,"
          not "why use this specific service." */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16">
        <div className="font-mono text-xs uppercase tracking-wide text-accent mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          Cut the crap.
        </div>

        <div className="flex flex-col gap-2.5 max-w-xl mb-10">
          <PainLine>Unsure where to find the right jobs?</PainLine>
          <PainLine>Unsure where to find resources that actually help?</PainLine>
          <PainLine>Unsure which YouTube path to trust?</PainLine>
          <PainLine>Unsure what the roadmap to your dream role even looks like?</PainLine>
        </div>

        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] max-w-3xl">
          If that&apos;s you, OneStopCareers <em className="text-accent not-italic italic">is for you.</em>
        </h1>
        <p className="mt-7 text-lg text-text-secondary max-w-xl leading-relaxed">
          Every job, resource, and recommendation here is expert-vetted first
          — so you&apos;re never guessing which YouTube video, AI answer, or
          recycled advice thread to trust.
        </p>

        <div className="flex flex-wrap gap-x-8 gap-y-3 mt-12 pt-8 border-t border-border-subtle max-w-2xl">
          <TrustItem>Every listing checked by hand — not scraped and dumped</TrustItem>
          <TrustItem>No AI-generated links that go nowhere</TrustItem>
        </div>
      </section>

      {/* ===================== SERVICES STRIP ===================== */}
      {/* Establishes platform breadth up front — Jobs isn't presented as
          "the site," it's presented as the first live piece of a bigger
          platform. Resources/Success stories are honest "coming soon"
          states, not dead links. */}
      <section className="bg-bg-sunken px-6 md:px-12 py-14 md:py-16">
        <div className="max-w-[1040px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <ServiceCard
            label="Jobs"
            status="live"
            title="Roles from 200+ companies"
            description="Checked daily. Apply before the first 500 do."
            href="/jobs"
          />
          <ServiceCard
            label="CareerCircle"
            status="live"
            title="A community, not a crowd"
            description="Peer support, referrals, and 5x the job updates."
            href="/career-circle"
          />
          <ServiceCard
            label="Resources"
            status="soon"
            title="Guides worth your time"
            description="Vetted the same way as everything else here."
          />
          <ServiceCard
            label="Success stories"
            status="soon"
            title="How people actually got in"
            description="Real outcomes, not case-interview theory."
          />
        </div>
      </section>

      {/* ===================== JOBS SERVICE SECTION ===================== */}
      {/* This is deliberately scoped to ONE service, not the platform.
          The pain point here (discipline/execution) is specific to job
          search — it does not belong in the platform hero above. */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 pt-24 md:pt-28 pb-16">
        <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-5">
          Jobs — live now
        </div>
        <h2 className="font-display text-4xl md:text-[56px] leading-[1.08] max-w-3xl">
          You know how to job search.
          You just don&apos;t do it <em className="text-accent not-italic italic">daily.</em>
        </h2>
        <p className="mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
          &ldquo;I&apos;ll apply this weekend&rdquo; becomes next Wednesday, becomes next
          month — and 500 people already applied before you opened the tab.
          We don&apos;t teach you more. We make sure today happens.
        </p>
        <div className="flex gap-3.5 mt-10 items-center flex-wrap">
          <Link to="/jobs"><Button>Browse jobs →</Button></Link>
        </div>
      </section>

      {/* Fresh this week */}
      <section className="bg-bg-sunken py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1040px] mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h3 className="font-display text-3xl">Fresh this week</h3>
            <Link to="/jobs" className="text-[13px] text-accent font-medium">See all jobs →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {loading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[92px]" />)}
            {!loading && jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </section>

      {/* WhatsApp job-alerts CTA was removed here — that job was folded into
          CareerCircle (§8 in the design doc explains the decision).
          CareerCircle is already promoted above via the Services strip and
          the nav CTA, and has its own closing CTA on its own page — a third
          pitch for it here would be redundant, not reinforcing. */}
    </Layout>
  )
}

function PainLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-lg text-text-secondary flex items-start gap-3">
      <span className="text-accent mt-1">—</span>
      {children}
    </p>
  )
}

function TrustItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-text-secondary">
      <span className="text-green">✓</span>
      {children}
    </div>
  )
}

function ServiceCard({
  label,
  status,
  title,
  description,
  href,
}: {
  label: string
  status: 'live' | 'soon'
  title: string
  description: string
  href?: string
}) {
  const content = (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-6 h-full transition-colors hover:border-border-default">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
          {label}
        </span>
        {status === 'live' ? (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-green">
            <span className="w-1.5 h-1.5 rounded-full bg-green" /> live
          </span>
        ) : (
          <span className="text-[11px] font-mono text-text-tertiary">soon</span>
        )}
      </div>
      <h3 className="font-display text-xl mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  )

  return href ? (
    <Link to={href} className="block h-full">{content}</Link>
  ) : (
    <div className="opacity-70 cursor-default">{content}</div>
  )
}
