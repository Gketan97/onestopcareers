import { Link } from 'react-router-dom'
import type { ElementType } from 'react'
import { Briefcase, Users, BookOpen, Award } from 'lucide-react'

// STATUS: currently unused, not imported anywhere — cut from Home.tsx on
// 2026-08-23. Was justified as "the one way to explore all four services,"
// but by that point the hero already had per-pain-point inline CTAs, a
// quiet explore row, and full dedicated sections for Jobs/CareerCircle —
// this had become a fourth wayfinding mechanism doing the same job the
// other three already did, more slowly. Left in the repo, not deleted,
// in case a future redesign wants the hub-and-spoke concept again. See
// design doc §3 home-page-v4 note for the full reasoning.
//
// Hub-and-spoke layout for the Services strip, desktop only (see Home.tsx
// for the mobile grid fallback — a radial layout doesn't work on narrow
// screens). Inspired by a competitor screenshot the user shared, but
// deliberately NOT copying its gradient-text/glossy-chrome execution —
// that reads as generic AI-startup hype, the opposite of "cut the crap."
// This version stays dark and restrained: thin dashed connector lines,
// one accent color, no gradients. See design doc §3 for the full note.

interface Satellite {
  icon: ElementType
  label: string
  status: 'live' | 'soon'
  title: string
  description: string
  href?: string
  cx: number
  cy: number
}

const W = 880
const H = 460
const HUB = { cx: W / 2, cy: H / 2, r: 78 }
const CARD_W = 220

const satellites: Satellite[] = [
  { icon: Briefcase, label: 'Jobs', status: 'live', title: 'Roles that are actually live', description: 'Refreshed daily, straight from source.', href: '/jobs', cx: 150, cy: 95 },
  { icon: Users, label: 'CareerCircle', status: 'live', title: 'A community, not a crowd', description: 'Peer support, referrals, job updates.', href: '/career-circle', cx: 730, cy: 95 },
  { icon: BookOpen, label: 'Resources', status: 'soon', title: 'Guides worth your time', description: 'Same quality bar as everything here.', cx: 150, cy: 365 },
  { icon: Award, label: 'Success stories', status: 'soon', title: 'How people actually got in', description: 'Real outcomes, not case-interview theory.', cx: 730, cy: 365 },
]

export default function ServicesConstellation() {
  return (
    <div className="relative mx-auto hidden lg:block" style={{ width: W, height: H }}>
      <svg
        width={W}
        height={H}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {satellites.map((s, i) => {
          const length = Math.hypot(s.cx - HUB.cx, s.cy - HUB.cy)
          return (
            <line
              key={i}
              x1={HUB.cx}
              y1={HUB.cy}
              x2={s.cx}
              y2={s.cy}
              stroke="var(--border-default)"
              strokeWidth="1"
              strokeDasharray={length}
              strokeDashoffset={length}
              className="animate-draw-line"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            />
          )
        })}
      </svg>

      {/* Hub */}
      <div
        className="absolute rounded-full bg-bg-surface border border-border-default flex flex-col items-center justify-center text-center animate-fade-in-up"
        style={{
          left: HUB.cx - HUB.r,
          top: HUB.cy - HUB.r,
          width: HUB.r * 2,
          height: HUB.r * 2,
        }}
      >
        <span className="font-display text-base leading-none">
          onestop<span className="text-accent">careers</span>
        </span>
        <span className="font-mono text-[10px] text-text-tertiary mt-1.5">Cut the crap.</span>
      </div>

      {satellites.map((s, i) => (
        <div
          key={s.label}
          className="absolute animate-fade-in-up"
          style={{
            left: s.cx - CARD_W / 2,
            top: s.cy - 58, // half of the card's approximate rendered height
            width: CARD_W,
            animationDelay: `${i * 70}ms`,
          }}
        >
          <SatelliteCard {...s} />
        </div>
      ))}
    </div>
  )
}

function SatelliteCard({ icon: Icon, label, status, title, description, href }: Satellite) {
  const content = (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-4 transition-all hover:border-border-default hover:shadow-md hover:-translate-y-px">
      <div className="flex items-center justify-between mb-2.5">
        <Icon size={16} className="text-accent" aria-hidden="true" />
        {status === 'live' ? (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-green">
            <span className="w-1.5 h-1.5 rounded-full bg-green" /> live
          </span>
        ) : (
          <span className="text-[10px] font-mono text-text-tertiary">soon</span>
        )}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">{label}</span>
      <h3 className="font-display text-base mt-0.5 mb-1 leading-snug">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
    </div>
  )

  return href ? (
    <Link to={href} className="block">{content}</Link>
  ) : (
    <div className="opacity-70 cursor-default">{content}</div>
  )
}
