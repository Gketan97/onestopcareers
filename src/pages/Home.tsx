import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Quote } from 'lucide-react'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import JobCard from '../components/jobs/JobCard'
import PlatformPillars from '../components/home/PlatformPillars'
import ProductFrame from '../components/home/ProductFrame'
import CareerPathPreview from '../components/home/CareerPathPreview'
import ProjectsPreview from '../components/home/ProjectsPreview'
import CareerPrepPreview from '../components/home/CareerPrepPreview'
import CareerCircleMockup from '../components/home/CareerCircleMockup'
import AITransition from '../components/home/AITransition'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import type { Job } from '../lib/jobs/types'

// Full homepage rebuild, 2026-08-23, from a second strategy brief with a
// stricter narrative discipline than the first: "do not repeat the same
// promise in multiple sections," and pain-point cards explicitly
// forbidden immediately after the problem section (they'd restate it).
// Answers, in order: What is this? -> Why do I need it? -> How does it
// work? -> Show me the product -> Can I trust it? -> What do I do next?
// See design doc for the full reasoning behind what was cut/consolidated
// from the previous rebuild to avoid repetition.

export default function Home() {
  const [allJobs, setAllJobs] = useState<Job[] | null>(null)

  useEffect(() => {
    fetchJobs().then(setAllJobs).catch(() => setAllJobs([]))
  }, [])

  const analyticsJobs = useMemo(
    () => (allJobs ?? []).filter((j) => j.fn === 'data'),
    [allJobs],
  )
  const analyticsCount = allJobs === null ? null : analyticsJobs.length

  return (
    <Layout>
      {/* ===================== 1. HERO — what is this? ===================== */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-20 text-center">
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] animate-blur-in">
          Fast-Track Your <em className="text-accent not-italic italic">Analytics Career.</em>
        </h1>
        <p className="mt-6 text-xl text-text-secondary leading-relaxed max-w-xl mx-auto animate-blur-in" style={{ animationDelay: '80ms' }}>
          Know what to learn, what to build, and what to do next.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-9 items-center justify-center animate-blur-in" style={{ animationDelay: '150ms' }}>
          <a href="#product">
            <Button className="group">
              Build My Career Path
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </a>
          <Link to="/jobs">
            <Button variant="secondary">Explore Opportunities</Button>
          </Link>
        </div>
      </section>

      {/* ===================== 3. HOW IT WORKS ===================== */}
      {/* AI is not a fifth pillar here &mdash; it's named as the changing
          context the other four operate inside, per the brief's explicit
          instruction not to let it read as a disconnected feature. */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <div className="text-center mb-4">
          <h2 className="font-display text-3xl md:text-4xl">
            One career. One clear path forward.
          </h2>
          <p className="text-text-tertiary text-sm mt-3 max-w-md mx-auto">
            All four, against the same backdrop: AI is changing what
            analytics work even means &mdash; underneath everything below,
            not off to the side as one more thing to learn.
          </p>
        </div>
        <div className="mt-12">
          <PlatformPillars />
        </div>
      </section>

      {/* ===================== 4. SHOW THE PRODUCT — can I trust it? ===================== */}
      <div id="product" className="scroll-mt-6">
        {/* 4a. Career Path — preview */}
        <section className="bg-bg-sunken px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">Career Path</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">What should I do next?</h3>
              <p className="mt-5 text-text-secondary leading-relaxed">
                A clear view of where you are and what actually moves you
                forward &mdash; not a generic syllabus, a path built around
                your specific stage.
              </p>
            </div>
            <ProductFrame label="Career Path" status="preview">
              <CareerPathPreview />
            </ProductFrame>
          </div>
        </section>

        {/* 4b. Opportunities / Jobs — live, real data */}
        <section className="px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="lg:order-2">
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">Opportunities</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">Where can I go?</h3>
              <p className="mt-5 text-text-secondary leading-relaxed">
                Real analytics roles, pulled straight from company career
                pages &mdash; refreshed daily, checked before they reach you.
              </p>
              <div className="mt-6">
                <Link to="/jobs">
                  <Button className="group">
                    Explore Opportunities
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:order-1">
              <ProductFrame label="onestopcareers.com/jobs" status="live">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] text-text-tertiary">
                    {analyticsCount === null ? 'Loading live data…' : `${analyticsCount.toLocaleString()} analytics roles live right now`}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {allJobs === null && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[92px]" />)}
                  {allJobs !== null && analyticsJobs.length === 0 && (
                    <p className="text-sm text-text-tertiary py-6 text-center">No analytics roles matched right now.</p>
                  )}
                  {allJobs !== null && analyticsJobs.slice(0, 3).map((job, i) => <JobCard key={job.id} job={job} index={i} compact />)}
                </div>
              </ProductFrame>
            </div>
          </div>
        </section>

        {/* 4c. Projects / Learning — preview */}
        <section className="bg-bg-sunken px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">Projects &amp; Learning</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">How do I build capability?</h3>
              <p className="mt-5 text-text-secondary leading-relaxed">
                Real-world practice, not another course you don&#8217;t
                finish &mdash; something you can actually point to.
              </p>
            </div>
            <ProductFrame label="Projects" status="preview">
              <ProjectsPreview />
            </ProductFrame>
          </div>
        </section>

        {/* 4d. Career Circle / Community */}
        <section className="px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="lg:order-2">
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">Career Circle</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">Who can help me?</h3>
              <p className="mt-5 text-text-secondary leading-relaxed">
                A small peer network, not another group chat &mdash; people
                at your exact stage, sharing referrals and answering the
                question you&#8217;re embarrassed to ask anywhere else.
              </p>
              <div className="mt-6">
                <Link to="/career-circle">
                  <Button variant="secondary" className="group">
                    Learn more
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:order-1">
              <CareerCircleMockup />
            </div>
          </div>
        </section>

        {/* 4e. Career preparation — preview */}
        <section className="bg-bg-sunken px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">Career Preparation</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">How do I present myself?</h3>
              <p className="mt-5 text-text-secondary leading-relaxed">
                Turn what you&#8217;ve actually done into a resume,
                portfolio, and interview story that holds up.
              </p>
            </div>
            <ProductFrame label="Career Prep" status="preview">
              <CareerPrepPreview />
            </ProductFrame>
          </div>
        </section>

        {/* 4f. AI readiness */}
        <section className="px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-[1040px] mx-auto">
            <div className="text-center mb-10">
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-4">AI Readiness</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">How do I stay relevant?</h3>
              <p className="mt-5 text-text-secondary leading-relaxed max-w-lg mx-auto">
                AI is making technical execution faster &mdash; that makes
                judgment, framing, and business thinking more valuable, not less.
              </p>
            </div>
            <AITransition />
          </div>
        </section>
      </div>

      {/* ===================== 5. PROOF — can I trust it? ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[1040px] mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-10">
            Built around how analytics careers actually work.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-14">
            {['Real opportunities.', 'Real people.', 'Real work.', 'Real career growth.'].map((line) => (
              <div key={line} className="font-display text-lg text-text-secondary">{line}</div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-dashed border-border-default rounded-md p-6 flex flex-col items-center justify-center gap-3 min-h-[140px]">
                <Quote size={18} className="text-text-tertiary" aria-hidden="true" />
                <span className="font-mono text-[11px] text-text-tertiary">Real member story, coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 6. FINAL CTA — what do I do next? ===================== */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 py-24 md:py-28 text-center">
        <h2 className="font-display text-4xl md:text-6xl leading-[1.08]">
          Ready to move your analytics career forward?
        </h2>
        <div className="flex flex-wrap gap-3.5 mt-9 items-center justify-center">
          <Link to="/jobs">
            <Button className="group">
              Build My Career Path
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
