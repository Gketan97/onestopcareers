import type { ReactNode } from 'react'
import Layout from '../components/shell/Layout'

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-[720px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <h1 className="font-display text-4xl mb-2">Terms of Service</h1>
        <p className="text-text-tertiary text-sm mb-12">Last updated: August 24, 2026</p>

        <div className="flex flex-col gap-8 text-text-secondary leading-relaxed">
          <Section title="What OneStopCareers is">
            <p>
              A career platform for analytics professionals &#8212; job
              listings pulled directly from company career pages, a peer
              community (Career Circle), and related resources as they
              ship. We are not a recruiter, staffing agency, or employer.
              We don&#8217;t place you in a job and don&#8217;t guarantee
              any listing results in an interview or offer.
            </p>
          </Section>

          <Section title="Job listings">
            <p>
              Job listings are pulled from each company&#8217;s own public
              career page or applicant tracking system, refreshed daily,
              and automatically removed after roughly 30 days or when they
              appear to no longer be accepting applications. We don&#8217;t
              independently verify each listing&#8217;s accuracy, and a
              listing being shown here doesn&#8217;t mean the role is
              still open at the moment you apply &#8212; always apply
              directly through the &#8220;Apply&#8221; link, which takes
              you to the company&#8217;s own site or ATS, not ours.
            </p>
          </Section>

          <Section title="Accounts">
            <p>
              Creating an account (for saving jobs) requires accurate
              contact information. You&#8217;re responsible for keeping
              your login credentials secure. One account per person.
            </p>
          </Section>

          <Section title="Career Circle">
            <p>
              Submitting the Career Circle interest form is not a
              guarantee of acceptance. Submissions are reviewed manually;
              we may decline a submission or a circle may be full. Being
              accepted means being added to a WhatsApp group with other
              members &#8212; you&#8217;re responsible for your own
              conduct in that group, and we may remove members for
              spam, harassment, or misuse of shared opportunities/referrals.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p className="mb-3">Please don&#8217;t:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Scrape, bulk-download, or republish job listings from this site</li>
              <li>Submit false information on the Career Circle form</li>
              <li>Use the site to spam or solicit other members</li>
              <li>Attempt to access another user&#8217;s account or saved jobs</li>
            </ul>
          </Section>

          <Section title="No warranty">
            <p>
              The site is provided as-is. We work to keep job listings
              accurate and current, but don&#8217;t guarantee
              completeness, accuracy, or that any particular listing is
              still open. We&#8217;re not liable for decisions made based
              on information shown here, including applying to or
              accepting a role.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these terms as the platform changes. Continued
              use after an update means you accept the current version.
            </p>
          </Section>

          <Section title="Governing law">
            <p>These terms are governed by the laws of India.</p>
          </Section>

          <Section title="Contact">
            <p>
              Questions: <a href="mailto:hello@onestopcareers.com" className="text-accent hover:underline">hello@onestopcareers.com</a>
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
