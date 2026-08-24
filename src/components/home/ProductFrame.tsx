import type { ReactNode } from 'react'

// One consistent framing device for every "show the actual product"
// section — same browser-chrome pattern already used for the live Jobs
// preview, reused here so all six product sections share one visual
// language. The status badge is the one thing that changes: "live" for
// real, working features, "preview" for illustrative mockups of things
// not built yet. This is a deliberate, load-bearing distinction, not
// decoration — see design doc for why every illustrative section is
// labeled this way rather than presented as if it were real.
export default function ProductFrame({
  label,
  status,
  children,
}: {
  label: string
  status: 'live' | 'preview'
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface overflow-hidden shadow-lg">
      <div className="flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border-subtle bg-bg-elevated">
        <span className="hidden sm:flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
          <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
          <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
        </span>
        <span className="sm:ml-3 font-mono text-[11px] text-text-tertiary truncate min-w-0">{label}</span>
        <span className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-[11px] font-mono">
          {status === 'live' ? (
            <span className="flex items-center gap-1.5 text-green">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> live
            </span>
          ) : (
            <span className="text-text-tertiary border border-border-default rounded-full px-2 py-0.5">preview</span>
          )}
        </span>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  )
}
