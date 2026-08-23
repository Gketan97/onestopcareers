import { Search, Hammer, Users, FileCheck2, ArrowRight } from 'lucide-react'

// v3 (2026-08-23): descriptions made concrete rather than generic —
// "learn from peers, mentors, and people already doing the work"
// (v2's line) could describe almost any career platform. Each pillar
// now names the actual specific mechanism behind it, tying back to real
// parts of the product (Career Circle, real job data) rather than
// staying abstract. Also added a traveling-arrow animation along the
// connector line, giving the "one clear path" idea literal motion
// instead of just a static line.
const pillars = [
  {
    icon: Search,
    label: 'DISCOVER',
    desc: 'Find the right opportunities and career paths.',
    detail: 'Real analytics roles, refreshed daily from company career pages.',
  },
  {
    icon: Hammer,
    label: 'BUILD',
    desc: 'Develop practical skills and real-world experience.',
    detail: 'Projects built on real datasets and real business problems, not another course.',
  },
  {
    icon: Users,
    label: 'CONNECT',
    desc: 'Learn from peers, mentors, and people already doing the work.',
    detail: 'Focused discussions inside a small Career Circle WhatsApp group, not a public feed of thousands.',
  },
  {
    icon: FileCheck2,
    label: 'PREPARE',
    desc: 'Build your resume, portfolio, interview readiness, and career positioning.',
    detail: 'Turn what you actually built into a resume and interview story that holds up.',
  },
]

export default function PlatformPillars() {
  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-px bg-border-default overflow-visible" aria-hidden="true">
        <div className="relative w-full h-full">
          <div className="absolute top-1/2 -translate-y-1/2 animate-travel-arrow">
            <ArrowRight size={14} className="text-accent" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
        {pillars.map(({ icon: Icon, label, desc, detail }, i) => (
          <div key={label} className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="relative w-12 h-12 rounded-full bg-bg-base border-2 border-accent-border flex items-center justify-center mb-4 z-10">
              <Icon size={20} className="text-accent" aria-hidden="true" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-primary mb-1.5">{label}</span>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[210px]">{desc}</p>
            <p className="font-mono text-[10.5px] text-text-tertiary leading-relaxed max-w-[210px] mt-2.5">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
