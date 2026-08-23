import { CheckCircle2, Circle, Target } from 'lucide-react'

// Illustrative only — no real career-path engine exists yet. Framed
// inside ProductFrame with status="preview" so this never reads as a
// live feature. Content is generic on purpose (not personalized to any
// real user), since faking personalization would be a worse claims-audit
// violation than the mockup itself.
export default function CareerPathPreview() {
  const steps = [
    { done: true, label: 'Learn SQL fundamentals' },
    { done: true, label: 'Build your first analytics project' },
    { done: false, label: 'Get feedback from your Career Circle', current: true },
    { done: false, label: 'Apply to your first 5 roles' },
  ]
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Target size={16} className="text-accent" aria-hidden="true" />
        <span className="text-sm font-medium">Your next steps</span>
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            {s.done ? (
              <CheckCircle2 size={18} className="text-green flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle size={18} className={s.current ? 'text-accent flex-shrink-0' : 'text-text-tertiary flex-shrink-0'} aria-hidden="true" />
            )}
            <span className={s.done ? 'text-sm text-text-tertiary line-through' : s.current ? 'text-sm text-text-primary font-medium' : 'text-sm text-text-secondary'}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
