// Replaces the previous "unexplained colored vertical bar" (flagged
// directly in the Jobs/Companies brief) with a colored monogram — same
// per-company brand color, now with a clear meaning (this IS the
// company's visual identity, not a decorative accent). No logo
// dependency: Clearbit's free Logo API was confirmed dead (shut down
// Dec 2025) before this was built, and the alternative (Logo.dev)
// needs a new account/token. This needs neither.
export default function CompanyAvatar({
  name,
  color,
  size = 36,
}: {
  name: string
  color: string
  size?: number
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-display"
      style={{
        width: size,
        height: size,
        background: `${color}22`, // ~13% opacity via hex alpha, portable everywhere
        color,
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}
