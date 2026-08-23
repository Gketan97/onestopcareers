import { useState, useEffect } from 'react'

// Drives both hero columns from one shared index — the left side spotlights
// one pain point at a time (dimming, not hiding, the other three), the
// right side shows the specific resolve for whichever one is spotlighted.
// Replaces the old rotator's private internal state, which couldn't sync
// anything else to it. See design doc §3 home-page-v6 note.
export function useRotatingIndex(length: number, intervalMs: number) {
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
    if (reducedMotion) return // stays on index 0 — nothing is ever hidden anyway
    const t = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs)
    return () => clearInterval(t)
  }, [reducedMotion, length, intervalMs])

  return { index, reducedMotion }
}
