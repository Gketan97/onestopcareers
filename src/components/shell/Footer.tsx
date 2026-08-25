import { Link } from 'react-router-dom'
import { Linkedin, Twitter, Instagram } from 'lucide-react'
import { navLinks } from './navConfig'

// Redesigned 2026-08-23 per the new homepage strategy brief — full nav
// mirror, positioning line, social placeholders. Social links are
// genuine placeholders (href="#") since no real URLs were provided —
// not a claim that these accounts exist yet.
export default function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div>
            <span className="font-display text-2xl tracking-tight leading-none">
              onestop<span className="text-accent">careers</span>
            </span>
            <p className="text-text-secondary mt-3 max-w-xs">Fast-Track Your Analytics Career.</p>
          </div>
          <div className="flex gap-4">
            <SocialIcon icon={Linkedin} label="LinkedIn" />
            <SocialIcon icon={Twitter} label="Twitter" />
            <SocialIcon icon={Instagram} label="Instagram" />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 pt-8 border-t border-border-subtle">
          {navLinks.map((link) =>
            link.enabled ? (
              <Link key={link.to} to={link.to} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                {link.label}
              </Link>
            ) : (
              <span key={link.to} className="text-sm text-text-tertiary opacity-50 cursor-default" title="Coming soon">
                {link.label}
              </span>
            ),
          )}
          <span className="text-sm text-text-tertiary opacity-50 cursor-default" title="Coming soon">About</span>
          <a href="mailto:hello@onestopcareers.com" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</a>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 mt-6 border-t border-border-subtle">
          <Link to="/privacy" className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ icon: Icon, label }: { icon: typeof Linkedin; label: string }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label={label}
      title="Coming soon"
      className="w-9 h-9 rounded-full border border-border-default flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-text-primary transition-colors"
    >
      <Icon size={15} aria-hidden="true" />
    </a>
  )
}
