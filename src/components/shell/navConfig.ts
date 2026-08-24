// Adding future modules later (see docs/DESIGN_DOC.md §4) is a one-line
// addition here — Nav.tsx renders from this array, no JSX edits.
// Canonical module names — keep in sync with the homepage sections and
// docs/DESIGN_DOC.md.
//
// Updated 2026-08-23 per the full homepage strategy brief: nav becomes
// Jobs | Career Circle | Resources | Projects | AI, dropping "Home" (the
// wordmark already links home, a separate nav item was redundant) and
// "Success stories" (not in the new brief's IA — folded into the
// "Future vision" section on the homepage instead of being a standalone
// nav destination for now).
export interface NavLink {
  label: string
  to: string
  enabled: boolean // false = shown but visually inert, route not built yet
}

// Updated 2026-08-23 again — added "Companies", live, per the Jobs/
// Companies architecture brief. Adapted rather than adopted wholesale:
// the brief proposed a lean "Jobs | Companies" nav on the assumption this
// was the whole product; this repo already has Career Circle as a real,
// separate differentiator, so Companies is added alongside everything
// else rather than replacing it.
// Updated 2026-08-23 again — "Home" added back (user request; the
// wordmark linking home wasn't a sufficient substitute in practice) and
// "Companies" removed as a standalone nav destination — it's now a
// parallel feed inside the Jobs page instead (JobList.tsx), not a
// separate place to navigate to. The /companies and /companies/:slug
// routes still exist and still work (job cards and the new sidebar link
// to them) — only the top-level nav promotion is gone.
export const navLinks: NavLink[] = [
  { label: 'Home', to: '/', enabled: true },
  { label: 'Jobs', to: '/jobs', enabled: true },
  { label: 'Career Circle', to: '/career-circle', enabled: true },
  { label: 'Resources', to: '/resources', enabled: false },
  { label: 'Projects', to: '/projects', enabled: false },
  { label: 'AI', to: '/ai', enabled: false },
]
