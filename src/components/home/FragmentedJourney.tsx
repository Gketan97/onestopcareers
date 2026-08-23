import { Youtube, Linkedin, MessageCircle, Users2, FileText, Sparkles } from 'lucide-react'

const scattered = [
  { icon: Linkedin, label: 'Job boards' },
  { icon: Youtube, label: 'Courses & videos' },
  { icon: MessageCircle, label: 'WhatsApp groups' },
  { icon: Users2, label: 'Mentors & friends' },
  { icon: FileText, label: 'Resume tools' },
  { icon: Sparkles, label: 'AI, changing weekly' },
]

// Visualizes "fragmented career journey -> one platform" without being
// negative or fear-based (per brief §4) — six quiet labeled nodes
// converging toward the center, not a chaotic mess of icons.
export default function FragmentedJourney() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {scattered.map(({ icon: Icon, label }, i) => (
        <div
          key={label}
          className="flex flex-col items-center text-center gap-2.5 p-4 rounded-md border border-border-subtle bg-bg-surface animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Icon size={20} className="text-text-tertiary" aria-hidden="true" />
          <span className="text-xs text-text-tertiary leading-snug">{label}</span>
        </div>
      ))}
    </div>
  )
}
