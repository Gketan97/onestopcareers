import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Bookmark, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { navLinks } from './navConfig'
import { useAuth } from '../../lib/auth/AuthContext'

// Updated 2026-08-23 again — "Log in" is now real (was an inert
// placeholder since no auth existed). Signed-out: "Log in" link.
// Signed-in: "Saved" link + a logout button. `available` (whether
// Supabase is actually configured) still gates all of this — if it's
// not, the nav quietly falls back to the old inert-placeholder look
// rather than showing a login link that can never work.
export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { user, available, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

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
          {available && user ? (
            <>
              <Link
                to="/saved"
                onClick={() => setOpen(false)}
                className={clsx(
                  'hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors',
                  location.pathname === '/saved' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Bookmark size={15} aria-hidden="true" />
                Saved
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                <LogOut size={15} aria-hidden="true" />
                Log out
              </button>
            </>
          ) : available ? (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="hidden sm:inline-block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Log in
            </Link>
          ) : (
            <span
              className="text-sm font-medium text-text-tertiary opacity-40 cursor-default hidden sm:inline-block"
              title="Coming soon"
            >
              Log in
            </span>
          )}
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
          {available && user ? (
            <>
              <Link to="/saved" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <Bookmark size={15} aria-hidden="true" />
                Saved
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-text-tertiary text-left">
                <LogOut size={15} aria-hidden="true" />
                Log out
              </button>
            </>
          ) : available ? (
            <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-text-secondary">
              Log in
            </Link>
          ) : (
            <span className="text-sm font-medium text-text-tertiary opacity-40" title="Coming soon">Log in</span>
          )}
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
