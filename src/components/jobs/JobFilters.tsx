import clsx from 'clsx'
import { Wifi } from 'lucide-react'

interface JobFiltersProps {
  functions: string[]
  activeFn: string | null
  onFnChange: (fn: string | null) => void
  seniorities: string[]
  activeSeniority: string | null
  onSeniorityChange: (s: string | null) => void
  remoteOnly: boolean
  onRemoteToggle: () => void
}

// City filter is still deferred — high cardinality, needs a proper
// searchable dropdown, not chips. Seniority added 2026-08-23 (real field,
// same chip pattern as function — city is the only one still waiting).
export default function JobFilters({
  functions,
  activeFn,
  onFnChange,
  seniorities,
  activeSeniority,
  onSeniorityChange,
  remoteOnly,
  onRemoteToggle,
}: JobFiltersProps) {
  return (
    <>
      {functions.map((fn) => (
        <Chip key={fn} active={activeFn === fn} onClick={() => onFnChange(activeFn === fn ? null : fn)}>
          {fn}
        </Chip>
      ))}
      {seniorities.map((s) => (
        <Chip key={s} active={activeSeniority === s} onClick={() => onSeniorityChange(activeSeniority === s ? null : s)}>
          {s}
        </Chip>
      ))}
      <button
        onClick={onRemoteToggle}
        aria-pressed={remoteOnly}
        className={clsx(
          'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap transition-colors',
          remoteOnly
            ? 'bg-accent-soft border-accent-border text-accent'
            : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
        )}
      >
        <Wifi size={13} aria-hidden="true" />
        Remote
      </button>
    </>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'px-4 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap capitalize transition-colors',
        active
          ? 'bg-accent-soft border-accent-border text-accent'
          : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
      )}
    >
      {children}
    </button>
  )
}
