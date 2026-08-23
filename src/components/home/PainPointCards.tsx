// STATUS: unused as of 2026-08-23 — removed from Home.tsx per the second
// strategy brief's explicit instruction: "Do NOT add separate repetitive
// pain-point sections immediately after [the problem section]." This
// component's content substantially restated the fragmentation problem
// already covered in Section 2, which the brief's "do not repeat the
// same promise" principle flagged directly. Left in the repo, not
// deleted, per standing practice.
import type { ElementType } from 'react'
import { RefreshCw, HeartCrack, Compass, Bot } from 'lucide-react'

interface PainCard {
  icon: ElementType
  headline: string
  headlineShort: string // mobile-only, cuts the paragraph-length version down
  solution: string
  solutionShort: string
  product: string
}

const cards: PainCard[] = [
  {
    icon: RefreshCw,
    headline: 'Still refreshing 10 job platforms hoping something new appears?',
    headlineShort: 'Refreshing 10 job platforms daily?',
    solution: 'Discover analytics opportunities without making job hunting a full-time job.',
    solutionShort: 'We do the searching for you.',
    product: 'Jobs',
  },
  {
    icon: HeartCrack,
    headline: 'No one to ask when you’re stuck?',
    headlineShort: 'No one to ask when you’re stuck?',
    solution: 'Learn, share, and grow with people navigating the same stage of their analytics career.',
    solutionShort: 'A peer network, not a group chat.',
    product: 'Career Circle',
  },
  {
    icon: Compass,
    headline: 'A hundred roadmaps. A thousand videos. Still don’t know what matters?',
    headlineShort: 'A hundred roadmaps, still lost?',
    solution: 'Cut through the noise with practical resources, guidance, and real-world experiences that help you focus on what actually moves your career forward.',
    solutionShort: 'One clear path, not a hundred.',
    product: 'Resources + Projects + Career Guidance',
  },
  {
    icon: Bot,
    headline: 'AI can write the SQL. Build the dashboard. So what makes you valuable?',
    headlineShort: 'AI writes the SQL now. What’s left for you?',
    solution: 'Build the judgment, problem-solving, communication, business thinking, and AI fluency that the next generation of analytics roles will demand.',
    solutionShort: 'The judgment AI can’t replace.',
    product: 'AI Readiness + Real Projects',
  },
]

// Desktop: static 2x2 grid, full-length copy (was fine, unchanged).
// Mobile: horizontal scroll-snap carousel with shortened copy — the full
// paragraph-length version stacked 4-high was making the page's tallest,
// heaviest scroll on small screens. Scroll-snap (not a JS carousel
// library) keeps this dependency-free and works with native touch
// scrolling rather than fighting it.
export default function PainPointCards() {
  return (
    <>
      <div className="hidden md:grid grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <Card key={c.headline} card={c} index={i} short={false} />
        ))}
      </div>

      <div className="md:hidden -mx-6 px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
        {cards.map((c, i) => (
          <div key={c.headline} className="snap-start flex-shrink-0 w-[82%]">
            <Card card={c} index={i} short />
          </div>
        ))}
      </div>
      <div className="md:hidden flex justify-center gap-1.5 mt-3">
        {cards.map((c) => (
          <span key={c.headline} className="w-1.5 h-1.5 rounded-full bg-border-default" />
        ))}
      </div>
    </>
  )
}

function Card({ card: c, index, short }: { card: PainCard; index: number; short: boolean }) {
  const Icon = c.icon
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-md p-6 md:p-7 h-full animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mb-5">
        <Icon size={19} className="text-accent" aria-hidden="true" />
      </div>
      <h3 className={short ? 'font-display text-xl leading-snug mb-2.5' : 'font-display text-2xl leading-snug mb-3'}>
        {short ? c.headlineShort : c.headline}
      </h3>
      <p className="text-text-secondary leading-relaxed mb-4 text-sm md:text-base">
        {short ? c.solutionShort : c.solution}
      </p>
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">{c.product}</span>
    </div>
  )
}
