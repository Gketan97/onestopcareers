import type { ElementType } from 'react'
import {
  Briefcase, Handshake, MessagesSquare, BookOpen, HelpCircle, TrendingUp,
  Target, ShieldCheck, MessageCircle, CircleCheck, Users2, UserCircle,
  ArrowRight,
} from 'lucide-react'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import CareerCircleMockup from '../components/home/CareerCircleMockup'
import FAQAccordion, { type FAQItem } from '../components/home/FAQAccordion'

// Full rebuild, 2026-08-23, from a dedicated 10-section Career Circle
// brief the user provided directly (same pattern as the homepage
// rebuild). Supersedes the previous pain-point-led version of this page
// entirely — kept in design doc history, not this file. CTAs remain
// "coming soon" throughout: the group itself isn't live yet (no real
// invite link exists), same honesty standard as every other unbuilt CTA
// on the site.

const insideCards: { icon: ElementType; title: string; desc: string }[] = [
  { icon: Briefcase, title: 'Share Opportunities', desc: 'Jobs and openings worth knowing about.' },
  { icon: Handshake, title: 'Exchange Referrals', desc: 'Help each other get introductions.' },
  { icon: MessagesSquare, title: 'Interview Together', desc: 'Share interview experiences and preparation.' },
  { icon: BookOpen, title: 'Learn From Each Other', desc: 'Resources, tools, skills and lessons.' },
  { icon: HelpCircle, title: 'Ask When You’re Stuck', desc: 'Get perspective from people who understand your situation.' },
  { icon: TrendingUp, title: 'Grow Together', desc: 'Celebrate wins and learn from setbacks.' },
]

const whyConcepts: { icon: ElementType; label: string }[] = [
  { icon: Target, label: 'Relevance' },
  { icon: ShieldCheck, label: 'Trust' },
  { icon: MessageCircle, label: 'Participation' },
  { icon: CircleCheck, label: 'Accountability' },
  { icon: Users2, label: 'Shared career stage' },
]

const howSteps: { icon: ElementType; title: string; desc: string }[] = [
  { icon: UserCircle, title: 'Tell us about yourself', desc: 'Experience, role, goals.' },
  { icon: Users2, title: 'Find your Circle', desc: 'Get connected with relevant peers.' },
  { icon: MessageCircle, title: 'Join the conversation', desc: 'Share, ask, learn and help.' },
  { icon: TrendingUp, title: 'Grow together', desc: 'Opportunities, knowledge, referrals and support.' },
]

const roles = ['Data Analyst', 'Business Analyst', 'Product Analyst', 'BI Analyst', 'Analytics Engineer']

const principles = ['Give before you ask.', 'Share what you learn.', 'Help others get ahead.', 'Keep it respectful.', 'No spam.']

// Honest answers using only facts already established elsewhere on the
// site (2–5 YOE, capped at 50, WhatsApp-based) — no invented pricing
// or policy, per the brief's explicit instruction.
const faqItems: FAQItem[] = [
  { q: 'Who can join?', a: 'Right now, analytics professionals with 2–5 years of experience — Data Analysts, Business Analysts, Product Analysts, BI Analysts, and Analytics Engineers. We’ll expand to other career stages later.' },
  { q: 'How are circles formed?', a: 'We group people by career stage and focus area, aiming for real overlap in what you’re working through — not a random assignment.' },
  { q: 'How many people are in a circle?', a: 'Capped at 50 — small enough that referrals and answers actually mean something.' },
  { q: 'What happens after I join?', a: 'You’re added to your Circle’s WhatsApp group and can start sharing, asking, and helping right away.' },
  { q: 'Is Career Circle free?', a: 'Yes — Career Circle is free to join.' },
  { q: 'Where does the community live?', a: 'WhatsApp, for now — where most of these conversations already happen naturally.' },
  { q: 'Can I change circles?', a: 'Not yet — reach out and we’ll help directly. This may become self-serve later.' },
]

export default function CareerCircle() {
  return (
    <Layout>
      {/* ===================== 1. HERO ===================== */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-20 text-center">
        <h1 className="font-display text-5xl md:text-6xl leading-[1.1] animate-blur-in">
          You shouldn’t have to figure out your career <em className="text-accent not-italic italic">alone.</em>
        </h1>
        <p className="mt-6 text-xl text-text-secondary leading-relaxed max-w-xl mx-auto animate-blur-in" style={{ animationDelay: '80ms' }}>
          Join a small peer circle of analytics professionals at a similar
          stage of their career. Share opportunities, referrals, knowledge,
          interview experiences, and career advice.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-9 items-center justify-center animate-blur-in" style={{ animationDelay: '150ms' }}>
          <Button className="group" title="Coming soon — group link not live yet">
            Join a Career Circle
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Button>
          <a href="#how-it-works">
            <Button variant="secondary">See How It Works</Button>
          </a>
        </div>
      </section>

      {/* ===================== 2. WHAT IS CAREER CIRCLE ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-[720px] mx-auto text-center">
          <p className="font-display text-2xl md:text-3xl leading-snug">
            A Career Circle is a small peer network of analytics
            professionals who are navigating similar career challenges.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8 font-mono text-[12px] text-text-tertiary">
            <span>Similar career stage</span>
            <span>Shared context</span>
            <span>Ongoing interaction</span>
            <span>Practical knowledge</span>
            <span>Mutual support</span>
          </div>
        </div>
      </section>

      {/* ===================== 3. WHAT HAPPENS INSIDE ===================== */}
      <section className="max-w-[1040px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12">What happens inside?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insideCards.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="bg-bg-surface border border-border-subtle rounded-md p-6 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mb-4">
                <Icon size={18} className="text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl mb-1.5">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== 4. WHY A SMALL CIRCLE ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[1040px] mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl leading-tight mb-5">
            Small enough to know each other. Big enough to help each other.
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto leading-relaxed mb-12">
            A massive generic community is easy to join and easy to ignore.
            A focused peer group at your exact career stage is worth
            actually showing up for.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {whyConcepts.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 border border-border-default rounded-full px-4 py-2.5">
                <Icon size={15} className="text-accent" aria-hidden="true" />
                <span className="text-sm text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 5. THE EXPERIENCE ===================== */}
      <section className="max-w-[720px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-4">What it actually feels like</h2>
        <p className="text-text-secondary text-center leading-relaxed mb-12">
          A conceptual look at the kind of conversation that happens inside —
          not a real chat export.
        </p>
        <CareerCircleMockup />
      </section>

      {/* ===================== 6. HOW IT WORKS ===================== */}
      <section id="how-it-works" className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24 scroll-mt-6">
        <div className="max-w-[1040px] mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-14">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="relative w-12 h-12 rounded-full bg-bg-base border-2 border-accent-border flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-accent" aria-hidden="true" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-bg-base font-mono text-[10px] flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-medium mb-1.5">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 7. WHO IS IT FOR ===================== */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 py-20 md:py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl leading-tight mb-5">
          Analytics professionals with 2–5 years of experience.
        </h2>
        <div className="flex flex-wrap justify-center gap-2.5 mt-8 mb-6">
          {roles.map((r) => (
            <span key={r} className="text-sm text-text-secondary border border-border-default rounded-full px-4 py-2">{r}</span>
          ))}
        </div>
        <p className="text-text-tertiary text-sm">We’ll expand to other career stages later.</p>
      </section>

      {/* ===================== 8. COMMUNITY PRINCIPLES ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl mb-10">Community principles</h2>
          <div className="flex flex-col gap-4">
            {principles.map((p) => (
              <p key={p} className="font-display text-xl text-text-secondary">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 9. FAQ ===================== */}
      <section className="max-w-[720px] mx-auto px-6 md:px-12 py-20 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-12">Questions</h2>
        <FAQAccordion items={faqItems} />
      </section>

      {/* ===================== 10. FINAL CTA ===================== */}
      <section className="bg-bg-sunken px-6 md:px-12 py-20 md:py-24 text-center">
        <h2 className="font-display text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
          Your career is easier when you don’t build it alone.
        </h2>
        <div className="mt-9">
          <Button className="group" title="Coming soon — group link not live yet">
            Join a Career Circle
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </Layout>
  )
}
