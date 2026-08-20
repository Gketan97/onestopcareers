import type { ReactNode } from 'react'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'

export default function CareerCircle() {
  return (
    <Layout>
      {/* Pain points → resolve, same pattern as the platform hero */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-14">
        <div className="font-mono text-xs uppercase tracking-wide text-accent mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          CareerCircle
        </div>

        <div className="flex flex-col gap-3 max-w-xl mb-10">
          <PainLine>Ten tabs open, applying at random, hoping something sticks.</PainLine>
          <PainLine>No idea if what you&apos;re doing is even right.</PainLine>
          <PainLine>Nobody around who&apos;s in the same fight.</PainLine>
          <PainLine>Just you, alone, refreshing an inbox that doesn&apos;t reply.</PainLine>
        </div>

        <h1 className="font-display text-4xl md:text-6xl leading-[1.08] max-w-2xl">
          You don&apos;t have to do this <em className="text-accent not-italic italic">alone.</em>
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
          CareerCircle is a small, closed WhatsApp community — a place to ask
          for referrals, sanity-check a decision, and talk shop with people
          in the exact same fight as you.
        </p>

        <div className="mt-10">
          <Button title="Coming soon — group link not live yet">
            Request to join →
          </Button>
        </div>
      </section>

      {/* What it is */}
      <section className="bg-bg-sunken px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-[1040px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoBlock
            title="Peer discussion, not a broadcast channel"
            body="Ask what you're actually stuck on. Share what's not working. Get answers from people applying to the same roles, not a generic forum."
          />
          <InfoBlock
            title="Referrals from inside the group"
            body="When someone in the circle can refer you, they will. That's the whole point of keeping it small."
          />
          <InfoBlock
            title="5x the job updates"
            body="CareerCircle gets roles pushed here before — and more often than — the free OneStopCareers job channel."
          />
        </div>
      </section>

      {/* Who can join */}
      <section className="max-w-[720px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <h2 className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-5">
          Who can join
        </h2>
        <p className="font-display text-2xl md:text-[28px] leading-snug mb-10">
          Built for one specific group right now — not everyone, on purpose.
        </p>

        <div className="flex flex-col gap-4 mb-12">
          <Criterion>2–5 years of experience</Criterion>
          <Criterion>Targeting analytics-focused roles</Criterion>
        </div>

        <h2 className="font-mono text-xs uppercase tracking-wide text-text-tertiary mb-5">
          Group rules
        </h2>
        <div className="flex flex-col gap-4">
          <Criterion>Capped at 50 people — small enough that referrals actually mean something</Criterion>
          <Criterion>Give feedback, not just ask for it</Criterion>
          <Criterion>Talk work in your domain — projects, decisions, what's actually happening</Criterion>
          <Criterion>No recruiters, no spam, no unrelated promotion</Criterion>
        </div>
      </section>

      {/* Closing CTA */}
      <div className="max-w-[1040px] mx-auto my-20 px-6 md:px-12">
        <div className="bg-text-primary rounded-lg px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <h3 className="font-display text-2xl md:text-[30px] text-bg-base leading-snug">
              If this is you, you already know it.
            </h3>
            <p className="text-white/60 mt-3 text-[15px] max-w-md leading-relaxed">
              Fifty people, 2–5 YOE, all in analytics roles, all figuring
              this out at the same time you are.
            </p>
          </div>
          <Button className="whitespace-nowrap" title="Coming soon — group link not live yet">
            Request to join →
          </Button>
        </div>
      </div>
    </Layout>
  )
}

function PainLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-lg text-text-secondary flex items-start gap-3">
      <span className="text-accent mt-1">—</span>
      {children}
    </p>
  )
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-6">
      <h3 className="font-display text-xl mb-2.5">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
    </div>
  )
}

function Criterion({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-[15px] text-text-secondary">
      <span className="text-green mt-0.5">✓</span>
      {children}
    </div>
  )
}
