import posthog from 'posthog-js'

const key = import.meta.env.VITE_POSTHOG_KEY
const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

let initialized = false

export function initAnalytics() {
  if (!key || initialized) return
  posthog.init(key, {
    api_host: host,
    // Sensible defaults for a mostly-anonymous-browsing product: capture
    // pageviews automatically, but don't autocapture every click/input —
    // this project tracks a small, deliberate event set (below), not
    // "everything by default."
    capture_pageview: true,
    autocapture: false,
    persistence: 'localStorage+cookie',
  })
  initialized = true
}

export function identifyUser(userId: string) {
  if (!initialized) return
  // Identify by Supabase user id only — never email, name, or phone.
  posthog.identify(userId)
}

export function resetAnalytics() {
  if (!initialized) return
  posthog.reset()
}

// ─────────────────────────────────────────────────────────────────────────
// Event set — deliberately small and typed. Every property type below is
// non-PII by construction (job/company/circle identifiers, category
// labels, counts) — there's no `email`/`name`/`phone` field anywhere in
// these signatures, so sending PII to PostHog would require actively
// fighting the types, not just forgetting a convention.
// ─────────────────────────────────────────────────────────────────────────

function track<T extends object>(event: string, props?: T) {
  if (!initialized) return
  posthog.capture(event, props)
}

interface JobContext {
  job_id: string
  company: string // company NAME, not company_id — no companies table exists (see design doc); name is not PII
  function?: string
  level?: string
  work_mode?: string
}

export const analytics = {
  // Jobs
  jobViewed: (job: JobContext) => track('job_viewed', job),
  jobApplyClicked: (job: JobContext) => track('job_apply_clicked', job),
  jobSaved: (job: JobContext) => track('job_saved', job),
  jobSearch: (props: { result_count: number; has_query: boolean }) => track('job_search', props),
  jobFilterApplied: (props: { filter_type: string; filter_value: string }) => track('job_filter_applied', props),

  // Companies
  companyViewed: (props: { company: string; role_count: number }) => track('company_viewed', props),
  companyJobClicked: (props: { company: string; job_id: string }) => track('company_job_clicked', props),
  companiesSearch: (props: { result_count: number; has_query: boolean }) => track('companies_search', props),

  // Auth
  signupCompleted: (props: { method: 'google' | 'email' }) => track('signup_completed', props),
  loginCompleted: (props: { method: 'google' | 'email' }) => track('login_completed', props),

  // Career Circles
  careerCircleViewed: (props: { circle_id: string; circle_slug: string }) => track('career_circle_viewed', props),
  careerCircleInterestStarted: (props: { circle_id: string; circle_slug: string }) => track('career_circle_interest_started', props),
  careerCircleInterestSubmitted: (props: { circle_id: string; circle_slug: string }) => track('career_circle_interest_submitted', props),
  careerCircleWhatsappClicked: (props: { circle_id: string; circle_slug: string }) => track('career_circle_whatsapp_clicked', props),
}
