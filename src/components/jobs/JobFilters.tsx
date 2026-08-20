import clsx from 'clsx'

interface JobFiltersProps {
  functions: string[]
  activeFn: string | null
  onFnChange: (fn: string | null) => void
  remoteOnly: boolean
  onRemoteToggle: () => void
}

// NOTE: city/seniority filters are deferred — city has high cardinality
// (needs a proper searchable dropdown, not chips) and seniority chips can
// follow this same pattern once the fn/mode chips are validated with users.
export default function JobFilters({
  functions,
  activeFn,
  onFnChange,
  remoteOnly,
  onRemoteToggle,
}: JobFiltersProps) {
  return (
    <>
      {functions.map((fn) => (
        <button
          key={fn}
          onClick={() => onFnChange(activeFn === fn ? null : fn)}
          className={clsx(
            'px-4 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap capitalize transition-colors',
            activeFn === fn
              ? 'bg-accent-soft border-accent-border text-accent'
              : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
          )}
        >
          {fn}
        </button>
      ))}
      <button
        onClick={onRemoteToggle}
        className={clsx(
          'px-4 py-2.5 rounded-full text-[13px] font-medium border whitespace-nowrap transition-colors',
          remoteOnly
            ? 'bg-accent-soft border-accent-border text-accent'
            : 'bg-bg-surface border-border-default text-text-secondary hover:border-text-tertiary',
        )}
      >
        Remote
      </button>
    </>
  )
}
