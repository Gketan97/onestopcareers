# OneStopCareers — Engineering Audit & Production Readiness Review

**Date:** August 26, 2026
**Method:** Real investigation against the current repository — `tsc -b`, `vite build`, a full secrets scan, direct inspection of `supabase/schema.sql`'s RLS policies, and line-by-line reading of the highest-risk files (auth context, the Netlify function, `fetchJobs.ts`, the crawler workflow). Not a static read-through of a spec — every finding below was either confirmed against a real file/command output, or explicitly marked "needs verification" where it couldn't be.
**A hard limitation, stated plainly per the brief's own rule:** this sandbox has no browser automation and no live connection to the real Supabase/PostHog/Netlify projects. Anything requiring an actual running instance (RLS behavior under a real session, Netlify Functions routing interaction with the new SPA redirect, live query performance) is flagged as "needs verification," not asserted as confirmed.

---

## Executive Summary

| Dimension | Score | Note |
|---|---|---|
| Overall engineering health | 6/10 | Real, working product; several genuine gaps below its own stated bar |
| Security | 4/10 | One confirmed P0 (now fixed in source, **not yet applied to the live DB**) |
| Reliability | 5/10 | No error boundary, no 404 route, no timeout on the single most-depended-on fetch |
| Performance | 7/10 | Fine at current scale (~1,600–2,000 jobs); has a real, known ceiling |
| Code quality | 7/10 | Consistent patterns, real token discipline, unusually thorough dated commentary explaining *why* |
| Testing | 1/10 | Zero automated tests anywhere, confirmed by `find` |
| SEO | 5/10 | Real `JobPosting` schema exists, but likely never worked until yesterday (see OSC-006) |
| Accessibility | 6/10 | Contrast issues found and fixed across several audits; skip-link still missing |
| Scalability | 6/10 | Client-side-only job filtering has a real, identifiable ceiling, not urgent yet |

**Overall verdict: ⚠️ Production usable but requires important fixes.**

- The product genuinely works — real users, real auth, real job data, real community form.
- One confirmed, actively exploitable P0 (privilege escalation) existed until this audit; fixed in source, **needs manual re-application to the live database today**.
- The frontend is currently reading job data from a different repo than the one actively being maintained — a real architectural loose end, not cosmetic.
- Reliability basics (error boundary, 404 handling, fetch timeout) that most teams treat as day-one items were never built.
- Zero test coverage is a real, acknowledged gap — reasonable for a one-person early-stage project, but worth naming honestly rather than hiding behind "not needed yet."
- Nothing here requires enterprise complexity — every fix below is scoped to what an early-stage product actually needs.

---

## Issue Summary

| Severity | Count | Release Blocking? |
|---|---:|---|
| P0 | 1 | Yes — must be applied to the live DB today |
| P1 | 7 | Should fix before meaningfully more traffic |
| P2 | 6 | Real, should schedule |
| P3 | 4 | Worth doing, not urgent |
| P4 | 3 | Explicitly not now |

---

## Critical & High-Priority Findings

### OSC-001
**Severity:** P0 — CRITICAL
**Category:** Security
**Location:** `supabase/schema.sql`, the `profiles` UPDATE policy

**Problem:** The RLS policy `using (auth.uid() = id)` on `profiles` UPDATE restricts *which row* a user can modify, but Postgres RLS's `USING` clause was never designed to restrict *which columns* — it doesn't. Any authenticated user could update their own `is_admin` column to `true`.

**Why it matters:** `career_circle_interests`' admin-only SELECT/UPDATE policies check `profiles.is_admin = true`. A self-granted admin flag gives full read access to every Career Circle applicant's name, email, WhatsApp number, current role, and personal notes — real PII, not test data.

**Reproduction:** Signed in as any regular user, in the browser console:
```js
await supabase.from('profiles').update({ is_admin: true }).eq('id', (await supabase.auth.getUser()).data.user.id)
```
No error, no special access needed — the anon key is public by design, and this policy never checked the changed column.

**Evidence:** Confirmed by reading the policy directly — `using (auth.uid() = id)` with no accompanying `WITH CHECK` or trigger guarding the `is_admin` column.

**Recommended fix:** Fixed in this pass — a `BEFORE UPDATE` trigger (`prevent_self_admin_grant`) now silently reverts any change to `is_admin` unless the actor is already an admin. **This is in `supabase/schema.sql` now, but has not been applied to the live database** — it must be run in the Supabase SQL editor today, not left for the next scheduled deploy.

**Effort:** S (already written, needs to be run)
**Priority rationale:** Confirmed, trivially exploitable, real PII exposure. Nothing else in this report comes close to this severity.

---

### OSC-002
**Severity:** P1 — HIGH
**Category:** Architecture / Product correctness
**Location:** `src/lib/jobs/fetchJobs.ts`

**Problem:** `CDN = 'https://cdn.jsdelivr.net/gh/Gketan97/jobscout-date@main/data/jobs.json'` — the frontend still reads from the **old, pre-merge** `jobscout-date` repo, not `crawler/data/jobs.json` in this (merged) repo. The repo-merge milestone's own documented cutover checklist was never completed.

**Why it matters:** The new crawler (in `crawler/`) has been confirmed running successfully via its own GitHub Action (real commits like `chore: crawl incremental — 496 jobs` were observed in this project's git history). If the old `jobscout-date` repo's workflow is still enabled, two independent crawlers are now running in parallel, with the frontend using the one that *isn't* the one actively being maintained in this repo. If that old workflow was ever disabled, the site is serving frozen data from whenever that happened. Either way, the "refreshed daily" claim on the homepage may not currently be true.

**Reproduction:** `grep CDN src/lib/jobs/fetchJobs.ts` — points at `jobscout-date`, not `onestopcareers`.

**Evidence:** File content, quoted above, verified directly.

**Recommended fix:** Confirm whether `jobscout-date`'s Action is still running (needs verification — not visible from this sandbox). Then follow the cutover checklist already written in `docs/DESIGN_DOC.md`: point `CDN` at `https://cdn.jsdelivr.net/gh/Gketan97/onestopcareers@main/crawler/data/jobs.json`, verify the live site still shows real jobs, then disable the old repo's workflow.

**Effort:** S
**Priority rationale:** Directly affects whether the core product claim ("refreshed daily") is true right now.

---

### OSC-003
**Severity:** P1 — HIGH
**Category:** Reliability
**Location:** Entire `src/` tree — no `ErrorBoundary` component exists anywhere

**Problem:** Confirmed via `grep -rn "ErrorBoundary" src/` — zero matches. Any uncaught render error (a malformed job object, a bad date string, a null reference in a component) takes the entire app to a white screen, not just the broken component.

**Why it matters:** This was flagged in the very first platform audit, months ago, and has never been fixed despite dozens of subsequent milestones touching the codebase.

**Reproduction:** Any unhandled exception during render, anywhere in the tree, with no fallback UI.

**Recommended fix:** A single `ErrorBoundary` class component wrapping `<App />` (or at minimum wrapping the router's route outlet), showing a "something went wrong, reload" state instead of a blank screen.

**Effort:** S
**Priority rationale:** Cheap to fix, protects the entire app from one bad render anywhere.

---

### OSC-004
**Severity:** P1 — HIGH
**Category:** Reliability / UX
**Location:** `src/app/App.tsx` — no catch-all route

**Problem:** Confirmed — no `<Route path="*">` exists. Any URL that doesn't match a defined route renders nothing.

**Why it matters:** Also flagged in the first platform audit, never fixed. A typo'd URL, an old bookmark, or a since-removed link renders a blank page with no navigation and no explanation.

**Recommended fix:** A simple `NotFound` page + catch-all route, reusing the existing empty-state visual pattern already established elsewhere on the site (`EmptyState.tsx`).

**Effort:** S
**Priority rationale:** Same as OSC-003 — cheap, high-visibility, long overdue.

---

### OSC-005
**Severity:** P1 — HIGH
**Category:** Reliability
**Location:** `src/lib/jobs/fetchJobs.ts`

**Problem:** No `AbortSignal.timeout()`, no retry, no caching — a single bare `fetch()`. Every page on the site depends on this one function.

**Why it matters:** If the CDN is slow or briefly unavailable, every page just spins on "Loading…" indefinitely, with no fallback or retry affordance. This was flagged as E5/B7 in the original platform audit and never fixed — notably, the *sibling* function (`fetchJobDescription.ts`) *does* have a 10-second timeout, so the pattern exists in the codebase, it just was never applied to the function everything else depends on.

**Recommended fix:** Add `signal: AbortSignal.timeout(10000)`, matching the existing pattern in `fetchJobDescription.ts`, plus a clear "couldn't load jobs, retry" state (several pages already have ad hoc error handling for this fetch — worth consolidating).

**Effort:** S
**Priority rationale:** The single most-depended-on network call in the app, with zero resilience.

---

### OSC-006
**Severity:** P1 — HIGH
**Category:** SEO
**Location:** `netlify.toml` (fixed 2026-08-24) + `src/components/jobs/JobPostingSchema.tsx`

**Problem:** Until two days ago, no SPA fallback redirect existed in `netlify.toml` — confirmed by this project's own history. That means every route except the bare homepage 404'd on direct URL access, including every job detail page.

**Why it matters:** Google's crawler fetches URLs directly, not by clicking through a site. The `JobPostingSchema` structured-data work (a real, earlier engineering investment specifically for job-page SEO) has very likely never functioned as intended, since the page it's injected into was unreachable by direct URL for its entire existence until the fix two days ago.

**Recommended fix:** Already fixed going forward. **Needs verification, not yet done:** resubmit key job URLs in Google Search Console's URL Inspection tool to request re-crawling — Google may have cached 404 results for these paths and won't necessarily re-check them on its own schedule.

**Effort:** S (the resubmission step)
**Priority rationale:** A real investment (structured data, meta tags) that's had zero chance to work until very recently — worth actively confirming it starts working now, not assuming.

---

### OSC-007
**Severity:** P1 — HIGH
**Category:** Security / Abuse
**Location:** `netlify/functions/job-description.js`

**Problem:** This function takes `src`, `url`, and `id` as fully client-controlled query parameters, with no rate limiting, no auth, and no validation that the requested job actually exists in our own data. It uses `url` to construct real outbound requests to Greenhouse/Lever/Ashby's APIs.

**Why it matters:** Anyone can call this function directly (not through the site) with any Greenhouse/Lever/Ashby company URL matching the regex patterns, using our function as a free, unauthenticated proxy to those APIs — for a company we've never heard of, not just ones in our own `companies.json`. Not a data-breach risk (everything it touches is already-public job-posting data), but a real, unbounded compute/bandwidth abuse vector with our name on it.

**Recommended fix:** Validate that `id`/`url` correspond to a job actually present in the current `jobs.json` feed before proceeding (a cheap, real check against known-good data), and add basic rate limiting (Netlify's own rate-limiting config, or a simple in-memory/edge check).

**Effort:** M
**Priority rationale:** Real, currently-live abuse surface with no cost to whoever exploits it and a real (if modest) cost to us.

---

## Medium & Low Findings

**Security / Abuse**
- **OSC-008 (P2):** The Career Circle interest form (`CareerCircleJoin.tsx`) allows anonymous public inserts with no rate limiting, CAPTCHA, or honeypot field. A script could spam-submit thousands of fake entries. Recommended fix: a honeypot field (cheapest, no dependency) as a first pass; a real CAPTCHA only if spam is actually observed.

**Scalability**
- **OSC-009 (P2):** `JobList.tsx` fetches the *entire* `jobs.json` feed client-side and does all filtering/sorting/pagination in JS. Fine today (~1,600–2,000 jobs); will become a real problem well before 100k. **Do when traffic/data grows, not now** — the fix (server-side filtering, likely via the Supabase mirror this project deliberately chose not to build yet) is a genuine architecture change, not a quick patch.
- **OSC-010 (P2):** No runtime schema validation (e.g. `zod`) on the fetched jobs feed. If the crawler's output shape ever changes unexpectedly, the frontend fails silently or crashes rather than failing loudly with a clear message. Flagged as a recommendation multiple times in this project's own history, never implemented.

**Accessibility**
- **OSC-011 (P2):** No skip-to-content link anywhere — a WCAG 2.4.1 bypass-blocks failure, flagged in the very first platform audit, still open.

**Testing**
- **OSC-012 (P2):** Zero automated tests, confirmed via `find`. See Testing Assessment below for the minimum viable suite.

**Code quality / Maintainability**
- **OSC-013 (P3):** Several now-orphaned components exist in the repo (`PainPointRotator.tsx`, `ServicesConstellation.tsx`, `PainPointSpotlight.tsx`, `CareerJourney.tsx`, `PainPointCards.tsx`, `FragmentedJourney.tsx`) — all deliberately kept rather than deleted per this project's own stated practice, all clearly marked `STATUS: unused` in their own file headers. Not a real problem, but worth a single cleanup pass eventually so new contributors aren't confused by dead code that *looks* live.
- **OSC-014 (P3):** `job.tier` and `job.dept` fields flow through the entire pipeline and are never used anywhere in the frontend — flagged as dead/unused data in the first platform audit, never resolved either way (build a feature, or formally drop them).

**SEO**
- **OSC-015 (P3):** No `sitemap.xml` exists. Worth adding now that direct URLs actually work (see OSC-006) — a sitemap listing job detail URLs would meaningfully help discovery.

**Performance**
- **OSC-016 (P4, explicitly not now):** No CDN-level caching layer beyond jsDelivr's own defaults, no service worker, no image optimization pipeline. None of this is worth building at current traffic/scale — noted only so it's not silently forgotten if traffic grows meaningfully.

---

## Architecture Assessment

**What's good:** The separation between the crawler (data), the frontend (presentation), and the one serverless function (on-demand enrichment) is genuinely clean — each has a single, clear job. The explicit decision *not* to mirror job data into Supabase (documented directly in this project's own design doc) was the right call for this stage — it avoided real, unnecessary sync-pipeline complexity. Token-based design system, consistent component patterns, and unusually thorough dated commentary explaining *why* decisions were made (not just what) are a real maintainability asset — rare to see in a project this size.

**What's weak:** The frontend/crawler cutover gap (OSC-002) is a real, live architectural loose end — not a design flaw, just an unfinished migration. The complete absence of tests means every change currently relies entirely on manual verification, which doesn't scale as a practice even if it's been sufficient so far.

**What will scale:** The static-site-plus-CDN-feed model handles read traffic well — Netlify's CDN and jsDelivr both scale horizontally without any work from this team.

**What will not scale:** Client-side filtering of the entire job feed (OSC-009) has a real, identifiable ceiling — not urgent at current data volume, genuinely limiting past roughly 10,000+ jobs.

**What should remain simple:** The no-jobs-mirror decision should hold as long as possible — it's the single biggest complexity-avoidance win in this architecture.

**What should eventually be redesigned:** If job volume grows significantly, server-side filtering (likely via the already-provisioned Supabase project, which currently only handles auth/saved-jobs/Career-Circle) becomes the natural next step — not urgent today.

---

## Security Assessment

**Overall verdict:** Real, but with one now-fixed critical gap. The privilege-escalation bug (OSC-001) is genuinely serious and should be treated as the single most urgent item from this entire report — everything else is real but not urgent in comparison. Outside of that, the security posture is reasonable for this stage: no secrets in source (confirmed via full-repo scan), RLS enabled on every table, PII kept deliberately out of analytics by construction (not just convention) in `analytics.ts`, and a sensible public-insert-admin-read-only pattern on the Career Circle form. The Netlify function abuse vector (OSC-007) is real but low-severity — no data at risk, just unbounded third-party API proxying.

---

## Performance Assessment

**Current bottlenecks:** None severe at current traffic/data volume. Bundle size was already identified and fixed in an earlier pass (manual chunk-splitting after Supabase/PostHog roughly doubled it).

**Projected bottlenecks:** Client-side job filtering (OSC-009) is the clear, identifiable one — not urgent, well-understood, with a known fix path when it matters.

**Do now:** Nothing performance-specific — the real "do now" items in this report are reliability and security, not speed.
**Do when traffic grows:** Server-side filtering, a sitemap, more aggressive caching.
**Probably unnecessary (for now):** A service worker, image optimization pipeline, CDN beyond what Netlify/jsDelivr already provide.

---

## Testing Assessment

**Current maturity:** None — zero test files, no test runner configured, confirmed directly.

**Recommended minimum high-value suite (not 100% coverage — the ~15–20 tests that actually protect business-critical behavior):**

1. `functionLabels.ts` / `format.ts` — pure functions, cheapest possible tests, protect user-facing label correctness (`fnLabel('data')` → `'Analytics'`, `postedLabel()` date math).
2. `slug.ts` — `jobSlug()`/`idFromSlug()` round-trip correctness (this was manually verified once during development; a real test would catch a future regression automatically).
3. `deriveCompanies()` in `companies.ts` — the aggregation logic behind both the Companies page and the Jobs-page discovery module; a bug here silently shows wrong role counts.
4. One integration-style test on `JobList`'s filter/search/sort logic (the actual filtering predicates, not the UI) — this is the most complex pure logic in the frontend.
5. RLS policy tests, run against a real (test) Supabase instance — specifically a regression test for OSC-001, so this exact class of bug can never silently return.
6. One end-to-end smoke test (even just Playwright hitting the deployed preview): load `/jobs`, confirm real job cards render, click into a job detail page, confirm it loads without erroring.

This is a one-to-two-day investment, not a testing-infrastructure project — worth doing before the next major feature push, not before this report is closed out.

---

## Top 10 Fixes

| # | Issue | Severity | Effort | Why now |
|---|---|---|---|---|
| 1 | OSC-001: RLS privilege escalation | P0 | S | Actively exploitable, real PII at risk |
| 2 | OSC-002: Frontend reading from stale/wrong crawler source | P1 | S | Core product claim ("refreshed daily") may currently be false |
| 3 | OSC-003: Error boundary | P1 | S | One bad render = whole app white-screens |
| 4 | OSC-004: 404 route | P1 | S | Long overdue, cheap |
| 5 | OSC-005: `fetchJobs.ts` timeout | P1 | S | Single point of failure for the entire site |
| 6 | OSC-006: Resubmit job URLs to Search Console | P1 | S | SEO investment may have never actually worked |
| 7 | OSC-007: Rate-limit the on-demand description function | P1 | M | Live, unbounded abuse surface |
| 8 | OSC-012: Minimum viable test suite | P2 | M | Currently zero safety net for regressions |
| 9 | OSC-011: Skip-to-content link | P2 | S | Cheap, real accessibility fix, long overdue |
| 10 | OSC-010: Runtime schema validation on the job feed | P2 | S | Prevents silent breakage if crawler output shape changes |

---

## Phased Roadmap

**Phase 0 — Fix Immediately** *(this week)*
Items 1–7 above. Total effort: roughly 2–3 focused days, mostly S-effort items. No dependencies between them — can be done in any order, though #1 should genuinely be first.

**Phase 1 — Harden the Foundation** *(next 2–3 weeks)*
Minimum test suite (#8), skip-to-content (#9), schema validation (#10), honeypot on the Career Circle form (OSC-008), sitemap.xml (OSC-015).

**Phase 2 — Prepare for Growth** *(when job volume or traffic actually increases, not on a calendar)*
Server-side job filtering, dead-field cleanup (`job.tier`/`job.dept`), more aggressive caching.

**Phase 3 — Mature Engineering** *(explicitly not now)*
CDN-layer caching, image pipeline, service worker. Revisit only if real usage data justifies it.

---

## "If I Were the CTO"

**1. What I would fix this week (max 5):**
1. Apply the RLS fix to the live database (OSC-001) — today, not this week.
2. Point `fetchJobs.ts` at the correct, currently-maintained crawler source (OSC-002).
3. Error boundary + 404 route (OSC-003/004) — an afternoon, protects the whole app.
4. Timeout on `fetchJobs.ts` (OSC-005).
5. Resubmit job URLs in Search Console (OSC-006) — five minutes, real potential upside.

**2. What I would NOT touch yet (max 5):**
1. Server-side job filtering — real fix, wrong time, current scale doesn't need it.
2. A full CAPTCHA on the Career Circle form — a honeypot is enough until spam is actually observed.
3. Any caching layer beyond what Netlify/jsDelivr already provide.
4. Deleting the orphaned components — harmless, marked clearly, not worth the churn right now.
5. 100% test coverage — the ~6-test minimum suite above is the right scope, not exhaustive coverage.

**3. Biggest hidden risk:** OSC-002. It's not flashy, but if the site has genuinely been serving stale or duplicated data for any meaningful stretch, that's a slow, quiet erosion of the platform's core trust claim ("checked, refreshed daily") — the exact thing this whole project has been most careful about protecting everywhere else.

**4. Biggest scalability risk:** Client-side filtering of the entire job feed (OSC-009). Not urgent, but the one thing in this architecture with a real, identifiable ceiling.

**5. Biggest security risk:** OSC-001, unambiguously — the only confirmed, actively exploitable issue in this whole report.

**6. Biggest product-quality risk:** The complete absence of error handling for the one thing every single page depends on (`fetchJobs.ts`) — a slow CDN response currently means every visitor sees an infinite spinner, sitewide, with zero recovery path.

**7. Architecture decision:** **Keep as-is, refactored incrementally.** The core architecture (static frontend + CDN feed + one lean serverless function + Supabase for the genuinely stateful pieces) is sound and appropriately scoped for this stage. Nothing here justifies a redesign — the real work is finishing what's already been started (the crawler cutover) and adding the reliability basics that were skipped along the way, not rearchitecting anything.

**8. Recommended next milestone:** "Close Phase 0 and Phase 1 completely, then do a second real audit." Not a feature milestone — a discipline one. This project has consistently shipped fast and caught real bugs along the way (the escape-sequence pattern, several Tailwind opacity bugs, the missing SPA redirect); the next real step is making sure the reliability and security basics catch up to that same standard, and then re-checking with fresh eyes rather than assuming this report is the last word.
