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

export const navLinks: NavLink[] = [
  { label: 'Jobs', to: '/jobs', enabled: true },
  { label: 'Career Circle', to: '/career-circle', enabled: true },
  { label: 'Resources', to: '/resources', enabled: false },
  { label: 'Projects', to: '/projects', enabled: false },
  { label: 'AI', to: '/ai', enabled: false },
]
