// Adding future modules later (see docs/DESIGN_DOC.md §4) is a one-line
// addition here — Nav.tsx renders from this array, no JSX edits.
// Canonical module names — keep in sync with the Services strip on Home
// and docs/DESIGN_DOC.md. Do not introduce a new label in one place without
// adding it here too (see design doc §2 audit note on "Advice").
export interface NavLink {
  label: string
  to: string
  enabled: boolean // false = shown but visually inert, route not built yet
}

export const navLinks: NavLink[] = [
  { label: 'Home', to: '/', enabled: true },
  { label: 'Jobs', to: '/jobs', enabled: true },
  { label: 'CareerCircle', to: '/career-circle', enabled: true },
  { label: 'Resources', to: '/resources', enabled: false },
  { label: 'Success stories', to: '/success-stories', enabled: false },
]
