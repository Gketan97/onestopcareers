import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'
import { navLinks } from './navConfig'

// Updated 2026-08-23: "Log in" and "Start Building" added per the new
// homepage strategy brief. "Log in" is inert (title="Coming soon") — no
// accounts/auth exist yet, an honest placeholder rather than a dead
// destination. "Start Building" is real, pointing at /jobs — the one
// concrete, live "start" experience the platform actually has right now.
export default function Nav() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b border-border-subtle bg-bg-surface relative">
      <div className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
          <span className="font-display text-[26px] tracking-tight leading-none">
            onestop<span className="text-accent">careers</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => <NavItem key={link.to} link={link} current={location.pathname} />)}
        </div>

        <div className="flex items-center gap-4">
          <span
            className="text-sm font-medium text-text-tertiary opacity-40 cursor-default hidden sm:inline-block"
            title="Coming soon"
          >
            Log in
          </span>
          <Link
            to="/jobs"
            onClick={() => setOpen(false)}
            className="bg-text-primary text-bg-base text-[13px] font-medium px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity hidden sm:inline-block"
          >
            Start Building
          </Link>
          <button
            className="md:hidden p-2 -mr-2 text-text-primary"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border-subtle bg-bg-surface px-6 py-4 flex flex-col gap-4 animate-fade-in-up">
          {navLinks.map((link) => (
            <NavItem key={link.to} link={link} current={location.pathname} onClick={() => setOpen(false)} block />
          ))}
          <span className="text-sm font-medium text-text-tertiary opacity-40" title="Coming soon">Log in</span>
          <Link
            to="/jobs"
            onClick={() => setOpen(false)}
            className="bg-text-primary text-bg-base text-[13px] font-medium px-5 py-3 rounded-full text-center"
          >
            Start Building
          </Link>
        </div>
      )}
    </nav>
  )
}

function NavItem({
  link,
  current,
  onClick,
  block = false,
}: {
  link: (typeof navLinks)[number]
  current: string
  onClick?: () => void
  block?: boolean
}) {
  if (!link.enabled) {
    return (
      <span
        className={clsx(
          'text-sm font-medium text-text-tertiary opacity-40 cursor-default',
          block && 'block',
        )}
        title="Coming soon"
      >
        {link.label}
      </span>
    )
  }
  return (
    <Link
      to={link.to}
      onClick={onClick}
      className={clsx(
        'text-sm font-medium hover:text-text-primary transition-colors',
        block && 'block',
        current === link.to ? 'text-text-primary' : 'text-text-secondary',
      )}
    >
      {link.label}
    </Link>
  )
}
