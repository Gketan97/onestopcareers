# OneStop Jobs — Design Doc v1

**Status:** Draft for review
**Scope:** Brand positioning & copy, Jobs listing + detail, CareerCircle, admin job submission, light-theme redesign, future-proofed architecture for success stories / resources / CareerCircle.

---

## 1. Product overview & goals

OneStop Jobs is a standalone job-discovery product for the Indian market, built on top of an existing automated crawler (separate repo: `jobscout-date`) that aggregates listings from public ATS APIs (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Eightfold, Workday) and Adzuna, classifies them by India-relevance, and publishes `jobs.json` via CDN.

This rebuild has three goals:

1. **Decouple and simplify.** Previously the Jobs experience was embedded inside a broader, unrelated career-coaching site. This rebuild extracts it into its own repo with its own identity, built and shipped one component at a time rather than as one large surface.
2. **Add two new capabilities on top of the existing data pipeline:**
   - **CareerCircle**, a WhatsApp community that delivers job updates plus peer support and referrals — see §2, §5.
   - An **admin form** for manually adding job links, replacing the ad-hoc Google Sheet as the source for non-crawled listings.
3. **Build for what's next without building it now.** Resources and success stories are explicitly out of scope for this phase, but the routing, component library, and data layer must not require rework to add them later.

**Non-goals for this phase:** dark theme, resources/success-stories UI, employer-facing tooling, payments/monetization, native mobile app.

---

## 2. Brand & messaging

Positioning and copy are treated as design material here, not filler text to swap in later — every component in §5 that renders user-facing copy should pull from this section rather than inventing its own tone.

### Platform hook line (brand-level — sitewide, holds across Jobs and future modules)

> **"Knowing what to do was never the problem. Doing it daily is."**

This is deliberately not job-search-specific. The same failure mode — knowing the right action, not doing it consistently — applies to interview prep, networking, or whatever Resources/CareerCircle become later. Placing it at the brand level (nav, footer) means it doesn't need rewriting when new modules ship. Short-form alternate for tight spaces (mobile nav, footer): *"Advice is free. Follow-through isn't."*

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
7. **Every trust/process claim must be verifiable against the actual pipeline before it ships.** A brand built on "cut the crap" cannot make claims about its own process that aren't true — that's the exact hypocrisy it's positioned against. Before writing or approving copy like "checked by hand," "expert-vetted," or any specific number, check it against what `crawler.js` (or the relevant system) actually does. See the audit below for a worked example and the corrected claims.

### Claims audit (2026-08-20)

A pass through the live hero copy against `crawler.js` found two false claims sitting directly under the "Cut the crap" motto — worth recording so this check becomes routine, not a one-time fix.

| Claim | Verdict | Reality |
|---|---|---|
| "Every listing checked by hand" | ❌ False — removed | Fully automated: `fetchGreenhouse`/`fetchLever`/`fetchAshby`/etc. hit ATS APIs directly, `classifyIndia()` and `detectFn()` are regex-based, `dedup()` is a hash-key match. No human review step exists in the pipeline. |
| "Expert-vetted first" | ❌ False — removed | Same reason — no expert reviews a listing before publish. |
| "No AI-generated links that go nowhere" | ✅ True — kept | URLs come straight from each source API's response fields (`hostedUrl`, `jobUrl`, `externalPath`) — real, not fabricated. |
| "Roles from 200+ companies" | ⚠️ **No longer true — copy changed 2026-08-20** | Was verified true at 212 (see below) when this row was first written. Adzuna was disabled the same day (ad-redirect links, see below), dropping active company count to 186 direct-ATS companies. Rather than update the number and risk the same drift happening again, the Jobs ServiceCard copy was changed to "Roles that are actually live" — true regardless of company count, and the count itself is deliberately not being restated until the roadmap (re-enabling Adzuna, or adding direct sources for MNCs) is settled. |
| "Checked daily" | ⚠️ True but reworded | The crawl cron does run daily, but the phrase read as manual review next to the (now-removed) hand-check claim. Reworded to "Refreshed daily, straight from source." |
| "5x the job updates" (CareerCircle) | ⚠️ Forward commitment, not a current fact | No group exists yet, so there's no baseline to measure against. This is the platform owner's own stated operational target (not invented in copy), kept as-is, but it's a promise to actually honor once the group launches — see §10 open questions. |
| "500 people already applied" (Jobs section) | ⚠️ Rhetorical, not a site statistic | No applicant-count data exists anywhere in the pipeline. Reads as illustrative hyperbole about the job market generally, not a claim about this site's mechanics — lower risk than the hand-check claim, left unchanged. |

**What replaced the false claims** — the pipeline's real, honest edge is engineering, not manual labor: direct-from-source URLs (not a job-board aggregator), automatic dedup (`company|title|city` hash match, keeps the freshest), and automatic 30-day expiry (`deduped.filter(j => !j.posted_at || j.posted_at >= cutoffStr)`). These are all true and still differentiate from "scraped and dumped" competitors without claiming human involvement that doesn't exist.

### Reference copy (home page — canon for implementation)

**Platform layer** (brand-level — trust claim, applies to Jobs and every future module):

| Placement | Copy |
|---|---|
| Nav wordmark | onestop**careers** (full name, accent on "careers") — no subtext caption; the nav stays a clean wordmark + links + CTA |
| Platform hero eyebrow | Cut the crap. |
| Platform hero pain-point stack | Unsure where to find the right jobs? / Unsure where to find resources that actually help? / Unsure which YouTube path to trust? / Unsure what the roadmap to your dream role even looks like? |
| Platform hero H1 (resolve line) | If that's you, OneStopCareers *is for you.* |
| Platform hero sub | Every job comes straight from the company's own career page — not another job board, not a scraped listicle, not an AI guess. Dead postings expire automatically. Duplicates get merged, not shown twice. |
| Trust bar (under platform hero) | Pulled directly from company career pages — not a job-board aggregator · No AI-generated links that go nowhere |
| Platform hero pattern | Pain-point stack (4 lines) → resolve H1 → sub → trust bar. See §2 note below on when to use this pattern vs a narrative paragraph. |
| Services strip | Jobs (live) / CareerCircle (live) / Resources (soon) / Success stories (soon) — the canonical four modules. Do not introduce a new label here without adding it to navConfig.ts and App.tsx's reserved routes too — see the naming audit note below. |

**Jobs service layer** (scoped to this one service — behavior/execution claim, not a trust claim):

| Placement | Copy |
|---|---|
| Jobs section eyebrow | Jobs — live now |
| Jobs section H2 | You know how to job search. You just don't do it *daily.* |
| Jobs section sub | "I'll apply this weekend" becomes next Wednesday, becomes next month — and 500 people already applied before you opened the tab. We don't teach you more. We make sure today happens. |
| WhatsApp CTA H3 | You didn't apply today. You won't tomorrow either. |
| WhatsApp CTA body | Not because you're lazy — "later" just always wins when nothing's forcing your hand. The moment a matching role goes live, it's in your WhatsApp. No dashboard to remember, no tab you meant to bookmark. You either act right then, or you don't — but you'll never lose to "I didn't see it." |

**CareerCircle layer** (its own service, own pain point — loneliness/uncertainty in the search, not trust or execution):

| Placement | Copy |
|---|---|
| CareerCircle pain-point stack | Ten tabs open, applying at random, hoping something sticks. / No idea if what you're doing is even right. / Nobody around who's in the same fight. / Just you, alone, refreshing an inbox that doesn't reply. |
| CareerCircle H1 (resolve line) | You don't have to do this *alone.* |
| Who can join | 2–5 years of experience, targeting analytics-focused roles |
| Group rules | Capped at 50 people, give feedback not just ask for it, talk work in your domain, no recruiters/spam/promotion |

**When to use the pain-point-stack pattern vs. a narrative paragraph:** use the stack when the audience is genuinely heterogeneous and each line needs to let a different visitor self-identify (the platform hero, CareerCircle — different people recognize themselves in different lines). Use a single narrative paragraph when the pain point is one specific, shared thing everyone in that section already has in common (e.g. the Jobs section sub — every visitor there has the exact same "I said I'd apply this weekend" problem, so a stack would be redundant, not clarifying).

Jobs page H1 intentionally stays functional/plain ("Jobs" + live count), not pain-point copy — the pain point is the *reason* someone lands there via the hero/CareerCircle, not something the listing page itself needs to re-argue.

### Naming audit note

The four modules are **Jobs, CareerCircle, Resources, Success stories** — this is canonical, cross-check `navConfig.ts`, the Home.tsx Services strip, and App.tsx's reserved routes against this list before adding or renaming anything.

Two corrections made after an initial naming pass: "Case studies" was renamed to **"Success stories"** — in a job-search context, "case study" risks being read as case-interview practice material (a specific, different thing for product/consulting applicants), while "success stories" is unambiguous and matches how LinkedIn/Duolingo/most consumer platforms label this content type. Separately, an ad hoc "Advice" module that appeared only in the Services strip (not in the nav, not in this doc's original scope) was removed — it duplicated Resources with no distinguishable purpose.

A third change: **"Referrals" was replaced by "CareerCircle,"** not just renamed. Referrals as a standalone module was thin — a static page with no actual mechanism to produce a referral. CareerCircle (a small, closed WhatsApp community, capped at 50, initially scoped to 2–5 YOE analytics roles) subsumes referrals as one thing that happens *inside* a trusted peer group, alongside the loneliness/discipline problem a static Referrals page never addressed. Shipped as live, not "coming soon," but its CTA stays visually marked "coming soon" until a real WhatsApp group invite link exists — never wire a CTA to a link that doesn't work yet.

Any future new module name should be added here first, not invented directly in a component.

### Open copy work (not yet written, needed before build)

- CareerCircle join-request flow microcopy — the phone-visible-to-group disclosure (§9) needs care.
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

/admin                    → Admin login
/admin/jobs/new           → Manual job submission form
/admin/jobs               → List/edit manually submitted jobs

/career-circle             → CareerCircle — live

── Reserved, not built now ──
/success-stories          → (future)
/success-stories/:slug    → (future)
/resources                → (future)
```

**Seams for future growth:**
- `Home` should be a thin composition of section components (`<JobsPreview>`, later `<SuccessStoriesPreview>`, etc.), not a monolith — adding a new section later means adding a component, not editing existing ones.
- Nav (`src/components/shell/Nav.tsx`) should render its link list from a config array, not hardcoded JSX, so adding `Resources`/`Success stories` later is a one-line change.
- The router file (`src/app/routes.tsx`) should be the *only* place routes are declared — no route logic scattered in components — so reserved routes above can be uncommented/added without hunting through the codebase.
- Data layer (`src/lib/`) should be organized **by domain** (`lib/jobs/`, `lib/admin/`) from day one — this means `lib/success-stories/` later is an addition, not a restructuring.

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
| `jobs/JobCard.tsx` | Single listing — title, company, meta, recency dot. Supports a `compact` prop for the grid view (see Jobs page below) — same component, not a duplicate. |
| `jobs/JobSearch.tsx` | Search input, debounced, syncs to URL `?q=` |
| `jobs/JobFilters.tsx` | Function/city/mode/seniority filter chips |
| `jobs/JobList.tsx` | Composes search+filters, view toggle (grid/list — grid is default per user decision), renders `JobCard[]`, pagination |
| `jobs/EmptyState.tsx` | No-results state |
| `pages/Jobs.tsx` | Thin page: `<JobList />` + page chrome |
| `pages/JobDetail.tsx` | Single job full view + apply CTA |

### Phase 2b — CareerCircle (live)
| Component | Purpose |
|---|---|
| `pages/CareerCircle.tsx` | Pain-point-led page for the WhatsApp community. CTA is visually complete but marked "coming soon" until a real group invite link exists — do not wire a fake/dead link. |

### Phase 3 — Admin
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
     | 'eightfold' | 'workday' | 'adzuna' | 'jsearch' | 'manual'
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

### Pipeline architecture reference (jobscout-date repo)

This frontend repo (`onestop-jobs`) and the crawler (`jobscout-date`, github.com/Gketan97/jobscout-date) are separate repos, cloned to separate local folders — the crawler is **not** connected to the same VS Code window as this project unless you open it as a second folder. Documenting its architecture here anyway, since this design doc is the place both repos' contributors would look to understand the whole system, not just the half that happens to live in this repo.

**Sources, as of the v8 audit (2026-08-20):**

| Source | Type | Companies/queries | Notes |
|---|---|---|---|
| Greenhouse | Direct ATS API | 115 | `boards-api.greenhouse.io` |
| Lever | Direct ATS API | 26 | `api.lever.co` |
| Ashby | Direct ATS API | 22 | `api.ashbyhq.com` |
| Workable | Direct ATS API | 5 | `apply.workable.com` |
| SmartRecruiters | Direct ATS API | 4 | India-filtered via `country=IN` param |
| Eightfold | Direct ATS API | 3 | Cursor-paginated, 200-page cap |
| Workday | Direct ATS API (POST) | 11 | Facet-key guessing across tenants — see code comment in `fetchWorkday` |
| Adzuna (by company) | Aggregator API | 26 | **Disabled 2026-08-20** — see below |
| Adzuna (by city/category) | Aggregator API | 20 | **Disabled 2026-08-20** — see below |
| Adzuna (by keyword) — added in v8 | Aggregator API | 15 | **Disabled 2026-08-20** — see below |
| JSearch — added in v8, optional | Google for Jobs wrapper | 3 | **Disabled 2026-08-20** — see below |
| Google Sheet (manual) | CSV read | — | Being replaced by the admin form, §7 |

**Active company count, updated 2026-08-20:** 186 direct-ATS companies (`greenhouse` 115 + `lever` 26 + `ashby` 22 + `workable` 5 + `smartrecruiters` 4 + `eightfold` 3 + `workday` 11). Was 212 before Adzuna was disabled the same day — the 26 companies in `adzuna_mnc` (Amazon, Google, Microsoft, JPMorgan, Goldman Sachs, Morgan Stanley, Deutsche Bank, Barclays, HSBC, Citi, McKinsey, BCG, Flipkart, Ola, MakeMyTrip, Byju's, and others) have **no direct-ATS path** — none run a public Greenhouse/Lever/Ashby/Workable/SmartRecruiters/Eightfold/Workday board, and Amazon specifically was confirmed to have no public developer API at all (verified — the only paths in are undocumented scrapers of amazon.jobs's private endpoints, which isn't something this pipeline does). They're not in the pipeline right now, by decision, not oversight.

**Why Adzuna and JSearch are commented out (2026-08-20 decision):** Adzuna's `redirect_url` routes through Adzuna's own ad-serving redirect page before reaching the actual listing — this conflicts directly with the "pulled directly from company career pages, not a job-board aggregator" trust claim in the platform hero (§2 claims audit). JSearch isn't free at meaningful query volume. Both are fully implemented and commented out in `crawler.js`, not deleted — see the block comment at the top of the Adzuna/JSearch section in `main()` for exactly what's disabled and why. `companies.json` still carries the `adzuna_keyword` and `jsearch_analytics` query configs and the analytics-company backlog note — inert data, ready to reactivate if the tradeoff changes later.

**v8 audit findings and fixes:**
- **Version drift** — the file header and most `User-Agent` strings said `JobScout/7.0`, but `fetchGoogleSheet`'s said `8.0`, and `jobs.json`/`meta.json` were written with `v: 7`. Cosmetic, but confusing if anyone ever needs to reason about which crawler version produced a given dataset. Standardized to v8 everywhere as part of this pass, since real capability was added anyway.
- **Dead code** — `byMethod` in the stats block was computed identically to `sources` and never read or written anywhere. Removed.
- **Silent permanent failures** — `recordState()` tracked `consecutive_errors` per company but nothing ever read the counter. A company with a dead slug or a moved ATS board would fail forever without surfacing anywhere. Added a log warning at 5 consecutive failures (`CONSECUTIVE_ERROR_WARN_THRESHOLD`) — still no auto-pause (that's a bigger design decision, see open questions), but at least it's visible in run logs now.
- **No analytics-specific sourcing** — Adzuna has no "data" or "analytics" category tag, only broad buckets (`it-jobs`, `engineering-jobs`, etc.), so analytics roles were only reachable incidentally through whatever companies happened to be hiring for. `adzuna_keyword` was built to fix this but is currently inert along with the rest of Adzuna — see above.

**Getting more analytics-focused roles — what was actually checked, not assumed:**

1. **Adzuna keyword search (`adzuna_keyword`, shipped in v8).** Adzuna's `what=` parameter supports free-text keyword search alongside the `where=` city parameter — confirmed against Adzuna's own API docs. Added 15 queries: `{data analyst, business analyst, data scientist} × {Bengaluru, Mumbai, Delhi, Hyderabad, Pune}`. Zero new signup — reuses the `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` already configured. This is the immediately-live fix.

2. **"Can we hit Google Jobs API" — checked, the honest answer:** there is **no official public API to query Google for Jobs search results.** Google Cloud Talent Solution is a different, unrelated product — it's for publishing *your own* job postings into a Google-powered search experience on your own site, not for querying Google's aggregated listings from other sources. Confirmed against Google Cloud's own documentation.
   The verified path to Google for Jobs data is **JSearch** (OpenWeb Ninja / also listed on RapidAPI) — a third-party service that reads Google for Jobs results (which itself aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter, and others) and returns structured JSON. `crawler.js` already had an unused `JSEARCH_KEY` env var stubbed in before this audit — this was clearly the original plan, just never finished. **Implemented in v8** as `fetchJSearch()`, gated entirely behind `JSEARCH_KEY` being set (skips cleanly otherwise, same pattern as Adzuna).
   **Cost reality, confirmed against the vendor's current pricing:** free tier is 200 requests/month, 1000/hour. At 3 queries/run, running daily would hit ~90/month — fine. But queries scale fast if you add more cities/titles, and there's no slack for retries. This is why `fetchJSearch` runs on a **weekly**, not daily, cadence (`JSEARCH_TTL_MS`) — comfortably inside the free tier at the current 3-query config. Scaling to daily or more queries needs the $25/mo Pro tier (10k requests/month) — verify current pricing before assuming that number still holds, vendor pricing pages change.
   **What JSearch does NOT give you:** direct ATS coverage (Workday, Greenhouse, Lever, Ashby aren't in it) — it's a genuine complement to the existing pipeline, not a replacement or a source of duplicate listings.

3. **Dedicated analytics companies — not yet added, deliberately.** A backlog of candidates (Tiger Analytics, Fractal Analytics, LatentView Analytics, Mu Sigma, SG Analytics, EXL Analytics, Genpact's analytics practice, WNS Analytics, Straive) is recorded in `companies.json`'s `_analytics_backlog_notes` field. None have a verified ATS slug — searching turned up only third-party aggregator listings (Indeed, Wellfound, Built In), not confirmation of which ATS each company's actual careers page uses. Adding a guessed slug would just produce silent 404s and wasted API calls (per the audit finding above, this would now at least surface as a warning after 5 failed runs — but it's still better not to guess). Whoever picks this up next needs to visit each company's real careers page and identify the ATS + board slug before flipping any of these from `onboarding` to `active`.

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

## 8. WhatsApp job updates — cut, superseded by CareerCircle

**Status: removed.** This section originally specced a standalone, automated WhatsApp alert subscription — phone number entry, OTP verification, a scheduled worker matching new listings against per-subscriber preferences, Twilio-sent daily digests, token-based unsubscribe. None of it was built past UI placeholders (`Get alerts on WhatsApp`, `Set up alerts →` — see Home.tsx's git history for the removed CTA block).

**Why it was cut:** CareerCircle (§2, §5 Phase 2b) already delivers the same core promise — job updates via WhatsApp — as one part of a broader, higher-value thing: a small peer community that also solves loneliness and referrals, problems a pure alert-subscription service never addressed. Building two separate WhatsApp-based mechanisms (an automated opt-in list *and* a community group) would have meant maintaining duplicate infrastructure for overlapping value. One was cut in favor of the other.

**What actually changed in code:** the `Get alerts on WhatsApp` button on the Jobs section and the entire bottom "WhatsApp alerts" CTA block were removed from Home.tsx. The nav CTA (`shell/Nav.tsx`) now points to `/career-circle` instead of a dead placeholder. `Phase 3 — Alerts` in the component inventory (§5) and the `/alerts`, `/alerts/verify`, `/alerts/unsubscribe` reserved routes (§4, App.tsx) are removed — they don't need to exist even as reserved/future, since the intent is now served by CareerCircle rather than deferred.

**If a fully-automated, opt-in-list-style alert product is ever wanted again later** (distinct from CareerCircle's human-run group — e.g. if CareerCircle's 50-person cap becomes a bottleneck and a broader, unlimited-scale automated channel is needed), the original spec (OTP flow, Twilio vs. Meta direct comparison, digest cadence, subscriber storage schema) is preserved in this doc's git history and can be resurrected rather than redesigned from scratch.

---

## 9. Security & compliance

**Admin form:**
- Authentication required — recommend a simple email/password or magic-link auth for a single/small admin group to start (not open signup). Session-based, short expiry.
- Every submission/edit logged with `submitted_by` + timestamp (audit trail — see §7).
- Rate-limit login attempts (e.g. 5/15min per IP) to prevent brute force.

**CareerCircle & phone numbers:**
Unlike the cut automated alerts service, CareerCircle is a human-run WhatsApp group joined via invite link — there's no OTP flow, no subscriber database, no automated sender to secure. The privacy consideration is different in kind, not degree: joining a WhatsApp group makes a member's phone number visible to other members (this is inherent to how WhatsApp groups work, not a bug to fix). Make this visible-to-group-members fact explicit on the CareerCircle page before someone requests to join, so it's informed consent rather than a surprise. The 50-person cap (§2) is also a light privacy control — a smaller group means a smaller blast radius if the invite link leaks.
- **Flagging, not resolving:** India's DPDP Act (consent, data minimization) still applies to how join requests are collected and processed, even without OTP/automated infra — recommend a compliance check before the join flow goes live with a real invite link, not just engineering sign-off.

**Rate limiting / abuse prevention:**
- Admin login: rate-limited (e.g. 5/15min per IP).
- No public endpoint should allow enumerating admin-submitted job internal notes.

**Secrets management:**
- Adzuna keys, admin auth secrets, database credentials — all via environment variables / a secret store (e.g. Netlify/Vercel env vars, or a proper secrets manager if infra grows). Never hardcoded, never committed — confirm `.gitignore` covers any local `.env` files (the previous repo's `.gitignore` should be audited for this too).

**CORS / API surface:**
- Public, read-only, no auth: `jobs.json` via CDN (unchanged).
- Auth-required: all `/admin/*` endpoints.

**Threat model (abbreviated):**

| Actor | Risk | Mitigation |
|---|---|---|
| Scraper of your own `/jobs` pages | Re-scraping your aggregated data at scale | Low priority (data is already public via source ATSs) — but rate-limit if it becomes a cost/load issue |
| Compromised admin credentials | Fake/malicious job listings published | Audit log, short session expiry, consider 2FA if the admin group grows |
| Leaked CareerCircle invite link | Group fills with people outside the intended 2–5 YOE analytics scope, or a member's number gets scraped by a non-member who joined via a leaked link | Don't publish the invite link publicly — require a request-to-join step (even an informal one) so a human vets entry, rather than an open link anyone can forward |

---

## 10. Open questions / decisions needing input

1. **Company logos** — do we want them on `JobCard`? Direction C leans on this; Direction A (recommended) doesn't need them but could still benefit. If yes, need a source (Clearbit Logo API, manual upload via admin form, or skip).
2. **Admin form hosting/storage** — same repo as the frontend (serverless functions + a managed DB like Supabase/Postgres), or a small separate service? Affects §7 architecture.
3. **CareerCircle invite link** — needs a real WhatsApp group created and an invite link before the "Request to join" CTAs can go live (currently marked "coming soon" on both the nav and the CareerCircle page). Who owns creating/moderating the group? Relatedly: the site claims "5x the job updates" vs. the free channel — this is a real operational commitment once the group launches, not just copy, so whoever moderates needs to actually track and hit that ratio, or the claim becomes exactly the kind of unverifiable promise this brand is positioned against (see §2 claims audit).
4. **DPDP Act compliance review** — who owns this / when does it happen relative to launch? Flagged in §9 but needs an owner and timeline, not just an engineering task.
5. **Home page scope** — is `/` purely a `/jobs` redirect for now, or a minimal landing page with its own copy/hero? Affects Phase 1 build order.
6. **Manual job submission volume** — expected frequency (a few a week vs. dozens a day) affects whether the admin form needs bulk-import (CSV upload) in addition to single-entry, or if single-entry is sufficient for now.
7. **~~JSearch signup~~ — resolved 2026-08-20:** decided not free enough to pursue now. `fetchJSearch()` stays commented out in `crawler.js`. Revisit if the economics change.
8. **Analytics company backlog** — 9 candidate companies (Tiger Analytics, Fractal Analytics, etc., full list in `companies.json`'s `_analytics_backlog_notes`) need someone to visit their actual careers pages and confirm ATS + slug before they can be activated. Who picks this up, and is it worth prioritizing given CareerCircle's analytics-role focus? Unaffected by the Adzuna decision below — these would be direct-ATS additions, not Adzuna-dependent.
9. **MNC sourcing (Amazon/Google/Microsoft/JPMorgan/etc.)** — deliberately left out as of 2026-08-20 (see §6 pipeline architecture). Only path back in is re-enabling some or all of Adzuna, or finding a direct source per company (unlikely — most of these run proprietary ATSs with no public API, confirmed for Amazon specifically). Revisit if these companies become a priority.
10. **"Roles that are actually live" copy** — deliberately vague on company count as of 2026-08-20 rather than restate a number that might drift again. Once the MNC-sourcing question above is settled, decide whether to restate a real count or keep it count-free permanently.
