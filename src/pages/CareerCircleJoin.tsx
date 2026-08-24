import { useState, useEffect, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase/client'
import { analytics } from '../lib/analytics/posthog'

interface Circle {
  id: string
  slug: string
  name: string
}

const EXPERIENCE_LEVELS = ['0–1 years', '2–3 years', '4–5 years', '5+ years']

// No account required — public insert per the explicit requirement.
// Doesn't auto-add anyone to WhatsApp; shows an honest "here's what
// happens next" confirmation instead of pretending the group access is
// immediate. career_circle_interest_started fires once, on first mount
// (matches "started" as "reached this form"), not on every keystroke.
export default function CareerCircleJoin() {
  const [circles, setCircles] = useState<Circle[]>([])
  const [circleId, setCircleId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [goals, setGoals] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('career_circles')
      .select('id, slug, name')
      .then(({ data }) => {
        if (data) {
          setCircles(data)
          if (data.length > 0) setCircleId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (circles.length === 0) return
    const circle = circles.find((c) => c.id === circleId) ?? circles[0]
    analytics.careerCircleInterestStarted({ circle_id: circle.id, circle_slug: circle.slug })
    // Only fire once per page visit, not once per circle selection —
    // deliberately depends only on `circles` loading, not `circleId`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circles.length > 0])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!supabase) {
      setError('This isn’t available right now — please check back shortly.')
      return
    }
    if (!consent) {
      setError('Please check the consent box to continue.')
      return
    }
    setSubmitting(true)
    const { error: dbError } = await supabase.from('career_circle_interests').insert({
      circle_id: circleId,
      name,
      email,
      whatsapp_number: whatsapp,
      current_role: role,
      experience_level: experience,
      goals: goals || null,
      consent_to_contact: consent,
    })
    setSubmitting(false)
    if (dbError) {
      setError('Something went wrong submitting this — please try again.')
      return
    }
    const circle = circles.find((c) => c.id === circleId)
    if (circle) analytics.careerCircleInterestSubmitted({ circle_id: circle.id, circle_slug: circle.slug })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
          <CheckCircle2 size={32} className="text-green mx-auto mb-5" aria-hidden="true" />
          <h1 className="font-display text-3xl mb-3">You’re on the list.</h1>
          <p className="text-text-secondary leading-relaxed mb-2">
            We review every submission by hand — this isn’t automatic. If it’s
            a good fit, you’ll get a WhatsApp message directly with the group
            invite, usually within a few days.
          </p>
          <p className="text-text-tertiary text-sm mb-8">
            Nothing else happens automatically — you won’t be added to
            anything without hearing from us first.
          </p>
          <Link to="/career-circle"><Button variant="secondary">Back to Career Circle</Button></Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-[520px] mx-auto px-6 py-16 md:py-20">
        <Link to="/career-circle" className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft size={15} aria-hidden="true" />
          Back
        </Link>

        <h1 className="font-display text-3xl md:text-4xl mb-2">Join a Career Circle</h1>
        <p className="text-text-secondary leading-relaxed mb-8">
          Tell us a bit about where you are — we review every submission
          by hand, not automatically.
        </p>

        {!supabase && (
          <p className="text-text-tertiary text-sm border border-border-subtle rounded-md p-4">
            This isn’t available right now — please check back shortly.
          </p>
        )}

        {supabase && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {circles.length > 1 && (
              <Field label="Career circle">
                <select value={circleId} onChange={(e) => setCircleId(e.target.value)} className={inputClass}>
                  {circles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="Name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field label="WhatsApp number">
              <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91…" className={inputClass} />
            </Field>
            <Field label="Current role / background">
              <input required value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Analyst at a fintech startup" className={inputClass} />
            </Field>
            <Field label="Experience level">
              <select required value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass}>
                <option value="" disabled>Select…</option>
                {EXPERIENCE_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </Field>
            <Field label="What are you hoping to get from this? (optional)">
              <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} className={inputClass} />
            </Field>

            <label className="flex items-start gap-2.5 text-sm text-text-secondary mt-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              I consent to being contacted and, if accepted, added to the relevant WhatsApp group.
            </label>

            {error && <p className="text-red text-sm">{error}</p>}

            <Button type="submit" disabled={submitting} className="mt-2 justify-center">
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  )
}

const inputClass = 'bg-bg-surface border border-border-default rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition-colors w-full'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] text-text-tertiary">{label}</span>
      {children}
    </label>
  )
}
