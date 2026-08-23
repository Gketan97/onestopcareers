// STATUS: unused as of 2026-08-23 — replaced by PainPointSpotlight.tsx +
// useRotatingIndex.ts. This component hid 3 of 4 pain points behind a
// timer while showing one fixed generic headline on the right regardless
// of which point was active — a real contradiction with "cut the crap"
// (a rotating question with a non-rotating, generic answer). Left in the
// repo, not deleted, in case the single-point-at-a-time pattern is useful
// again elsewhere. See design doc §3 home-page-v6 note.
import { useState, useEffect, type ElementType, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface PainPoint {
  icon: ElementType
  text: ReactNode
  ctaLabel: string
  ctaTo: string
}

const ROTATE_MS = 4800

// v2 (2026-08-23): was a plain fade + static dots — user feedback called
// this out as not state-of-the-art. Upgraded to a timer-fill progress bar
// per point (an Instagram/YouTube-Shorts-story pattern — shows real
// elapsed time, not just position) and a slide+blur transition on the
// text itself instead of a flat fade. Icon now sits in a larger glowing
// badge as its own visual moment, not a small inline glyph.
export default function PainPointRotator({ points }: { points: PainPoint[] }) {
  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const t = setInterval(() => setIndex((i) => (i + 1) % points.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [reducedMotion, points.length])

  const current = points[index]
  const Icon = current.icon
  const isAnchor = current.ctaTo.startsWith('#')

  return (
    <div>
      <div key={index} className="animate-slide-in">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full bg-accent-soft blur-xl" aria-hidden="true" />
          <div className="relative w-16 h-16 rounded-full bg-accent-soft border border-accent-border flex items-center justify-center">
            <Icon size={28} className="text-accent" aria-hidden="true" />
          </div>
        </div>

        <p className="text-3xl md:text-[34px] text-text-primary leading-[1.2] max-w-md font-display">
          {current.text}
        </p>

        {isAnchor ? (
          <a href={current.ctaTo} className="text-[15px] text-accent font-medium hover:underline inline-block mt-5">{current.ctaLabel} →</a>
        ) : (
          <Link to={current.ctaTo} className="text-[15px] text-accent font-medium hover:underline inline-block mt-5">{current.ctaLabel} →</Link>
        )}
      </div>

      {/* Timer-fill progress — shows real elapsed time per point, not
          just position, and doubles as a subtle "this is alive" signal
          even when no text is changing. */}
      <div className="flex gap-2 mt-9 max-w-md">
        {points.map((_, i) => (
          <div key={i} className="h-[3px] flex-1 rounded-full bg-border-default overflow-hidden">
            {i === index && !reducedMotion && (
              <div key={index} className="h-full bg-accent animate-fill-bar" style={{ animationDuration: `${ROTATE_MS}ms` }} />
            )}
            {i < index && <div className="h-full bg-accent" />}
          </div>
        ))}
      </div>
    </div>
  )
}
