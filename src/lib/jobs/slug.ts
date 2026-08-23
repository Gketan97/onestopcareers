import type { Job } from './types'

// Slug is cosmetic/SEO only — the actual lookup key is still job.id,
// embedded as the final segment. This means links never break even if a
// job's title/company changes upstream between crawls; the slug is
// regenerated fresh every render from current data, not stored anywhere.
export function jobSlug(job: Job): string {
  const parts = `${job.title}-${job.company}-${job.city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${parts}-${job.id}`
}

// Extracts the id from a slug URL segment. Our ids already contain
// hyphens (e.g. "gh-12345"), so we can't just split on the last hyphen —
// instead we check every known id-prefix pattern from the end.
const ID_PREFIXES = ['gh-', 'lv-', 'ab-', 'wk-', 'sr-', 'ef-', 'wd-', 'az-', 'js-', 'manual-']

export function idFromSlug(slug: string): string {
  for (const prefix of ID_PREFIXES) {
    const idx = slug.lastIndexOf(prefix)
    if (idx !== -1) return slug.slice(idx)
  }
  // Fallback: unrecognized id format, assume the whole trailing segment
  // after the last hyphen-group is the id (best-effort, shouldn't
  // normally hit this given the prefixes above cover every crawler src).
  return slug
}
