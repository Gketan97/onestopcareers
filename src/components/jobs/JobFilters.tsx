import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'

interface JobFiltersProps {
  functions: string[]
  activeFn: string | null
  onFnChange: (fn: string | null) => void
  seniorities: string[]
  activeSeniority: string | null
  onSeniorityChange: (s: string | null) => void
  workMode: string | null // null = all, else 'remote' | 'hybrid' | 'onsite'
  onWorkModeChange: (m: string | null) => void
  cities: string[]
  activeCity: string | null
  onCityChange: (c: string | null) => void
}

// Redesigned 2026-08-23 per the Jobs/Companies brief: replaces the flat
// chip wall with grouped selectors (Function, Level, Work mode, More) —
// the brief's exact structure. City moves from "deferred" to live, tucked
// inside "More" rather than its own row, since it's the one filter with
// real cardinality concerns (per the original deferral note).
export default function JobFilters(props: JobFiltersProps) {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        label="Function"
        value={props.activeFn}
        options={props.functions}
        onChange={props.onFnChange}
      />
      <Select
        label="Level"
        value={props.activeSeniority}
        options={props.seniorities}
        onChange={props.onSeniorityChange}
      />
      <Select
        label="Work mode"
        value={props.workMode}
        options={['remote', 'hybrid', 'onsite']}
        onChange={props.onWorkModeChange}
      />

      <div className="relative">
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap transition-colors',
            props.activeCity || moreOpen
              ? 'bg-accent-soft border-accent-border text-accent'
              : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
          )}
        >
          <SlidersHorizontal size={13} aria-hidden="true" />
          {props.activeCity || 'More'}
          <ChevronDown size={13} className={clsx('transition-transform', moreOpen && 'rotate-180')} aria-hidden="true" />
        </button>
        {moreOpen && (
          <div className="absolute top-full left-0 mt-2 bg-bg-surface border border-border-default rounded-md p-3 shadow-lg z-10 min-w-[200px]">
            <div className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">City</div>
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

      {/* Active-filter clear, only shown once something is set — keeps
          the row from implying state that isn't there when everything's
          already "All". */}
      {(props.activeFn || props.activeSeniority || props.workMode || props.activeCity) && (
        <button
          onClick={() => {
            props.onFnChange(null)
            props.onSeniorityChange(null)
            props.onWorkModeChange(null)
            props.onCityChange(null)
          }}
          className="flex items-center gap-1 text-[13px] text-text-tertiary hover:text-text-primary"
        >
          <X size={13} aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: string[]
  onChange: (v: string | null) => void
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label={label}
        className={clsx(
          'appearance-none pl-4 pr-8 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap capitalize cursor-pointer transition-colors bg-bg-surface',
          value
            ? 'border-accent-border text-accent'
            : 'border-border-default text-text-secondary hover:border-text-tertiary',
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary" aria-hidden="true" />
    </div>
  )
}
