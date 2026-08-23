import { useEffect } from 'react'
import type { Job } from '../../lib/jobs/types'

// Injects schema.org JobPosting JSON-LD on mount, removes it on unmount
// (so navigating between job pages doesn't stack multiple scripts). This
// is the one piece of "SEO-ready job pages" from the roadmap that's
// actually achievable in a client-only SPA — Google's crawler executes
// JS before reading structured data. It does NOT help non-JS bots
// (WhatsApp/LinkedIn link previews) — that needs real SSR, flagged as
// architecturally out of scope for now. See design doc §6.
export default function JobPostingSchema({ job }: { job: Job }) {
  useEffect(() => {
    const cutoff = new Date(job.posted_at)
    cutoff.setDate(cutoff.getDate() + 30) // matches the crawler's own 30-day drop-off — a real, accurate value, not invented

    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: `${job.seniority ? job.seniority + ' ' : ''}${job.title} role at ${job.company}${job.mode ? `, ${job.mode}` : ''} in ${job.city || job.location || 'India'}.`,
      datePosted: job.posted_at,
      validThrough: cutoff.toISOString().slice(0, 10),
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.city || undefined,
          addressCountry: job.country || 'IN',
        },
      },
      directApply: true,
      url: job.url,
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    script.id = 'job-posting-schema'
    document.head.appendChild(script)

    return () => {
      document.getElementById('job-posting-schema')?.remove()
    }
  }, [job])

  return null
}
