export default function JobSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex-1 min-w-[240px] flex items-center gap-2.5 bg-bg-surface border border-border-default rounded-md px-4 py-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Search title or company…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 outline-none bg-transparent text-sm font-sans w-full text-text-primary placeholder:text-text-tertiary"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-text-tertiary hover:text-text-primary text-sm"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
