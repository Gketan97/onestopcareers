// Shared Job type — the data contract between the crawler repo (jobscout-date)
// and this frontend. Keep in sync with docs/DESIGN_DOC.md §6.
// Treat as additive-only: new optional fields are fine without discussion;
// removing/renaming a field or changing an enum's valid values needs a
// schema_version bump and a note in both repos' DATA_CONTRACT.md.

export interface Job {
  id: string
  title: string
  company: string
  location: string
  city: string
  mode: 'remote' | 'hybrid' | 'onsite'
  fn: 'data' | 'product' | 'bizops' | 'engineering' | 'finance' | 'design'
  seniority: string
  url: string
  color: string
  posted_at: string // YYYY-MM-DD
  src:
    | 'greenhouse'
    | 'lever'
    | 'ashby'
    | 'workable'
    | 'smartrecruiters'
    | 'eightfold'
    | 'workday'
    | 'adzuna'
    | 'manual'
  tier: 1 | 2 | 3 | 4
  dept: string
  country: string
}

export interface JobsFeed {
  schema_version: number
  jobs: Job[]
}
