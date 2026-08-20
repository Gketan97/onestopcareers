# OneStop Jobs — Design Doc v1

**Status:** Draft for review
**Scope:** Brand positioning & copy, Jobs listing + detail, WhatsApp alert subscription, admin job submission, light-theme redesign, future-proofed architecture for success stories / resources / referrals.

---

## 1. Product overview & goals

OneStop Jobs is a standalone job-discovery product for the Indian market, built on top of an existing automated crawler (separate repo: `jobscout-date`) that aggregates listings from public ATS APIs (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Eightfold, Workday) and Adzuna, classifies them by India-relevance, and publishes `jobs.json` via CDN.

This rebuild has three goals:

1. **Decouple and simplify.** Previously the Jobs experience was embedded inside a broader, unrelated career-coaching site. This rebuild extracts it into its own repo with its own identity, built and shipped one component at a time rather than as one large surface.
2. **Add two new capabilities on top of the existing data pipeline:**
   - A **WhatsApp subscription service** so users get job alerts pushed to them, not just pulled via browsing.
   - An **admin form** for manually adding job links, replacing the ad-hoc Google Sheet as the source for non-crawled listings.
3. **Build for what's next without building it now.** Resources, success stories, and referrals are explicitly out of scope for this phase, but the routing, component library, and data layer must not require rework to add them later.

**Non-goals for this phase:** dark theme, resources/success-stories/referrals UI, employer-facing tooling, payments/monetization, native mobile app.

---

## 2. Brand & messaging

Positioning and copy are treated as design material here, not filler text to swap in later — every component in §5 that renders user-facing copy should pull from this section rather than inventing its own tone.

### Platform hook line (brand-level — sitewide, holds across Jobs and future modules)

> **"Knowing what to do was never the problem. Doing it daily is."**

This is deliberately not job-search-specific. The same failure mode — knowing the right action, not doing it consistently — applies to interview prep, networking, or whatever Resources/Referrals become later. Placing it at the brand level (nav, footer) means it doesn't need rewriting when new modules ship. Short-form alternate for tight spaces (mobile nav, footer): *"Advice is free. Follow-through isn't."*

### Motto

> **"Cut the crap."**

Blunt, ownable, used as the hero eyebrow / section label. Distinct from the hook line — the motto is *what we sound like*, the hook line is *what we're for*.

### Copy principles

1. **Name the specific failure, don't describe it abstractly.** "Most job advice online is wrong" is a claim. "I'll apply this weekend' becomes next Wednesday" is a memory the reader recognizes. Always prefer the second.
2. **Second person, present tense, no hedging.** "You didn't apply today" not "Users often struggle to apply consistently." State the behavior plainly before offering the fix.
3. **The fix is mechanical, not motivational.** We don't tell people to try harder or be more disciplined — every CTA should describe a system that removes the need for willpower (e.g. "it's in your WhatsApp the moment it's live," not "stay consistent!").
4. **One cushioning line max, then commit to the blunt version.** A line like "not because you're lazy" is allowed once per block to keep tone from reading as an accusation — but don't let it soften the actual point that follows.
5. **No stock filler.** Cut "unlock," "empower," "seamless," "your journey," or any phrase a job board's marketing team would also use. If a sentence could appear on a competitor's site unchanged, rewrite it.
6. **Keep the two positioning layers separate.** The platform makes a *trust* claim ("this is checked, unlike YouTube/creators/AI noise"). Each service makes a *behavior* claim specific to its own pain point (Jobs: "you don't apply daily"). Never let one service's execution pitch double as the platform's trust pitch, or vice versa — they answer different objections and belong in different sections.

### Reference copy (home page — canon for implementation)

**Platform layer** (brand-level — trust claim, applies to Jobs and every future module):

| Placement | Copy |
|---|---|
| Nav wordmark | onestop**careers** (full name, accent on "careers") — no subtext caption; the nav stays a clean wordmark + links + CTA |
| Platform hero eyebrow | Cut the crap. |
| Platform hero H1 | Your career, without the *noise.* |
| Platform hero sub | A YouTube video from someone who got lucky once. Old advice recycled by five different creators. An AI answer that sounds right and isn't. OneStopCareers is built the opposite way — jobs, resources, and real outcomes, all checked before they reach you. |
| Trust bar (under platform hero) | Every listing checked by hand — not scraped and dumped · No AI-generated links that go nowhere · No recycled advice from five other creators |
| Services strip | Jobs (live) / Resources (soon) / Success stories (soon) / Referrals (soon) — the canonical four modules. Do not introduce a new label here without adding it to navConfig.ts and App.tsx's reserved routes too — see the naming audit note below. |

**Jobs service layer** (scoped to this one service — behavior/execution claim, not a trust claim):

| Placement | Copy |
|---|---|
| Jobs section eyebrow | Jobs — live now |
| Jobs section H2 | You know how to job search. You just don't do it *daily.* |
| Jobs section sub | "I'll apply this weekend" becomes next Wednesday, becomes next month — and 500 people already applied before you opened the tab. We don't teach you more. We make sure today happens. |
| WhatsApp CTA H3 | You didn't apply today. You won't tomorrow either. |
| WhatsApp CTA body | Not because you're lazy — "later" just always wins when nothing's forcing your hand. The moment a matching role goes live, it's in your WhatsApp. No dashboard to remember, no tab you meant to bookmark. You either act right then, or you don't — but you'll never lose to "I didn't see it." |

Jobs page H1 intentionally stays functional/plain ("Jobs" + live count), not pain-point copy — the pain point is the *reason* someone lands there via the hero/alerts, not something the listing page itself needs to re-argue.

### Naming audit note

The four modules are **Jobs, Resources, Success stories, Referrals** — this is canonical, cross-check `navConfig.ts`, the Home.tsx Services strip, and App.tsx's reserved routes against this list before adding or renaming anything.

Two corrections made after an initial naming pass: "Case studies" was renamed to **"Success stories"** — in a job-search context, "case study" risks being read as case-interview practice material (a specific, different thing for product/consulting applicants), while "success stories" is unambiguous and matches how LinkedIn/Duolingo/most consumer platforms label this content type. Separately, an ad hoc "Advice" module that appeared only in the Services strip (not in the nav, not in this doc's original scope) was removed — it duplicated Resources with no distinguishable purpose. Any future new module name should be added here first, not invented directly in a component.

### Open copy work (not yet written, needed before build)

- Alerts signup flow microcopy (`/alerts`, `/alerts/verify`, `/alerts/unsubscribe`) — consent checkbox language in particular needs care per §9 compliance requirements.
- Admin form labels/validation messages (§7).
- Empty states (`jobs/EmptyState.tsx`) — per the docx/frontend voice rule, an empty state should read as an invitation to act, not an apology.
- Error states — should name what happened plainly, not hedge.

---



## 3. Design language & tokens

### Inherited DNA (from previous dark-theme version, adapted to light)

The previous version's visual identity had good bones worth keeping: a serif/sans/mono typographic triad, a single warm accent color rather than a rainbow palette, a layered-surface token system, restrained motion, and semantic color-coding for recency. All of this carries forward — only the light/dark polarity changes.

| Element | Previous (dark) | Carried forward as (light) |
|---|---|---|
| Display face | Instrument Serif | Instrument Serif *(unchanged — works on light too)* |
| Body face | DM Sans | DM Sans *(unchanged)* |
| Mono/label face | DM Mono | DM Mono *(unchanged)* |
| Base surface | `#080808` | `#FAF9F6` (warm off-white, not pure white) |
| Elevated surface | `#181818` | `#FFFFFF` |
| Primary text | `#F5F3EE` | `#1A1815` |
| Accent | `#E8622A` (burnt orange) | `#D65A2B` (slightly deepened for contrast on light) |
| Recency: fresh | `#16a34a` | `#15803D` (darkened for AA contrast on white) |
| Recency: aging | `#d97706` | `#B45309` |
| Recency: stale | `#9ca3af` | `#78716C` |
| Border | `rgba(255,255,255,0.06–0.10)` | `rgba(26,24,21,0.08–0.14)` |

### Proposed token set

```css
:root {
  /* Surfaces */
  --bg-base:        #FAF9F6;
  --bg-surface:     #FFFFFF;
  --bg-elevated:    #FFFFFF;
  --bg-sunken:      #F1EFEA;

  /* Text */
  --text-primary:   #1A1815;
  --text-secondary: #6B6862;
  --text-tertiary:  #A6A29A;

  /* Accent */
  --accent:         #D65A2B;
  --accent-soft:    rgba(214,90,43,0.08);
  --accent-border:  rgba(214,90,43,0.25);

  /* Semantic (recency, status) */
  --green:  #15803D;
  --amber:  #B45309;
  --gray:   #78716C;
  --red:    #B91C1C;

  /* Borders */
  --border-subtle:  rgba(26,24,21,0.08);
  --border-default: rgba(26,24,21,0.14);

  /* Type scale (1.25 ratio, 16px base) */
  --text-xs:   0.75rem;   /* 12px — meta labels, mono */
  --text-sm:   0.875rem;  /* 14px — secondary body */
  --text-base: 1rem;      /* 16px — body */
  --text-lg:   1.25rem;   /* 20px — card titles */
  --text-xl:   1.563rem;  /* 25px — section headers */
  --text-2xl:  1.953rem;  /* 31px — page headers */
  --text-3xl:  3.052rem;  /* 49px — hero, serif display only */

  /* Spacing (4px base unit) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* Radii */
  --radius-sm: 6px;   /* chips, badges */
  --radius-md: 10px;  /* cards */
  --radius-lg: 16px;  /* modals, panels */

  /* Shadows — used sparingly, borders preferred */
  --shadow-sm: 0 1px 2px rgba(26,24,21,0.04);
  --shadow-md: 0 4px 16px rgba(26,24,21,0.06);
}
```

### Direction options

**A. Editorial / calm** *(recommended)*
Generous whitespace, serif headlines, mono metadata, borders over shadows, one accent used sparingly (CTA buttons, active filter chips, recency dot). Feels closer to a well-typeset publication than a SaaS dashboard. Lowest risk of feeling generic; matches the previous version's restraint.

**B. Dense / functional**
Tighter row-based list (think LinkedIn Jobs / a spreadsheet), smaller type scale, more visible filters up front, optimized for scanning volume fast. Better if user research shows people want to scan 50+ listings quickly rather than read fewer, more considered cards.

**C. Card-grid / visual**
Larger cards with company logos as the dominant visual element, grid layout, more color per card (e.g. per-function color coding, which the data already supports via the `color` field). Higher build cost (needs a logo pipeline — see open questions), more "product-y," less editorial.

**Recommendation:** **A (Editorial/calm)**, closest continuation of the existing brand voice, cheapest to build well, and the mono/serif pairing already does a lot of the "feels considered" work without needing heavy visual assets like logos.

---

## 4. Information architecture / routing

```
/                         → Home (minimal — jobs-first landing, not the old
                             career-coaching homepage)
/jobs                     → Jobs listing
/jobs/:id                 → Job detail
/alerts                   → WhatsApp subscription signup + manage preferences
/alerts/verify            → OTP/opt-in confirmation step
/alerts/unsubscribe       → One-click unsubscribe (token-based link, no login)

/admin                    → Admin login
/admin/jobs/new           → Manual job submission form
/admin/jobs               → List/edit manually submitted jobs

── Reserved, not built now ──
/success-stories          → (future)
/success-stories/:slug    → (future)
/resources                → (future)
/referrals                → (future)
```

**Seams for future growth:**
- `Home` should be a thin composition of section components (`<JobsPreview>`, later `<CaseStudiesPreview>`, etc.), not a monolith — adding a new section later means adding a component, not editing existing ones.
- Nav (`src/components/shell/Nav.tsx`) should render its link list from a config array, not hardcoded JSX, so adding `Resources`/`Referrals` later is a one-line change.
- The router file (`src/app/routes.tsx`) should be the *only* place routes are declared — no route logic scattered in components — so reserved routes above can be uncommented/added without hunting through the codebase.
- Data layer (`src/lib/`) should be organized **by domain** (`lib/jobs/`, `lib/alerts/`, `lib/admin/`) from day one, even though only `jobs/` and `alerts/` have content now — this means `lib/success-stories/` later is an addition, not a restructuring.

---

## 5. Component inventory & build order

Organized by domain folder, in the order you should build them — each is independently shippable/testable before moving to the next.

### Phase 1 — Foundation
| Component | Purpose |
|---|---|
| `ui/Button.tsx` | Primary/secondary/ghost button variants |
| `ui/Badge.tsx` | Small pill — used for seniority, mode, function tags |
| `ui/Input.tsx` | Text input, used by search + forms |
| `ui/Skeleton.tsx` | Loading placeholder shapes |
| `shell/Nav.tsx` | Top nav, config-driven link list |
| `shell/Footer.tsx` | Footer |
| `shell/Layout.tsx` | Page shell wrapping Nav + Footer + content |

### Phase 2 — Jobs (primary redesign target)
| Component | Purpose |
|---|---|
| `jobs/JobCard.tsx` | Single listing — title, company, meta, recency dot |
| `jobs/JobSearch.tsx` | Search input, debounced, syncs to URL `?q=` |
| `jobs/JobFilters.tsx` | Function/city/mode/seniority filter chips |
| `jobs/JobSort.tsx` | Sort control (recency, relevance) |
| `jobs/JobList.tsx` | Composes search+filters+sort, renders `JobCard[]`, pagination |
| `jobs/EmptyState.tsx` | No-results state |
| `pages/Jobs.tsx` | Thin page: `<JobList />` + page chrome |
| `pages/JobDetail.tsx` | Single job full view + apply CTA |

### Phase 3 — Alerts (WhatsApp)
| Component | Purpose |
|---|---|
| `alerts/PhoneInput.tsx` | Phone number entry with country code, validation |
| `alerts/PreferenceForm.tsx` | Function/city/keyword preference picker |
| `alerts/OtpVerify.tsx` | OTP entry step |
| `alerts/ConsentNotice.tsx` | Explicit consent copy + checkbox (required, see §9) |
| `pages/Alerts.tsx` | Composes the above into the signup flow |
| `pages/Unsubscribe.tsx` | Token-link landing page, one action: confirm unsubscribe |

### Phase 4 — Admin
| Component | Purpose |
|---|---|
| `admin/LoginForm.tsx` | Auth gate |
| `admin/JobSubmissionForm.tsx` | Manual job entry, validated against Job schema |
| `admin/JobSubmissionList.tsx` | Table of manually submitted jobs, edit/delete |
| `pages/AdminJobs.tsx` | Composes the above |

---

## 6. Data contract

The `Job` type is the seam between three producers (crawler, admin form) and one consumer (frontend). It must be versioned and documented in **both** repos, not just this one.

```ts
// lib/jobs/types.ts
interface Job {
  id: string            // stable, deduped key: `${source}-${hash(company+title+city)}`
  title: string
  company: string
  location: string       // raw location string
  city: string            // normalized
  mode: 'remote' | 'hybrid' | 'onsite'
  fn: 'data' | 'product' | 'bizops' | 'engineering' | 'finance' | 'design'
  seniority: string
  url: string
  color: string           // hex, used for function-tag accent
  posted_at: string       // YYYY-MM-DD
  src: 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'smartrecruiters'
     | 'eightfold' | 'workday' | 'adzuna' | 'manual'
  tier: 1 | 2 | 3 | 4      // company tier, used in India-classification heuristics
  dept: string
  country: string
}
```

**Versioning approach:**
- Add a top-level `schema_version` field to the published `jobs.json` (currently absent — recommend adding as part of this rebuild).
- Treat the schema as **additive-only**: new optional fields are fine without a version bump; removing or renaming a field, or changing an enum's valid values, requires a version bump and a compatibility note in `DATA_CONTRACT.md` in *both* repos.
- Frontend's `fetchJobs.ts` should validate the shape at runtime (e.g. with `zod`) and fail loudly (logged, not silently swallowed) if the CDN payload doesn't match the expected schema — this is cheap insurance against the two repos drifting.

**Where admin-submitted jobs live:** see §7 — they are *not* written directly into the crawler's `jobs.json`, to keep the crawler's output single-writer.

---

## 7. Admin form for manual job submission

Per your decision, this replaces the Google Sheet with a proper internal tool rather than a no-code sheet.

**Fields** (mirrors the `Job` schema, with `src` hardcoded to `'manual'` and a couple of admin-only fields):
- `title`, `company`, `location`, `url` — required
- `city`, `mode`, `fn`, `seniority` — required, but auto-suggested from `title`/`location` (reuse the crawler's `detectCity`/`detectMode`/`detectSeniority` heuristics, ported into the frontend as a shared util or exposed via a small API) with the admin able to override
- `posted_at` — defaults to today, editable
- `color` — defaults to a per-function palette, not manually picked
- `submitted_by` — auto-filled from the authenticated admin session (audit trail)
- `notes` (internal only, not shown publicly) — free text, e.g. "found via referral from X"

**Storage:** a small database (not appended directly to `jobs.json`) — e.g. a lightweight Postgres/SQLite table or a serverless KV store, owned by *this* repo, not the crawler repo. A scheduled or on-submit job merges admin-submitted entries into the jobs feed the frontend actually reads (either by writing a second `manual-jobs.json` that the frontend merges client-side with the CDN `jobs.json`, or by fronting both with a small read API). This keeps the crawler's `jobs.json` single-writer (the crawler only) so the two data sources never race or get overwritten by each other.

**Validation:** required-field checks, URL format validation, duplicate-detection against existing jobs (same company+title+city) with a warning (not a hard block — sometimes re-listing is legitimate) before save.

**Auth:** see §9 — this form must sit behind authentication, it is not public.

---

## 8. WhatsApp subscription service

### Flow
1. User visits `/alerts`, enters phone number + preferences (function, city, optional keyword).
2. Explicit consent checkbox is required before submission (see §9) — no pre-checked boxes.
3. OTP sent via WhatsApp (or SMS fallback) to verify the number is real and belongs to the user; user enters OTP on `/alerts/verify`.
4. On success, subscription is created (status: `active`) and a WhatsApp-template welcome message is sent, including a clear unsubscribe link.
5. A separate scheduled worker (new, small service — can live in this repo or a tiny standalone one) runs after each crawler update: reads the latest `jobs.json` (+ merged manual jobs), diffs against what's new since the last run, matches new listings against each active subscriber's preferences, and sends batched WhatsApp messages (not one message per job — batch into a digest to avoid spamming and to stay within template-messaging norms).
6. Every message includes a one-tap unsubscribe link (`/alerts/unsubscribe?token=...`) — token-based, no login required, expires after use.

### Cadence
Recommend a **daily digest** by default (not real-time per-job pushes) — gentler on users, cheaper on message volume/cost, and avoids WhatsApp's per-message-template approval overhead for high-frequency sends. Make cadence a per-subscriber preference (`daily` / `weekly`) from the start even if only `daily` ships first — cheap to add now, expensive to retrofit.

### Storage
Subscriber data lives in its own table/store, **fully separate** from the public jobs dataset:
```
subscribers: { id, phone (encrypted), preferences (fn[], city[], keyword?),
                cadence, status ('pending_otp'|'active'|'unsubscribed'),
                consent_ts, otp_hash, otp_expires_at, unsub_token, created_at }
```
No subscriber data is ever merged into or exposed via the public `jobs.json`/CDN surface. Read access to the subscriber table is admin/service-only.

### Sending mechanism: Twilio vs. Meta direct

| | Twilio (WhatsApp API wrapper) | Meta WhatsApp Business API direct |
|---|---|---|
| Setup complexity | Lower — Twilio handles much of the Business verification friction | Higher — direct Meta Business verification, more paperwork |
| Cost at low/medium volume | Slightly higher per-message (Twilio markup) | Lower per-message, but only matters at real volume |
| Template approval | Managed through Twilio console, generally faster iteration | Direct through Meta, can be slower first time |
| Dev experience | Good SDKs, better docs for a small team | More raw, more control, more to maintain yourself |

**Recommendation:** **Twilio**, for this phase. At your current scale, the setup speed and DX outweigh the per-message cost difference, and migrating to Meta-direct later (if volume justifies it) doesn't require changing the subscriber data model — only the sending adapter, if that adapter is written as an isolated module (`lib/alerts/sender.ts`) rather than inlined into the worker logic.

---

## 9. Security & compliance

**Admin form:**
- Authentication required — recommend a simple email/password or magic-link auth for a single/small admin group to start (not open signup). Session-based, short expiry.
- Every submission/edit logged with `submitted_by` + timestamp (audit trail — see §7).
- Rate-limit login attempts (e.g. 5/15min per IP) to prevent brute force.

**Phone number collection & WhatsApp:**
- Explicit, unchecked-by-default consent checkbox with clear copy on what the user is opting into and how often they'll be messaged — required before OTP is even sent.
- Phone numbers **encrypted at rest**; access restricted to the sending worker and admin tooling, never exposed via any public API or client-side code.
- OTP verification before a number is marked `active` — prevents subscribing someone else's number.
- Unsubscribe must be one tap, no login, and honored immediately (not "up to 7 days" — set `status: unsubscribed` synchronously on click).
- **Flagging, not resolving:** WhatsApp Business Platform policy (template approval, opt-in requirements, messaging window rules) and India's DPDP Act (consent, data minimization, breach notification, grievance officer requirements) both have compliance obligations beyond what this doc can fully specify — recommend a dedicated compliance review before launch, not just engineering sign-off.

**Rate limiting / abuse prevention:**
- Public-facing `/alerts` signup: rate-limit by IP and by phone number (prevent OTP-spam abuse of a target's number).
- Admin login: rate-limited as above.
- No public endpoint should allow enumerating subscriber phone numbers or admin-submitted job internal notes.

**Secrets management:**
- Adzuna keys, Twilio credentials, admin auth secrets, database credentials — all via environment variables / a secret store (e.g. Netlify/Vercel env vars, or a proper secrets manager if infra grows). Never hardcoded, never committed — confirm `.gitignore` covers any local `.env` files (the previous repo's `.gitignore` should be audited for this too).

**CORS / API surface:**
- Public, read-only, no auth: `jobs.json` via CDN (unchanged).
- Public, write, no auth but rate-limited + OTP-gated: `/alerts` subscription endpoints.
- Auth-required: all `/admin/*` endpoints, subscriber data reads, unsubscribe-token issuance (token itself is public/one-time-use by design, but issuing new tokens is not).

**Threat model (abbreviated):**

| Actor | Risk | Mitigation |
|---|---|---|
| Scraper of your own `/jobs` pages | Re-scraping your aggregated data at scale | Low priority (data is already public via source ATSs) — but rate-limit if it becomes a cost/load issue |
| Spam signups on `/alerts` | Fake numbers, OTP abuse, message-cost inflation | OTP verification, IP + phone rate limiting |
| Compromised admin credentials | Fake/malicious job listings published | Audit log, short session expiry, consider 2FA if the admin group grows |
| Subscriber data leak | Phone numbers/preferences exposed | Encryption at rest, no public API surface, access-controlled storage |

---

## 10. Open questions / decisions needing input

1. **Company logos** — do we want them on `JobCard`? Direction C leans on this; Direction A (recommended) doesn't need them but could still benefit. If yes, need a source (Clearbit Logo API, manual upload via admin form, or skip).
2. **Admin form hosting/storage** — same repo as the frontend (serverless functions + a managed DB like Supabase/Postgres), or a small separate service? Affects §7 architecture.
3. **WhatsApp digest timing** — fixed time of day (e.g. 9am IST) or per-subscriber configurable? Start fixed, make configurable later?
4. **DPDP Act compliance review** — who owns this / when does it happen relative to launch? Flagged in §9 but needs an owner and timeline, not just an engineering task.
5. **Home page scope** — is `/` purely a `/jobs` redirect for now, or a minimal landing page with its own copy/hero? Affects Phase 1 build order.
6. **Manual job submission volume** — expected frequency (a few a week vs. dozens a day) affects whether the admin form needs bulk-import (CSV upload) in addition to single-entry, or if single-entry is sufficient for now.
