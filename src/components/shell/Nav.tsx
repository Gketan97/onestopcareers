import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { navLinks } from './navConfig'

export default function Nav() {
  const location = useLocation()

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border-subtle bg-bg-surface">
      <Link to="/" className="flex items-center">
        <span className="font-display text-[26px] tracking-tight leading-none">
          onestop<span className="text-accent">careers</span>
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

      {/* WhatsApp job-alerts service was cut — CareerCircle covers job
          updates (plus more) via WhatsApp already. See design doc §8. */}
      <Link
        to="/career-circle"
        className="bg-text-primary text-bg-base text-[13px] font-medium px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
      >
        Join CareerCircle
      </Link>
    </nav>
  )
}
