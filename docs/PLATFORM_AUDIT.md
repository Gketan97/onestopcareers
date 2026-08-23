# OneStopCareers — Full Platform Audit

**Date:** 2026-08-21
**Scope:** Every shipped page/component in `onestop-jobs`, plus the `jobscout-date` crawler where it affects what users see. This is a point-in-time exhaustive review, not a running design doc — see `DESIGN_DOC.md` for the forward-looking spec and prior decision history. This document's job is to be the single backlog everything below gets triaged from.

**Method:** eight lenses, each reviewing the actual code file-by-file, not the marketing version of the product. Every finding is either **NEW** (not caught before) or **already resolved** (cross-referenced to the milestone that fixed it, kept here for completeness so this reads as a full audit, not just a diff).

**Severity key:** 🔴 Critical (breaks trust, function, or looks broken to any visitor) · 🟠 High (real UX/brand/growth cost) · 🟡 Medium (should fix, not urgent) · ⚪ Low (polish)

---

## 1. Product lens

Does the product do what it says, and is the scope coherent?

| # | Finding | Severity | Status |
|---|---|---|---|
| P1 | Footer says **"OneStop Jobs — a focused job search, nothing else"** on every single page — this directly contradicts the entire platform pivot (Jobs + CareerCircle + Resources + Success stories). It's the last thing a visitor reads before leaving, and it tells them the opposite of what the homepage just told them. | 🔴 | **NEW** |
| P2 | Three separate "coming soon" CTAs live in production right now: nav's `Join CareerCircle`, CareerCircle page's two `Request to join` buttons, Resources/Success-stories cards. A visitor who clicks any of them gets nothing. One is expected during a build-out; three visible dead ends on a platform whose whole pitch is "we don't waste your time" is a real trust cost. | 🟠 | Known, not yet resolved (design doc §10 open questions) |
| P3 | `Job.tier` (company tier 1–4) and `Job.dept` fields flow through the entire pipeline and are never rendered or used anywhere in the frontend. Either there's a feature here (a "top companies" filter, a tier badge) or it's dead data — right now it's neither decided. | 🟡 | **NEW** |
| P4 | CareerCircle's "5x the job updates" and "capped at 50" are real operational commitments stated as present-tense fact on a live page, with no group yet existing to honor them. Flagged before (design doc §10) but worth restating at Critical-adjacent severity here: this is the single biggest claims-audit risk on the whole site if the group launches and doesn't actually deliver 5x. | 🟠 | Known, not yet resolved |
| P5 | No admin form yet (Phase 3, design doc §7) — manual job submission has no working path at all right now. Not urgent (crawler covers the vast majority of volume) but worth naming as the one core service-loop gap. | 🟡 | Known, planned |

---

## 2. Design / UX lens

| # | Finding | Severity | Status |
|---|---|---|---|
| D1 | No mobile nav menu at all | 🔴 | **RESOLVED** — Milestone 7 |
| D2 | Zero icons anywhere, hand-rolled SVGs | 🟠 | **RESOLVED** — Milestone 7 |
| D3 | No `focus-visible` states anywhere | 🟠 | **RESOLVED** — Milestone 7 |
| D4 | No motion/entrance animation | 🟡 | **RESOLVED** — Milestone 7 |
| D5 | Empty/error states were text-only | 🟡 | **RESOLVED** — Milestone 7 |
| D6 | Light theme read as generic/templated, no signature visual moment | 🟠 | **RESOLVED** — Milestone 8 (dark theme + orbit) |
| D7 | Hero had zero CTA | 🟠 | **RESOLVED** — Milestone 8 |
| D8 | No **skip-to-content** link — a keyboard/screen-reader user has to tab through the entire nav on every single page before reaching content. This is a WCAG 2.4.1 bypass-blocks failure, not just a nicety. | 🟠 | **NEW** |
| D9 | No scroll-restoration behavior defined — clicking a `JobCard` into `JobDetail` then hitting back may not return to the same scroll position in the list. React Router doesn't do this automatically; needs explicit handling. | 🟡 | **NEW** |
| D10 | No "share this job" / copy-link affordance on `JobDetail` — for a platform whose growth loop runs through a WhatsApp-native audience (CareerCircle), the absence of a one-tap share on the one page people are most likely to want to forward is a real gap. | 🟡 | **NEW** |
| D11 | No page-level loading indicator (e.g. a thin top progress bar) on route change — navigation feels slightly less responsive than it could, especially on slower connections. | ⚪ | **NEW** |
| D12 | Per-company accent colors (the thin `JobCard` left bar) were picked for a light background pre-dark-theme; not individually re-checked against the new dark surfaces. | ⚪ | Known (design doc §3), not yet resolved |

---

## 3. Engineering lens

| # | Finding | Severity | Status |
|---|---|---|---|
| E1 | Primary button text failed WCAG AA contrast (3.19:1) against the accent color, sitewide | 🔴 | **RESOLVED** — Milestone 8 |
| E2 | `text-tertiary` failed WCAG AA for small text (3.61:1) | 🟠 | **RESOLVED** — Milestone 8 |
| E3 | **No error boundary anywhere in the React tree.** Any uncaught render error — a malformed job object, a bad date string — takes the entire app to a white screen with zero recovery path, not just the broken component. | 🔴 | **NEW** |
| E4 | **No 404 / catch-all route.** Any URL that doesn't match a defined route (a typo, an old bookmarked link, a since-removed `/alerts` link) renders nothing — a blank page, no navigation, no explanation. | 🔴 | **NEW** |
| E5 | `fetchJobs()` has no request timeout, no retry, and no caching — a single `fetch()` with no `AbortSignal`. If the jsDelivr CDN is slow or briefly down, every page just spins on "Loading…" indefinitely with no fallback or retry affordance. | 🟠 | **NEW** |
| E6 | No runtime schema validation on the fetched `jobs.json` (e.g. `zod`) — if the crawler repo ever changes shape unexpectedly, the frontend fails silently or crashes rather than failing loudly with a clear message. Flagged as a recommendation in design doc §6, never implemented. | 🟡 | Known, not yet resolved |
| E7 | Zero automated tests anywhere — no unit tests on `format.ts`'s date logic, no component tests, no e2e smoke test on the critical path (load jobs → search → open detail → apply link works). For a one-person team this is a reasonable current tradeoff, but it means every deploy is fully manual-QA-or-nothing. | 🟡 | **NEW** |
| E8 | Stale light-theme accent color (`#D65A2B`) still used as the `JobCard`/`JobDetail` fallback for jobs missing crawler color data | 🟡 | **RESOLVED** — Milestone 8 |
| E9 | Crawler: version drift (v7 vs v8 inconsistently), dead `byMethod` variable, silent permanent-failure companies with no surfacing | 🟠 | **RESOLVED** — v8 audit |
| E10 | Crawler: no circuit-breaker/auto-pause for a company failing every run — only a log warning at 5 consecutive failures, no automatic `status: paused` | 🟡 | Known (v8 audit), partially resolved |

---

## 4. Content / Brand lens

| # | Finding | Severity | Status |
|---|---|---|---|
| C1 | Hero made two false process claims ("checked by hand," "expert-vetted") directly under the "cut the crap" motto | 🔴 | **RESOLVED** — claims audit milestone |
| C2 | "Advice" module existed only in one component, not in nav/scope | 🟡 | **RESOLVED** |
| C3 | "Case studies" naming risked confusion with case-interview prep | 🟡 | **RESOLVED** — renamed Success stories |
| C4 | "200+ companies" became false once Adzuna was disabled | 🟠 | **RESOLVED** — copy changed |
| C5 | Footer's stale single-purpose copy (see P1) — restating here because it's as much a voice/consistency failure as a product one: the copy principle "keep the two positioning layers separate" (design doc §2) doesn't even get the chance to apply because the footer skips both layers and just asserts something false. | 🔴 | **NEW** (same issue as P1, cross-referenced) |
| C6 | `<title>` tag still reads "OneStop Jobs," same staleness as the footer, visible in every browser tab and every search result. | 🟠 | **NEW** |
| C7 | No meta description anywhere — search engines and link-preview cards (WhatsApp, LinkedIn, iMessage) have nothing to show except the bare title. For a platform whose growth loop depends on people forwarding links in WhatsApp, an unstyled/empty link preview is a direct conversion loss. | 🟠 | **NEW** |

---

## 5. Data pipeline lens (`jobscout-date`)

| # | Finding | Severity | Status |
|---|---|---|---|
| PL1 | Adzuna's `redirect_url` routes through an ad-serving page — contradicted the "direct from source" trust claim | 🟠 | **RESOLVED** — Adzuna disabled |
| PL2 | No analytics-specific sourcing (Adzuna has no "data" category) | 🟡 | **RESOLVED** (built, currently inert alongside Adzuna) |
| PL3 | Dropping Adzuna took active companies from 212 → 186, losing Amazon/Google/Microsoft/JPMorgan/etc. entirely (no direct-ATS path exists for them) | 🟠 | Known tradeoff, accepted |
| PL4 | 9-company analytics backlog (Tiger Analytics, Fractal, etc.) has no verified ATS slugs — correctly left as `onboarding`, not guessed | 🟡 | Known, open |
| PL5 | No `schema_version` field on the published `jobs.json` — the frontend has to guess/handle two possible shapes (bare array vs. wrapped object) | 🟡 | Known (design doc §6), not yet resolved |

---

## 6. Growth / Conversion lens

| # | Finding | Severity | Status |
|---|---|---|---|
| G1 | Hero had zero CTA, first screen had nothing to click | 🟠 | **RESOLVED** — Milestone 8 |
| G2 | **No structured data (`JobPosting` schema.org JSON-LD) on `JobDetail`.** This is the single highest-leverage SEO gap on the entire site — without it, listings are invisible to Google's job-search rich-results feature (the "Google for Jobs" panel), which is exactly how most organic job-search traffic actually gets discovered. Every competitor with any SEO investment has this. | 🔴 | **NEW** |
| G3 | **No Open Graph / Twitter Card meta tags, no social share image.** Sharing any onestopcareers.com link in WhatsApp, LinkedIn, or iMessage renders a bare link with no title, image, or description — directly undermines the CareerCircle/word-of-mouth growth model, which depends on people forwarding links. | 🟠 | **NEW** |
| G4 | No `robots.txt` or `sitemap.xml` — search engines have no explicit crawl guidance or list of indexable URLs (job detail pages in particular, which are the highest-value, most specific pages to get indexed). | 🟡 | **NEW** |
| G5 | **Zero analytics or event tracking anywhere in the codebase.** There is no way to know today whether the hero CTA converts better than the Jobs-section CTA, whether CareerCircle drives more engagement than Jobs, or where in the funnel people actually drop off. Every product decision from here forward is being made without data. | 🟠 | **NEW** |
| G5 | No "share this job" affordance (cross-ref D10) | 🟡 | **NEW** |

---

## 7. Accessibility lens

| # | Finding | Severity | Status |
|---|---|---|---|
| A1 | No `focus-visible` states | 🟠 | **RESOLVED** — Milestone 7 |
| A2 | Two WCAG AA contrast failures | 🔴 | **RESOLVED** — Milestone 8 |
| A3 | No skip-to-content link | 🟠 | **NEW** (cross-ref D8) |
| A4 | `JobCard`/list items already have `role="button"` + `tabIndex`/`onKeyDown` for keyboard activation — this was actually done correctly already, flagging as a **pass**, not a gap, since it'd be easy to assume it's missing without checking. | ✅ | Verified correct |

---

## 8. Security / Compliance lens

| # | Finding | Severity | Status |
|---|---|---|---|
| S1 | No secrets hardcoded anywhere in either repo — verified by grep, both times this was audited | ✅ | Verified correct |
| S2 | CareerCircle join flow will expose members' phone numbers to each other (inherent to WhatsApp groups) — needs explicit disclosure before join, not yet built since the join flow itself isn't live | 🟡 | Known (design doc §9), pending join-flow build |
| S3 | DPDP Act compliance review has no named owner or timeline | 🟡 | Known (design doc §10 open question), unresolved |
| S4 | Admin form (when built) needs auth, audit logging, rate-limited login — specced in design doc §7, not built yet | 🟡 | Known, planned |

---

## Consolidated exhaustive backlog — everything still open, prioritized

| ID | Item | Severity | Lens | Rough effort |
|---|---|---|---|---|
| B1 | Fix footer copy — align with actual platform scope | 🔴 | Product/Content | XS |
| B2 | Add React error boundary | 🔴 | Engineering | S |
| B3 | Add 404/catch-all route | 🔴 | Engineering | S |
| B4 | Add `JobPosting` JSON-LD structured data to `JobDetail` | 🔴 | Growth | M |
| B5 | Fix `<title>`, add meta description, Open Graph + Twitter Card tags, social share image | 🟠 | Growth/Content | M |
| B6 | Add skip-to-content link | 🟠 | Accessibility | XS |
| B7 | Add request timeout + retry + basic caching to `fetchJobs()` | 🟠 | Engineering | S |
| B8 | Add `robots.txt` + `sitemap.xml` | 🟡 | Growth | S |
| B9 | Add basic analytics/event tracking (page views + key CTA clicks, minimum) | 🟠 | Growth | M |
| B10 | Add "share this job" affordance on `JobDetail` | 🟡 | Design/Growth | S |
| B11 | Decide fate of unused `Job.tier`/`Job.dept` fields (build a feature or document as intentionally unused) | 🟡 | Product | XS (decision) + M (if built) |
| B12 | Runtime schema validation (`zod`) on fetched jobs data | 🟡 | Engineering | S |
| B13 | Add `schema_version` to crawler's `jobs.json` output | 🟡 | Data pipeline | S |
| B14 | Scroll-restoration on back-navigation from `JobDetail` | 🟡 | Design | XS |
| B15 | Re-check per-company accent colors against dark surfaces | ⚪ | Design | S |
| B16 | Add basic test coverage (start with `format.ts` unit tests + one e2e smoke path) | 🟡 | Engineering | M |
| B17 | Resolve the "3 dead CTAs live in production" problem — either build CareerCircle's join flow, or temporarily soften the CTAs so they don't read as broken | 🟠 | Product/Growth | Decision needed first |
| B18 | Crawler auto-pause (not just warn) for companies failing repeatedly | 🟡 | Data pipeline | S |

---

## Proposed milestones

**Milestone 9 — Trust & stability fixes (the things that actively embarrass or break):**
B1, B2, B3, B15

**Milestone 10 — Discoverability (the site is invisible to Google and looks broken when shared):**
B4, B5, B6, B8

**Milestone 11 — Reliability & data integrity:**
B7, B12, B13, B18

**Milestone 12 — Measurement (before more growth work, know what's working):**
B9

**Milestone 13 — Small UX gaps:**
B10, B14

**Decision-first, not yet scheduled:** B11 (tier/dept fields), B16 (test coverage investment level), B17 (CareerCircle CTA problem — needs the invite-link decision from design doc §10 before it can be scheduled).
