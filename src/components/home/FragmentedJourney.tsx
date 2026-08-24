// STATUS: unused as of 2026-08-23 — the user removed the entire Problem
// section from Home.tsx that this component lived in ("Your analytics
// career is more than a job search."). Left in the repo, not deleted,
// per standing practice.
import { Youtube, Linkedin, MessageCircle, Users2, FileText, Sparkles } from 'lucide-react'

const scattered = [
  { icon: Linkedin, label: 'Job boards', rotate: -3, y: 4 },
  { icon: Youtube, label: 'Courses & videos', rotate: 2, y: -6 },
  { icon: MessageCircle, label: 'WhatsApp groups', rotate: -2, y: 8 },
  { icon: Users2, label: 'Mentors & friends', rotate: 3, y: -3 },
  { icon: FileText, label: 'Resume tools', rotate: -4, y: 5 },
  { icon: Sparkles, label: 'AI, changing weekly', rotate: 2, y: -8 },
]

// v2 (2026-08-23): was a uniform bordered-box grid — visually identical
// to PlatformPillars below it, which made the two sections read as
// duplicates despite meaning opposite things (fragmented vs. unified).
// Redesigned as loose, irregularly-tilted tags with no card borders and
// muted styling, so this section visually *feels* scattered — the
// contrast with the clean aligned pillars section is now doing real
// communicative work, not just decoration.
export default function FragmentedJourney() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {scattered.map(({ icon: Icon, label, rotate, y }, i) => (
        <div
          key={label}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-subtle bg-bg-surface animate-fade-in-up"
          style={{
            animationDelay: `${i * 70}ms`,
            transform: `rotate(${rotate}deg) translateY(${y}px)`,
          }}
        >
          <Icon size={15} className="text-text-tertiary opacity-70" aria-hidden="true" />
          <span className="text-xs text-text-tertiary opacity-70">{label}</span>
        </div>
      ))}
    </div>
  )
}
