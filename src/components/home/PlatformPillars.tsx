import { Search, Hammer, Users, FileCheck2 } from 'lucide-react'

// v2 (2026-08-23): reduced from 5 pillars to 4 per the updated strategy
// brief — AI must not "feel like a disconnected sixth feature." The
// ADAPT pillar is gone; AI's changing context is now a line of copy in
// Home.tsx above this component, woven across the whole journey instead
// of boxed as one more step. Reordered to Discover -> Build -> Connect ->
// Prepare, matching the brief's exact sequence.
const pillars = [
  { icon: Search, label: 'DISCOVER', desc: 'Find the right opportunities and career paths.' },
  { icon: Hammer, label: 'BUILD', desc: 'Develop practical skills and real-world experience.' },
  { icon: Users, label: 'CONNECT', desc: 'Learn from peers, mentors, and people already doing the work.' },
  { icon: FileCheck2, label: 'PREPARE', desc: 'Build your resume, portfolio, interview readiness, and career positioning.' },
]

export default function PlatformPillars() {
  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-px bg-border-default" aria-hidden="true" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
        {pillars.map(({ icon: Icon, label, desc }, i) => (
          <div key={label} className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="relative w-12 h-12 rounded-full bg-bg-base border-2 border-accent-border flex items-center justify-center mb-4 z-10">
              <Icon size={20} className="text-accent" aria-hidden="true" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-primary mb-1.5">{label}</span>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[200px]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
