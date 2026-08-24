import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'
import { fnLabel } from '../../lib/jobs/functionLabels'

export type PostedFilter = 'today' | 'week' | 'month' | null

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
  postedFilter: PostedFilter
  onPostedFilterChange: (p: PostedFilter) => void
}

const POSTED_LABELS: Record<NonNullable<PostedFilter>, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
}

// v5 (2026-08-23): rebuilt from persistent pills to closed popover
// triggers + a separate active-filter-chips row, per explicit request.
// Every option (all 6 functions, not a curated 4) is now inside its
// popover rather than always visible — since nothing is shown until a
// trigger is clicked, the earlier "too many pills" problem doesn't apply
// to this shape at all, so no curation/expansion is needed here anymore.
// "More" holds a real filter (posted date), not a placeholder — no other
// filterable dimension existed in the data to put there instead.
export default function JobFilters(props: JobFiltersProps) {
  const [open, setOpen] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const chips: { label: string; onRemove: () => void }[] = []
  if (props.activeFn) chips.push({ label: fnLabel(props.activeFn), onRemove: () => props.onFnChange(null) })
  if (props.activeSeniority) chips.push({ label: props.activeSeniority, onRemove: () => props.onSeniorityChange(null) })
  if (props.workMode) chips.push({ label: props.workMode, onRemove: () => props.onWorkModeChange(null) })
  if (props.activeCity) chips.push({ label: props.activeCity, onRemove: () => props.onCityChange(null) })
  if (props.postedFilter) chips.push({ label: POSTED_LABELS[props.postedFilter], onRemove: () => props.onPostedFilterChange(null) })

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center gap-2">
        <Trigger
          label="Function"
          value={props.activeFn ? fnLabel(props.activeFn) : null}
          isOpen={open === 'fn'}
          onToggle={() => setOpen(open === 'fn' ? null : 'fn')}
        >
          <Option selected={!props.activeFn} onClick={() => { props.onFnChange(null); setOpen(null) }}>All functions</Option>
          {props.functions.map((fn) => (
            <Option key={fn} selected={props.activeFn === fn} onClick={() => { props.onFnChange(fn); setOpen(null) }}>
              {fnLabel(fn)}
            </Option>
          ))}
        </Trigger>

        <Trigger
          label="Level"
          value={props.activeSeniority}
          isOpen={open === 'level'}
          onToggle={() => setOpen(open === 'level' ? null : 'level')}
        >
          <Option selected={!props.activeSeniority} onClick={() => { props.onSeniorityChange(null); setOpen(null) }}>All levels</Option>
          {props.seniorities.map((s) => (
            <Option key={s} selected={props.activeSeniority === s} onClick={() => { props.onSeniorityChange(s); setOpen(null) }} capitalize>
              {s}
            </Option>
          ))}
        </Trigger>

        <Trigger
          label="Work mode"
          value={props.workMode}
          isOpen={open === 'mode'}
          onToggle={() => setOpen(open === 'mode' ? null : 'mode')}
        >
          <Option selected={!props.workMode} onClick={() => { props.onWorkModeChange(null); setOpen(null) }}>Any</Option>
          {['remote', 'hybrid', 'onsite'].map((m) => (
            <Option key={m} selected={props.workMode === m} onClick={() => { props.onWorkModeChange(m); setOpen(null) }} capitalize>
              {m}
            </Option>
          ))}
        </Trigger>

        <Trigger
          label="Location"
          value={props.activeCity}
          isOpen={open === 'city'}
          onToggle={() => setOpen(open === 'city' ? null : 'city')}
        >
          <div className="max-h-[240px] overflow-y-auto">
            <Option selected={!props.activeCity} onClick={() => { props.onCityChange(null); setOpen(null) }}>All cities</Option>
            {props.cities.map((c) => (
              <Option key={c} selected={props.activeCity === c} onClick={() => { props.onCityChange(c); setOpen(null) }}>
                {c}
              </Option>
            ))}
          </div>
        </Trigger>

        <Trigger
          label="More"
          value={props.postedFilter ? POSTED_LABELS[props.postedFilter] : null}
          isOpen={open === 'more'}
          onToggle={() => setOpen(open === 'more' ? null : 'more')}
        >
          <div className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary px-3 pt-2 pb-1">Posted</div>
          <Option selected={!props.postedFilter} onClick={() => { props.onPostedFilterChange(null); setOpen(null) }}>Any time</Option>
          {(['today', 'week', 'month'] as const).map((p) => (
            <Option key={p} selected={props.postedFilter === p} onClick={() => { props.onPostedFilterChange(p); setOpen(null) }}>
              {POSTED_LABELS[p]}
            </Option>
          ))}
        </Trigger>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={chip.onRemove}
              className="flex items-center gap-1.5 bg-accent-soft border border-accent-border text-accent text-[12.5px] font-medium rounded-full pl-3 pr-2 py-1.5 capitalize"
            >
              {chip.label}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
          <button
            onClick={() => {
              props.onFnChange(null)
              props.onSeniorityChange(null)
              props.onWorkModeChange(null)
              props.onCityChange(null)
              props.onPostedFilterChange(null)
            }}
            className="text-[12.5px] text-text-tertiary hover:text-text-primary"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

function Trigger({
  label,
  value,
  isOpen,
  onToggle,
  children,
}: {
  label: string
  value: string | null
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={clsx(
          'flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium border whitespace-nowrap transition-colors',
          value || isOpen
            ? 'border-accent-border text-text-primary bg-bg-surface'
            : 'border-border-default text-text-secondary bg-bg-surface hover:border-text-tertiary',
        )}
      >
        {value || label}
        <ChevronDown size={13} className={clsx('transition-transform text-text-tertiary', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-bg-surface border border-border-default rounded-md py-1.5 shadow-lg z-20 min-w-[180px]">
          {children}
        </div>
      )}
    </div>
  )
}

function Option({
  selected,
  onClick,
  capitalize,
  children,
}: {
  selected: boolean
  onClick: () => void
  capitalize?: boolean
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'block w-full text-left px-3 py-2 text-sm transition-colors',
        capitalize && 'capitalize',
        selected ? 'text-accent font-medium' : 'text-text-secondary hover:text-text-primary',
      )}
    >
      {children}
    </button>
  )
}
