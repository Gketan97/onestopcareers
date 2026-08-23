// STATUS: unused as of 2026-08-23 — removed from Home.tsx, the user
// flagged it as redundant with the Platform Pillars section (both cover
// the same "we're useful across your whole career" idea, just with
// slightly different labels). Left in the repo, not deleted, per
// standing practice for superseded components.
const stages = [
  { label: 'START', desc: 'Learn the fundamentals' },
  { label: 'BUILD', desc: 'Work on real projects' },
  { label: 'CONNECT', desc: 'Meet peers and mentors' },
  { label: 'PREPARE', desc: 'Strengthen resume + interview skills' },
  { label: 'OPPORTUNITY', desc: 'Find the right role' },
  { label: 'GROW', desc: 'Keep developing' },
  { label: 'ADAPT', desc: 'Stay ahead of AI' },
]

export default function CareerJourney() {
  return (
    <div className="max-w-2xl mx-auto">
      {stages.map((s, i) => (
        <div key={s.label} className="flex gap-5 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
            {i < stages.length - 1 && <div className="w-px flex-1 bg-border-default my-1" />}
          </div>
          <div className={i < stages.length - 1 ? 'pb-8' : ''}>
            <div className="font-mono text-[11px] uppercase tracking-wide text-accent mb-1">{s.label}</div>
            <p className="text-text-secondary">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
