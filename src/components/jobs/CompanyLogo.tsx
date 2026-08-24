import { useState } from 'react'
import CompanyAvatar from './CompanyAvatar'

// Attempts a real logo first, falls back to the monogram avatar on any
// failure. IMPORTANT LIMITATION, stated plainly: we have no stored
// website/domain field for any company (crawler doesn't capture one) —
// the domain used here is a naive guess (lowercase company name, strip
// non-alphanumerics, append .com). This will be right for many
// well-known companies and wrong for others; wrong guesses just 404 and
// fall back to the monogram automatically, so a bad guess never breaks
// anything, it just doesn't show a logo. Uses Google's public favicon
// endpoint (no API key, no signup, no new dependency) rather than
// Clearbit (confirmed dead, Dec 2025) or Logo.dev (needs a new account).
function guessDomain(company: string): string {
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return `${slug}.com`
}

export default function CompanyLogo({
  name,
  color,
  size = 36,
}: {
  name: string
  color: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <CompanyAvatar name={name} color={color} size={size} />
  }

  const domain = guessDomain(name)
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      width={size}
      height={size}
      className="rounded-full flex-shrink-0 object-cover bg-bg-elevated"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      // NOT VERIFIED LIVE — this sandbox has no network access to
      // google.com to confirm it. Best-effort assumption: Google's
      // favicon endpoint may return a generic fallback icon (rather than
      // a 404) for domains it doesn't recognize, which onError alone
      // wouldn't catch. This naturalWidth check is an attempt to catch
      // that case too, but the actual size of a generic fallback icon
      // at this endpoint hasn't been confirmed against a live response.
      // If real generic-icon images are slipping through as "logos" in
      // practice, this threshold needs adjusting once observed live.
      onLoad={(e) => {
        const img = e.currentTarget
        if (img.naturalWidth <= 16) setFailed(true)
      }}
    />
  )
}
