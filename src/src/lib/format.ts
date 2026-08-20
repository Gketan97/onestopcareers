// Recency formatting — shared by JobCard and anywhere else a posted_at
// date needs a human label + semantic color. Keep this the single source
// so the "fresh/aging/stale" thresholds only live in one place.

export function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export function postedLabel(dateStr: string): string {
  const days = daysAgo(dateStr)
  if (days <= 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days <= 7) return `${days}d ago`
  if (days <= 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export type Recency = 'fresh' | 'aging' | 'stale'

export function recencyTier(dateStr: string): Recency {
  const days = daysAgo(dateStr)
  if (days <= 3) return 'fresh'
  if (days <= 7) return 'aging'
  return 'stale'
}
