import type { ElementType } from 'react'
import { RefreshCw, HeartCrack, Compass, Bot } from 'lucide-react'

interface PainCard {
  icon: ElementType
  headline: string
  solution: string
  product: string
}

const cards: PainCard[] = [
  {
    icon: RefreshCw,
    headline: 'Still refreshing 10 job platforms hoping something new appears?',
    solution: 'Discover analytics opportunities without making job hunting a full-time job.',
    product: 'Jobs',
  },
  {
    icon: HeartCrack,
    headline: 'No one to ask when you’re stuck?',
    solution: 'Learn, share, and grow with people navigating the same stage of their analytics career.',
    product: 'Career Circle',
  },
  {
    icon: Compass,
    headline: 'A hundred roadmaps. A thousand videos. Still don’t know what matters?',
    solution: 'Cut through the noise with practical resources, guidance, and real-world experiences that help you focus on what actually moves your career forward.',
    product: 'Resources + Projects + Career Guidance',
  },
  {
    icon: Bot,
    headline: 'AI can write the SQL. Build the dashboard. So what makes you valuable?',
    solution: 'Build the judgment, problem-solving, communication, business thinking, and AI fluency that the next generation of analytics roles will demand.',
    product: 'AI Readiness + Real Projects',
  },
]

export default function PainPointCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={c.headline}
            className="bg-bg-surface border border-border-subtle rounded-md p-6 md:p-7 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mb-5">
              <Icon size={19} className="text-accent" aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl leading-snug mb-3">{c.headline}</h3>
            <p className="text-text-secondary leading-relaxed mb-4">{c.solution}</p>
            <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">{c.product}</span>
          </div>
        )
      })}
    </div>
  )
}
