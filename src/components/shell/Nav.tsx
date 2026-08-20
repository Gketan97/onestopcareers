import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { navLinks } from './navConfig'

export default function Nav() {
  const location = useLocation()

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border-subtle bg-bg-surface">
      <Link to="/" className="flex flex-col gap-0.5">
        <span className="font-display text-2xl tracking-tight">
          onestop<span className="text-accent">.</span>
        </span>
        <span className="hidden md:block font-mono text-[10.5px] text-text-tertiary">
          Knowing what to do was never the problem. Doing it daily is.
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-9">
        {navLinks.map((link) =>
          link.enabled ? (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'text-sm font-medium hover:text-text-primary transition-colors',
                location.pathname === link.to ? 'text-text-primary' : 'text-text-secondary',
              )}
            >
              {link.label}
            </Link>
          ) : (
            <span
              key={link.to}
              className="text-sm font-medium text-text-tertiary opacity-40 cursor-default"
              title="Coming soon"
            >
              {link.label}
            </span>
          ),
        )}
      </div>

      {/* Alerts flow isn't built yet (Milestone 3) — placeholder CTA for now */}
      <button
        className="bg-text-primary text-bg-base text-[13px] font-medium px-5 py-2.5 rounded-full"
        title="Coming soon"
      >
        Get job alerts
      </button>
    </nav>
  )
}
