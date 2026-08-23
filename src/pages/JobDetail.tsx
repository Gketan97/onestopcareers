import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, ExternalLink, FileQuestion, Users, Search, BookOpen, Sparkles,
} from 'lucide-react'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import JobCard from '../components/jobs/JobCard'
import JobPostingSchema from '../components/jobs/JobPostingSchema'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import { fetchJobDescription, type JobDescriptionResult } from '../lib/jobs/fetchJobDescription'
import { jobSlug, idFromSlug } from '../lib/jobs/slug'
import type { Job } from '../lib/jobs/types'
import { postedLabel } from '../lib/format'

// Rebuilt 2026-08-23 per the Jobs roadmap brief (Phase 3/4). Real fields
// only — no fabricated "Responsibilities/Requirements" sections, since
// the crawler doesn't capture job descriptions at all. The "About this
// role" section instead calls the new on-demand description function
// (see fetchJobDescription.ts) for real content where the source
// supports it (Greenhouse/Lever/Ashby), and falls back honestly to a
// "view on {company}'s site" link everywhere else — never invented text.
export default function JobDetail() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [allJobs, setAllJobs] = useState<Job[] | null>(null)
  const [job, setJob] = useState<Job | null | undefined>(undefined) // undefined = loading, null = not found
  const [desc, setDesc] = useState<JobDescriptionResult | null>(null) // null = loading

  const id = slug ? idFromSlug(slug) : ''

  useEffect(() => {
    fetchJobs()
      .then((jobs) => {
        setAllJobs(jobs)
        setJob(jobs.find((j) => j.id === id) ?? null)
      })
      .catch(() => setJob(null))
  }, [id])

  useEffect(() => {
    if (!job) return
    setDesc(null)
    fetchJobDescription(job).then(setDesc)
  }, [job])

  // Client-side title/meta — real value for Google (renders JS before
  // indexing), no value for non-JS link-preview bots (WhatsApp/LinkedIn) —
  // that needs real SSR, out of scope here. See design doc §6.
  useEffect(() => {
    if (!job) return
    const prevTitle = document.title
    document.title = `${job.title} at ${job.company} — OneStopCareers`
    let meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? ''
    if (meta) meta.setAttribute('content', `${job.title} at ${job.company}, ${job.city || job.location}. Apply directly — checked and refreshed daily on OneStopCareers.`)
    return () => {
      document.title = prevTitle
      if (meta) meta.setAttribute('content', prevDesc)
    }
  }, [job])

  const similarJobs = useMemo(() => {
    if (!allJobs || !job) return []
    return allJobs.filter((j) => j.fn === job.fn && j.id !== job.id).slice(0, 6)
  }, [allJobs, job])

  const backHref = `/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`

  // Canonicalize: if someone hits an old /jobs/:id-shaped link (pre-slug)
  // or a slightly stale slug, redirect to the current correct slug once
  // the job resolves, rather than serving two URLs for the same job.
  if (job && slug !== jobSlug(job)) {
    return <Navigate to={`/jobs/${jobSlug(job)}${q ? `?q=${encodeURIComponent(q)}` : ''}`} replace />
  }

  return (
    <Layout>
      {job && <JobPostingSchema job={job} />}

      <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-14">
        <Link to={backHref} className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to jobs
        </Link>

        {job === undefined && (
          <div className="mt-8 flex flex-col gap-3 max-w-[720px]">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        )}

        {job === null && (
          <div className="mt-16 animate-fade-in-up">
            <div className="text-center mb-14">
              <div className="w-12 h-12 rounded-full bg-bg-sunken flex items-center justify-center mx-auto mb-4">
                <FileQuestion size={20} className="text-text-tertiary" aria-hidden="true" />
              </div>
              <h1 className="font-display text-3xl mb-2">This role may no longer be accepting applications.</h1>
              <p className="text-text-secondary text-sm">
                It may have closed or moved. <Link to="/jobs" className="text-accent hover:underline">Browse open roles →</Link>
              </p>
            </div>
            {allJobs && allJobs.length > 0 && (
              <div className="max-w-[720px] mx-auto">
                <h2 className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">Similar active roles</h2>
                <div className="flex flex-col gap-3">
                  {allJobs.slice(0, 4).map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {job && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start animate-fade-in-up">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-8 rounded-full" style={{ background: job.color || '#E86B35' }} />
                <span className="text-sm text-text-secondary">{job.company}</span>
              </div>
              <h1 className="font-display text-4xl leading-tight">{job.title}</h1>

              <div className="flex gap-2 flex-wrap mt-5">
                <Badge tone="accent">{job.fn}</Badge>
                {job.city && (
                  <Badge tone="neutral" className="flex items-center gap-1">
                    <MapPin size={11} aria-hidden="true" />
                    {job.city}
                  </Badge>
                )}
                {job.mode && <Badge tone="neutral" className="capitalize">{job.mode}</Badge>}
                {job.seniority && <Badge tone="neutral" className="capitalize">{job.seniority}</Badge>}
              </div>

              <p className="font-mono text-xs text-text-tertiary mt-5">
                Posted {postedLabel(job.posted_at)} · via {job.src}
              </p>

              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <Button className="mt-8 group">
                  Apply on {job.company}
                  <ExternalLink size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
              </a>

              {/* About the role — real fetched content where available,
                  honest fallback everywhere else. Never fabricated. */}
              <div className="mt-10 pt-8 border-t border-border-subtle">
                <h2 className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">About this role</h2>
                {desc === null && (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
                {desc !== null && desc.available && (
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line break-words">{desc.description}</p>
                )}
                {desc !== null && !desc.available && (
                  <p className="text-text-secondary leading-relaxed">
                    The full description lives on {job.company}’s own careers page —
                    we link straight there rather than guessing at what it says.{' '}
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      View on {job.company}’s site →
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar — Career Circle CTA, real link, not a dead one.
                Sticky positioning removed (2026-08-23) — was likely
                causing the "description overflows below the callout"
                bug: a sticky element can visually overlap content
                that follows its container in edge cases. Top-aligned,
                scrolls normally now — lower risk, same information. */}
            <aside className="self-start">
              <div className="border border-border-default rounded-md p-6 bg-bg-surface">
                <Users size={20} className="text-accent mb-3" aria-hidden="true" />
                <p className="font-display text-lg leading-snug mb-2">
                  Don’t just find a job. Build your career.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">
                  Join analytics professionals through Career Circle.
                </p>
                <Link to="/career-circle">
                  <Button variant="secondary" className="w-full justify-center">Join Career Circle →</Button>
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* More opportunities — real data, same function as this role. */}
        {job && similarJobs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border-subtle max-w-[1040px]">
            <h2 className="font-display text-2xl mb-6">
              {job.fn === 'data' ? 'More analytics opportunities' : `More ${job.fn} roles`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {similarJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} compact />)}
            </div>
          </div>
        )}

        {/* Acquisition strip — deliberately minimal per the brief ("don't
            turn the job page into a huge marketing page"). */}
        {job && (
          <div className="mt-16 pt-8 border-t border-border-subtle flex flex-wrap gap-x-8 gap-y-3 max-w-[1040px] font-mono text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1.5"><Search size={12} aria-hidden="true" /> Find opportunities</span>
            <span className="flex items-center gap-1.5"><Users size={12} aria-hidden="true" /> Meet your peers</span>
            <span className="flex items-center gap-1.5"><BookOpen size={12} aria-hidden="true" /> Build real-world skills</span>
            <span className="flex items-center gap-1.5"><Sparkles size={12} aria-hidden="true" /> Stay ahead of AI</span>
          </div>
        )}
      </div>
    </Layout>
  )
}
