import { useEffect, useState } from 'react'
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
      {/* Hero */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16">
        <div className="font-mono text-xs uppercase tracking-wide text-accent mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          Cut the crap.
        </div>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] max-w-3xl">
          You know how to job search. You just don&apos;t do it <em className="text-accent not-italic italic">daily.</em>
        </h1>
        <p className="mt-7 text-lg text-text-secondary max-w-lg leading-relaxed">
          &ldquo;I&apos;ll apply this weekend&rdquo; becomes next Wednesday, becomes next
          month — and 500 people already applied before you opened the tab.
          We don&apos;t teach you more. We make sure today happens.
        </p>
        <div className="flex gap-3.5 mt-10 items-center flex-wrap">
          <Link to="/jobs"><Button>Browse jobs →</Button></Link>
          <Button variant="secondary" title="Coming soon">Get alerts on WhatsApp</Button>
        </div>
      </section>

      {/* Fresh this week */}
      <section className="bg-bg-sunken py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1040px] mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl">Fresh this week</h2>
            <Link to="/jobs" className="text-[13px] text-accent font-medium">See all jobs →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {loading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[92px]" />)}
            {!loading && jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </section>

      {/* Why this exists */}
      <section className="max-w-[720px] mx-auto px-6 md:px-12 pt-20 md:pt-24 text-center">
        <h2 className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-5">
          Why this exists
        </h2>
        <p className="font-display text-2xl md:text-[28px] leading-snug">
          You don&apos;t need another &ldquo;how to job search&rdquo; video. You&apos;ve watched
          five. We&apos;re not here to teach you what to do — you already know. We&apos;re here
          to make sure you actually do it, every day, before it&apos;s too late.
        </p>
      </section>

      {/* WhatsApp alerts CTA */}
      <div className="max-w-[1040px] mx-auto my-24 px-6 md:px-12">
        <div className="bg-text-primary rounded-lg px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/[0.15] text-white px-3 py-1.5 rounded-full font-mono text-[11px] mb-4">
              ● whatsapp alerts
            </div>
            <h3 className="font-display text-2xl md:text-[30px] text-bg-base leading-snug">
              You didn&apos;t apply today.<br />You won&apos;t tomorrow either.
            </h3>
            <p className="text-white/60 mt-3 text-[15px] max-w-md leading-relaxed">
              Not because you&apos;re lazy — &ldquo;later&rdquo; just always wins when nothing&apos;s
              forcing your hand. The moment a matching role goes live, it&apos;s in your
              WhatsApp. You either act right then, or you don&apos;t — but you&apos;ll never
              lose to &ldquo;I didn&apos;t see it.&rdquo;
            </p>
          </div>
          <Button className="whitespace-nowrap" title="Coming soon — Milestone 3">
            Set up alerts →
          </Button>
        </div>
      </div>
    </Layout>
  )
}
