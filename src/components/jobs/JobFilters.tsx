import { useState, type ReactNode } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'

interface JobFiltersProps {
  functions: string[]
  activeFn: string | null
  onFnChange: (fn: string | null) => void
  seniorities: string[]
  activeSeniority: string | null
  onSeniorityChange: (s: string | null) => void
  workMode: string | null
  onWorkModeChange: (m: string | null) => void
  cities: string[]
  activeCity: string | null
  onCityChange: (c: string | null) => void
}

// v3 (2026-08-23): switched from dropdown <select>s back to pills, but
// kept the grouping — the original chip-wall problem was that every
// filter across every category was shown as an undifferentiated flat
// row, not that pills themselves were wrong. Pills toggle in one click
// (a closed dropdown needs open-then-select); grouping under small
// labels keeps that fast interaction without the "wall" feeling.
export default function JobFilters(props: JobFiltersProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const hasActive = props.activeFn || props.activeSeniority || props.workMode || props.activeCity

  return (
    <div className="flex flex-col gap-3">
      <FilterGroup label="Function">
        {props.functions.map((fn) => (
          <Pill key={fn} active={props.activeFn === fn} onClick={() => props.onFnChange(props.activeFn === fn ? null : fn)}>
            {fn}
          </Pill>
        ))}
      </FilterGroup>

      <FilterGroup label="Level">
        {props.seniorities.map((s) => (
          <Pill key={s} active={props.activeSeniority === s} onClick={() => props.onSeniorityChange(props.activeSeniority === s ? null : s)}>
            {s}
          </Pill>
        ))}
      </FilterGroup>

      <FilterGroup label="Work mode">
        {['remote', 'hybrid', 'onsite'].map((m) => (
          <Pill key={m} active={props.workMode === m} onClick={() => props.onWorkModeChange(props.workMode === m ? null : m)}>
            {m}
          </Pill>
        ))}

        <div className="relative">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium border whitespace-nowrap transition-colors',
              props.activeCity || moreOpen
                ? 'bg-accent-soft border-accent-border text-accent'
                : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
            )}
          >
            <SlidersHorizontal size={12} aria-hidden="true" />
            {props.activeCity || 'City'}
            <ChevronDown size={12} className={clsx('transition-transform', moreOpen && 'rotate-180')} aria-hidden="true" />
          </button>
          {moreOpen && (
            <div className="absolute top-full left-0 mt-2 bg-bg-surface border border-border-default rounded-md p-3 shadow-lg z-10 min-w-[200px]">
              <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
                <button
                  onClick={() => { props.onCityChange(null); setMoreOpen(false) }}
                  className={clsx('text-left text-sm px-2 py-1.5 rounded', !props.activeCity ? 'text-accent' : 'text-text-secondary hover:text-text-primary')}
                >
                  All cities
                </button>
                {props.cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => { props.onCityChange(c); setMoreOpen(false) }}
                    className={clsx('text-left text-sm px-2 py-1.5 rounded', props.activeCity === c ? 'text-accent' : 'text-text-secondary hover:text-text-primary')}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasActive && (
          <button
            onClick={() => {
              props.onFnChange(null)
              props.onSeniorityChange(null)
              props.onWorkModeChange(null)
              props.onCityChange(null)
            }}
            className="flex items-center gap-1 text-[13px] text-text-tertiary hover:text-text-primary ml-1"
          >
            <X size={13} aria-hidden="true" />
            Clear
          </button>
        )}
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary w-[70px] flex-shrink-0">{label}</span>
      {children}
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'px-3.5 py-2 rounded-full text-[13px] font-medium border whitespace-nowrap capitalize transition-colors',
        active
          ? 'bg-accent-soft border-accent-border text-accent'
          : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
      )}
    >
      {children}
    </button>
  )
}
