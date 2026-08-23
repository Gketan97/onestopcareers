import { CheckCheck } from 'lucide-react'

// Illustrative only, same honesty standard as the testimonials section —
// fictional names, clearly not real screenshots, not styled to pass as
// an actual chat export. Purpose is to make "WhatsApp community" feel
// concrete rather than abstract, the same job the Jobs section's browser
// mockup does for "live data." See design doc §3 home-page-v4 note.
const messages = [
  { name: 'Priya', text: 'Anyone interviewed for a Product Analyst role recently?', mine: false },
  { name: 'Arjun', text: 'Sharing this SQL resource — helped me a lot with window functions', mine: false },
  { name: 'You', text: 'My company is hiring a Data Analyst, sending the link here first', mine: true },
  { name: 'Meera', text: 'Can someone review this case-study approach before my interview tomorrow?', mine: false },
]

export default function CareerCircleMockup() {
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface overflow-hidden shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-bg-elevated">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-green font-mono text-xs" style={{ background: 'rgba(52,211,153,0.15)' }}>50</div>
        <div>
          <div className="text-sm font-medium">Career Circle</div>
          <div className="font-mono text-[10px] text-text-tertiary">Illustrative — not a real chat</div>
        </div>
      </div>
      <div className="p-4 md:p-5 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.mine ? 'bg-accent-soft text-text-primary' : 'bg-bg-elevated text-text-secondary'
              }`}
            >
              {!m.mine && <div className="font-mono text-[10px] text-accent mb-0.5">{m.name}</div>}
              <div>{m.text}</div>
              {m.mine && (
                <div className="flex items-center justify-end gap-1 mt-1 text-text-tertiary">
                  <CheckCheck size={12} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
