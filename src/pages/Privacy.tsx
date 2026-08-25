import type { ReactNode } from 'react'
import Layout from '../components/shell/Layout'

// Written to accurately describe what this specific system actually
// does — the real tables (profiles, saved_jobs, career_circle_interests),
// the real third parties (Supabase, PostHog, Google, Netlify), and the
// real PII discipline already built into analytics.ts (no email/name/
// phone ever sent to PostHog). NOT lawyer-reviewed — DPDP Act compliance
// was flagged as an open item early in this project and never formally
// reviewed. Treat this as an accurate functional draft, not a substitute
// for real legal review before relying on it.
export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-[720px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <h1 className="font-display text-4xl mb-2">Privacy Policy</h1>
        <p className="text-text-tertiary text-sm mb-12">Last updated: August 24, 2026</p>

        <div className="flex flex-col gap-8 text-text-secondary leading-relaxed">
          <Section title="What this covers">
            <p>
              This policy describes what OneStopCareers (&#8220;we,&#8221;
              &#8220;us&#8221;) collects when you use onestopcareers.com,
              why, and who it&#8217;s shared with. Browsing Jobs, Companies,
              and Career Circle information does not require an account
              and does not require sharing any personal information.
            </p>
          </Section>

          <Section title="What we collect">
            <p className="mb-3"><strong className="text-text-primary">If you create an account</strong> (Google sign-in or email/password): your email address, and if you sign in with Google, your name and profile picture as provided by Google. We do not see or store your Google password.</p>
            <p className="mb-3"><strong className="text-text-primary">If you save jobs:</strong> which job listings you&#8217;ve saved, tied to your account.</p>
            <p className="mb-3"><strong className="text-text-primary">If you submit a Career Circle interest form:</strong> your name, email, WhatsApp number, current role, experience level, and anything you write in the optional &#8220;what are you hoping to get from this&#8221; field. This does not require creating an account.</p>
            <p><strong className="text-text-primary">Usage data:</strong> we use PostHog to understand how the site is used &#8212; which pages are viewed, which searches and filters are used, which jobs get clicked. This is deliberately limited to job/company/circle identifiers and category labels (e.g. which function or work-mode filter you used) &#8212; we do not send your name, email, or phone number to our analytics tool, by design in how the tracking code is built, not just as a policy.</p>
          </Section>

          <Section title="Who it's shared with">
            <p className="mb-3">We use a small number of third-party services to run this site, and don&#8217;t sell or share your data beyond what&#8217;s needed to operate them:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li><strong className="text-text-primary">Supabase</strong> &#8212; hosts our database and handles authentication (account creation, login sessions, saved jobs, Career Circle submissions).</li>
              <li><strong className="text-text-primary">Google</strong> &#8212; if you choose to sign in with Google, Google handles that authentication; we only receive your email, name, and profile picture.</li>
              <li><strong className="text-text-primary">PostHog</strong> &#8212; our analytics provider, receives the limited non-personal usage data described above.</li>
              <li><strong className="text-text-primary">Netlify</strong> &#8212; hosts the website itself.</li>
              <li><strong className="text-text-primary">WhatsApp</strong> &#8212; if you&#8217;re accepted into a Career Circle, you&#8217;ll be added to a WhatsApp group using the number you provided. WhatsApp&#8217;s own privacy practices apply to that group once you&#8217;re in it.</li>
            </ul>
          </Section>

          <Section title="Career Circle submissions specifically">
            <p>
              Submitting the interest form does not mean you&#8217;re automatically
              added to anything. Every submission is reviewed manually. If
              accepted, we&#8217;ll contact you directly before adding you to
              any WhatsApp group. Your submission is visible only to us, not
              to other applicants.
            </p>
          </Section>

          <Section title="Cookies and local storage">
            <p>
              We use cookies and browser local storage to keep you signed
              in between visits and to support analytics. We don&#8217;t use
              third-party advertising cookies or trackers.
            </p>
          </Section>

          <Section title="Your choices">
            <p>
              You can browse the entire site without an account. If you
              have an account and want it deleted, or want to know what
              data we hold about you, email{' '}
              <a href="mailto:hello@onestopcareers.com" className="text-accent hover:underline">hello@onestopcareers.com</a>{' '}
              and we&#8217;ll handle it directly &#8212; there isn&#8217;t yet
              a self-service delete-my-account button, so this is a manual
              request for now.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this changes meaningfully, we&#8217;ll update the date at
              the top of this page. We don&#8217;t send a separate notice
              for minor wording changes.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy: <a href="mailto:hello@onestopcareers.com" className="text-accent hover:underline">hello@onestopcareers.com</a>
            </p>
          </Section>
        </div>
      </div>
    </Layout>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-text-primary mb-3">{title}</h2>
      {children}
    </section>
  )
}
