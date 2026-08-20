// Adding Resources/Referrals/Case studies later (see docs/DESIGN_DOC.md §4)
// is a one-line addition here — Nav.tsx renders from this array, no JSX edits.
export interface NavLink {
  label: string
  to: string
  enabled: boolean // false = shown but visually inert, route not built yet
}

export const navLinks: NavLink[] = [
  { label: 'Home', to: '/', enabled: true },
  { label: 'Jobs', to: '/jobs', enabled: true },
  { label: 'Resources', to: '/resources', enabled: false },
  { label: 'Case studies', to: '/case-studies', enabled: false },
]
