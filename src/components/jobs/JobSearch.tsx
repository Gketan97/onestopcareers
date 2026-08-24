import { Search, X } from 'lucide-react'

export default function JobSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="w-full flex items-center gap-2.5 bg-bg-surface border border-border-default rounded-md px-4 py-3 transition-colors focus-within:border-accent">
      <Search size={16} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
      <input
        type="text"
        placeholder="Search jobs, companies, or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 outline-none bg-transparent text-sm font-sans w-full text-text-primary placeholder:text-text-tertiary"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-text-tertiary hover:text-text-primary rounded-full"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
