import { Search, Users, Hammer, FileCheck2, TrendingUp } from 'lucide-react'

const pillars = [
  { icon: Search, label: 'DISCOVER', desc: 'Find relevant analytics opportunities.' },
  { icon: Users, label: 'CONNECT', desc: 'Build relationships with peers who understand your journey.' },
  { icon: Hammer, label: 'BUILD', desc: 'Develop practical skills through resources and real-world projects.' },
  { icon: FileCheck2, label: 'PREPARE', desc: 'Strengthen your resume, interview skills, and career positioning.' },
  { icon: TrendingUp, label: 'ADAPT', desc: 'Stay relevant as AI changes the analytics profession.' },
]

// A connected system, not five isolated cards — a spine line running
// through all five nodes signals these are parts of one journey, per
// brief §6 ("not random features").
export default function PlatformPillars() {
  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-px bg-border-default" aria-hidden="true" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
        {pillars.map(({ icon: Icon, label, desc }, i) => (
          <div key={label} className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="relative w-12 h-12 rounded-full bg-bg-base border-2 border-accent-border flex items-center justify-center mb-4 z-10">
              <Icon size={20} className="text-accent" aria-hidden="true" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-primary mb-1.5">{label}</span>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[180px]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
