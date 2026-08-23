import type { Job } from './types'

export interface CompanyAggregate {
  name: string
  slug: string
  color: string
  totalRoles: number
  byFunction: Record<string, number>
  jobs: Job[]
}

export function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Everything here is derived from the job list we already fetch — no new
// crawler fields, no separate Company entity. Open-role counts and
// function breakdowns are genuinely live (recomputed from real data every
// time), not cached/stale numbers. See design doc for why this was chosen
// over a full relational Company/Job schema.
export function deriveCompanies(jobs: Job[]): CompanyAggregate[] {
  const map = new Map<string, CompanyAggregate>()
  for (const job of jobs) {
    const slug = companySlug(job.company)
    let entry = map.get(slug)
    if (!entry) {
      entry = { name: job.company, slug, color: job.color || '#E86B35', totalRoles: 0, byFunction: {}, jobs: [] }
      map.set(slug, entry)
    }
    entry.totalRoles += 1
    entry.byFunction[job.fn] = (entry.byFunction[job.fn] || 0) + 1
    entry.jobs.push(job)
  }
  return Array.from(map.values()).sort((a, b) => b.totalRoles - a.totalRoles)
}
