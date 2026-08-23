import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Filter, Briefcase, FileCheck2, BookOpen, Sparkles,
  Compass, Quote,
} from 'lucide-react'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import JobCard from '../components/jobs/JobCard'
import FragmentedJourney from '../components/home/FragmentedJourney'
import PainPointCards from '../components/home/PainPointCards'
import PlatformPillars from '../components/home/PlatformPillars'
import CareerCircleMockup from '../components/home/CareerCircleMockup'
import AITransition from '../components/home/AITransition'
import CareerJourney from '../components/home/CareerJourney'
import { fetchJobs } from '../lib/jobs/fetchJobs'
import type { Job } from '../lib/jobs/types'

// Full homepage rebuild, 2026-08-23, per a complete strategy brief the
// user provided directly. Two deliberate overrides from that brief,
// documented in design doc §3 home-page-v7 note:
//   1. Jobs section uses REAL live data (fetchJobs), not the brief's
//      suggested fictional sample cards — we already have real ones.
//   2. No testimonials at all, not even labeled-sample ones (stricter
//      than the labeled-dummy approach shipped last round) — the brief
//      explicitly forbids fabricated quotes, even placeholder-labeled.

export default function Home() {
  const [allJobs, setAllJobs] = useState<Job[] | null>(null)

  useEffect(() => {
    fetchJobs()
      .then(setAllJobs)
      .catch(() => setAllJobs([]))
  }, [])

  const analyticsJobs = useMemo(
    () => (allJobs ?? []).filter((j) => j.fn === 'data'),
    [allJobs],
  )
  const analyticsCount = allJobs === null ? null : analyticsJobs.length

  return (
    <Layout>
      {/* ===================== HERO ===================== */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-20 text-center">
        <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-6 animate-fade-in-up">
          Built for people building careers in analytics.
        </div>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] animate-blur-in">
          Build a better <em className="text-accent not-italic italic">analytics career.</em>
        </h1>
        <p className="mt-6 text-xl text-text-secondary leading-relaxed max-w-xl mx-auto animate-blur-in" style={{ animationDelay: '80ms' }}>
          Everything you need to grow in analytics — opportunities, real-world
          experience, people to learn from, and a path to stay ahead of AI.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-9 items-center justify-center animate-blur-in" style={{ animationDelay: '150ms' }}>
          <Link to="/jobs">
            <Button className="group">
              Start Building My Career
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary">Explore Analytics Jobs</Button>
          </Link>
        </div>
      </section>

      {/* ===================== CORE PROBLEM ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[1040px] mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl leading-tight mb-5">
            Your analytics career is more than a job search.
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed mb-12">
            Right now, building an analytics career means stitching together
            a job board here, a course there, a WhatsApp group somewhere else
            — and trying to make sense of AI on your own in between. We bring
            it together instead.
          </p>
          <FragmentedJourney />
        </div>
      </section>

      {/* ===================== FOUR PAIN POINTS ===================== */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <PainPointCards />
      </section>

      {/* ===================== PLATFORM PILLARS ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[1040px] mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-16">
            One career. Everything you need to move it forward.
          </h2>
          <PlatformPillars />
        </div>
      </section>

      {/* ===================== CAREER CIRCLE ===================== */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-5">
              A peer network, not another group chat.
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.1]">
              You shouldn&#8217;t have to figure out your career alone.
            </h2>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              Meet your Career Circle — a small peer network of analytics
              professionals at a similar stage of their journey. Share
              opportunities, exchange referrals, discuss interviews, ask the
              question you&#8217;re embarrassed to ask anywhere else, and learn
              from people who&#8217;ve actually lived it.
            </p>
            <div className="flex gap-3.5 mt-8 items-center flex-wrap">
              <Link to="/career-circle">
                <Button variant="secondary" className="group">
                  Join a Career Circle
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
          <CareerCircleMockup />
        </div>
      </section>

      {/* ===================== JOBS ===================== */}
      {/* Real live data (fetchJobs), not the brief's suggested fictional
          sample cards — see the override note at the top of this file. */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl leading-[1.1]">
              Find analytics opportunities worth your time.
            </h2>
            <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-lg mx-auto">
              Spend less time searching and more time applying to roles that
              actually fit where you&#8217;re headed.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center mb-8 flex-wrap">
            <Filter size={13} className="text-text-tertiary" aria-hidden="true" />
            {['Role', 'Experience', 'Location', 'Remote', 'Skills'].map((f) => (
              <span key={f} className="font-mono text-[11px] text-text-tertiary border border-border-default rounded-full px-3 py-1.5">{f}</span>
            ))}
            <span className="font-mono text-[11px] text-text-tertiary ml-1">— filter on the full Jobs page</span>
          </div>

          <div className="rounded-lg border border-border-default bg-bg-surface overflow-hidden shadow-lg max-w-[720px] mx-auto">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-subtle bg-bg-elevated">
              <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
              <span className="ml-3 font-mono text-[11px] text-text-tertiary">onestopcareers.com/jobs</span>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[11px] text-text-tertiary">
                  {analyticsCount === null ? 'Loading live data\u2026' : `${analyticsCount.toLocaleString()} analytics roles live right now`}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> live
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {allJobs === null && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[92px]" />)}
                {allJobs !== null && analyticsJobs.length === 0 && (
                  <p className="text-sm text-text-tertiary py-6 text-center">No analytics roles matched right now &mdash; check back soon.</p>
                )}
                {allJobs !== null && analyticsJobs.slice(0, 3).map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Link to="/jobs">
              <Button className="group">
                Explore Analytics Jobs
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FUTURE VISION ===================== */}
      <section id="future-vision" className="max-w-[1040px] mx-auto px-6 md:px-12 py-20 md:py-24 scroll-mt-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl leading-[1.1]">And we&#8217;re just getting started.</h2>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-lg mx-auto">
            Your career doesn&#8217;t stop at finding a job. We&#8217;re building the
            tools, experiences, and community to help you keep growing long
            after you land one.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <RoadmapCard icon={Briefcase} title="Real-world projects" desc="Build proof of what you can actually do." />
          <RoadmapCard icon={FileCheck2} title="Resume & interview support" desc="Turn your experience into a stronger career story." />
          <RoadmapCard icon={BookOpen} title="Curated resources" desc="Spend less time searching and more time learning what matters." />
          <RoadmapCard icon={Sparkles} title="AI readiness" desc="Understand how analytics work is changing — and how to stay valuable." />
          <RoadmapCard icon={Compass} title="Career guidance" desc="Know what to focus on next as your career evolves." />
        </div>
      </section>

      {/* ===================== AI ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl leading-[1.1]">
              Analytics is changing. Your career should evolve with it.
            </h2>
            <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-xl mx-auto">
              AI is making technical execution faster. That makes analytical
              thinking, problem framing, business judgment, communication,
              and the ability to work effectively with AI more important
              &mdash; not less.
            </p>
          </div>
          <AITransition />
          <div className="flex justify-center mt-10">
            <a href="#future-vision">
              <Button variant="secondary" className="group">
                Prepare for What&#8217;s Next
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== CAREER JOURNEY ===================== */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-4">
          A platform for your whole career, not just your next job.
        </h2>
        <p className="text-text-secondary text-center max-w-lg mx-auto leading-relaxed mb-16">
          One Stop Careers stays useful throughout your career &mdash; not
          only when you&#8217;re looking for a job.
        </p>
        <CareerJourney />
      </section>

      {/* ===================== SOCIAL PROOF (NO FABRICATED QUOTES) ===================== */}
      {/* Per the brief: do NOT invent testimonials, not even labeled
          placeholders. Structurally ready for real quotes, empty until
          they exist. See design doc §3 override note. */}
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

      {/* ===================== FINAL CTA ===================== */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 py-24 md:py-28 text-center">
        <h2 className="font-display text-4xl md:text-6xl leading-[1.08]">
          Your next career move starts here.
        </h2>
        <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl mx-auto">
          Whether you&#8217;re looking for your next opportunity, figuring out
          what to learn, or preparing for the future of analytics &mdash; you
          don&#8217;t have to figure it out alone.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-9 items-center justify-center">
          <Link to="/jobs">
            <Button className="group">
              Start Building My Career
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary">Explore Analytics Jobs</Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}

function RoadmapCard({ icon: Icon, title, desc }: { icon: typeof Briefcase; title: string; desc: string }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon size={18} className="text-text-tertiary" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary border border-border-default rounded-full px-2.5 py-1">
          Coming soon
        </span>
      </div>
      <h3 className="font-display text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
    </div>
  )
}
