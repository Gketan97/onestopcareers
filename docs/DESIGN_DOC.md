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

**Non-goals for this phase:** resources/success-stories UI, employer-facing tooling, payments/monetization, native mobile app. (Dark theme was a non-goal through 2026-08-20 — see §3 for the reversal.)

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

### Theme reversal: light → dark (2026-08-20)

The original version of this doc stated "light theme only, no dark mode" as an explicit non-goal (§1). This is a real reversal of that decision, not a tweak — recorded here rather than silently overwritten, per this doc's own practice of tracking *why* things changed.

**What prompted it:** the user shared a competitor screenshot (a dark, gradient-heavy EdTech/career site with a radial hub-and-spoke services layout) and asked for a dark theme, with that as loose inspiration.

**What was taken from the reference, and what was deliberately left out:** the dark background and the radial hub-and-spoke arrangement for the Services section were adopted (`ServicesConstellation.tsx`, desktop/`lg+` only — a radial layout doesn't hold up on narrow screens, so mobile keeps the plain grid). The reference's gradient rainbow text and glossy chrome light-beam decoration were **not** adopted — that execution reads as generic AI-startup hype, which directly contradicts the "cut the crap" brand position (§2). The result stays dark but restrained: one accent color, thin dashed connector lines instead of glow effects, no gradients anywhere.

**Why this was safe to do in one pass:** the entire component layer already consumed color exclusively through Tailwind classes mapped to CSS custom properties (`bg-bg-surface`, `text-text-primary`, etc.) — a decision made back in Phase 1 (§5) specifically so a full re-theme would be a token-file change, not a component-by-component rewrite. That paid off here: nearly the whole conversion is `tokens.css`. Two things weren't token-driven and needed direct fixes:
1. `Skeleton.tsx` used `bg-bg-sunken`, which is too close in value to its usual surrounding surfaces once everything went dark — added a dedicated `--bg-skeleton` token instead of reusing a surface token for two different jobs.
2. `CareerCircle.tsx`'s closing CTA block hardcoded `text-white/60` inside a `bg-text-primary` container. That container was always meant as an "inverted" block — a dark card floating on the light page. Once `--text-primary` flipped to near-white for dark-mode readability, that block became a *light* card, and the hardcoded white text on it became nearly invisible. Fixed with a dedicated `--text-on-invert-secondary` token rather than patching the symptom, so any future inverted-block pattern has a real token to reach for instead of hardcoding again.

**New tokens:** `--bg-skeleton`, `--text-on-invert-secondary`, plus the full surface/text/accent/semantic/border palette re-picked for dark-surface contrast (not just the light values with brightness inverted — e.g. the light theme's `--green: #15803D` reads as muddy on a near-black background, so dark mode uses `#34D399` instead, a genuinely different pick, not a mechanical inversion).

**Open question this creates:** no light/dark toggle exists — dark is now the only theme, replacing light entirely, same structure as the original light-only decision just flipped. Revisit if there's ever a reason to support both.

**Decision framework used for the two open calls (2026-08-20):**
- *Orbit vs. a safer redesigned grid* — decided via RICE: Reach is maximal (homepage, every visitor), Impact is high (the layout visualizes the actual "one platform, several services" positioning rather than being decorative), Confidence is medium-high (radial layouts are proven, main risk is mobile — handled via the grid fallback), Effort is medium but bounded (4 fixed satellites, not an open system). Also framed as a two-way door (a component, reversible) at the cheapest possible time to take a visual swing (pre-scale, few users) — built the orbit.
- *Serif vs. a geometric/technical display face* — decided via cost-of-being-wrong: the dark-near-black-plus-geometric-sans look is currently the most saturated aesthetic in the startup world (including the reference itself), so matching it means blending into a *more* crowded field, not standing out. The serif is the differentiating choice. Real risk (serifs can render wispy on dark) is a near-zero-cost, instantly-reversible fix (one font-family swap, touches nothing else) — kept the serif, treated as a fast bet rather than a permanent commitment made blind.

**Contrast audit (2026-08-20) — computed, not assumed:** the engineering-lead audit note above predicted that light-mode-passing contrast doesn't just survive an inversion. Verified by actually computing WCAG contrast ratios (not eyeballing) for every text/surface and text/accent pairing in the new palette. Found two real failures:

| Pairing | Before | After fix |
|---|---|---|
| `--text-tertiary` on `--bg-base` | 3.61:1 — **fails** AA normal text (4.5:1) | Lightened `#6F6A60` → `#847E72`, now 4.82:1 — passes |
| Primary button text (white) on `--accent` | 3.19:1 — **fails** AA normal text | Switched button text from white to `--bg-base` (dark) — same accent color, now 6.09:1. Also arguably reads more considered than default white-on-orange. |

The primary button one mattered most — it's the single most-used interactive element on the site, and it was failing accessibility contrast everywhere it appeared. Also fixed in the same pass: `JobCard`/`JobDetail`'s fallback color for jobs missing a `color` field from the crawler was still hardcoded to the old light-theme accent (`#D65A2B`) — updated to the current dark accent (`#E86B35`).

**Not yet audited:** the ~100+ per-company brand colors in `companies.json` (used for each `JobCard`'s left accent bar) were picked for legibility on a *light* card background — some may read poorly against the dark surfaces now. Lower priority since it's a thin accent bar, not body text, but worth a pass later if any specific colors turn out to be a problem.

### Home page restructure v2 (2026-08-22) — the "one-pager per section" debate

The user proposed a structure inspired by a second competitor reference (a long-scroll homepage with a full rich section per nav item — company-prep carousel, course catalog, resume templates, community). Debated before building, not accepted as-is:

**Where the reference idea was adopted:** an interactive (motion-only, no user input — explicit decision) pain-point hero that makes the visitor feel understood without necessarily saying so in words; CTAs letting a visitor self-select into any module from the top of the page; a full, earned one-pager section per *live* module.

**Where it was pushed back on and changed:** the reference's rich sections work because every one of them has a real product behind it (real companies, real courses, real templates). Building an equally rich one-pager for **Resources** and **Success stories** — neither of which exist yet — would require either fabricated placeholder content (a direct claims-audit violation, the same failure class as the "checked by hand" claim caught earlier) or a mostly-empty section stretched to look substantial (padding, which is its own form of the "crap" this brand cuts). Resolution: full one-pager treatment only for **Jobs** and **CareerCircle** (both real — CareerCircle's pain points and rules are real even though its join link isn't live yet); Resources/Success stories get a single honest "being built next, get notified" block with a `mailto:` capture instead, since there's no backend yet to receive form submissions (§7, admin form not built).

**Resulting page order:** Hero → live-proof strip (moved up directly under the hero, since it's the platform's only concrete evidence and audit feedback said it shouldn't wait several scrolls) → quick-nav overview (`ServicesConstellation`, unchanged) → Jobs full section (now with real computed stats: function count, city count, alongside the job count) → CareerCircle full section (condensed preview of the `/career-circle` page, not a duplicate) → Resources/Success-stories capture block.

**Hero motion enhancement:** pain-point lines gained per-line icons (`Search`, `BookOpen`, `Youtube`, `Compass` — each matched to its specific question) and a new `blur-in` keyframe (opacity + `translateY` + `filter: blur()`, not just the existing plain `fade-in-up`) for the H1/sub/CTA — a visibly richer reveal than before, still fully passive, per the explicit "animated only, no user interaction" decision.

### Jobs page rebuild v2 — explicit reversal of the milestone-27 approach (2026-08-23)

A detailed follow-up brief directly reversed several decisions from the immediately preceding milestone. Documented plainly rather than glossed over, since understanding *why* the previous approach was wrong matters as much as the new approach:

**Companies is back as an equal top-level nav item**, reversing "fold it into a Jobs sidebar." The explicit instruction: Companies should be "a real discovery page, not just the Jobs sidebar moved elsewhere." The permanent right-side sidebar added in the previous milestone is gone from `JobList.tsx` entirely.

**Filters rebuilt a fourth time** — from persistent always-visible pills (twice, across two earlier milestones) to closed popover triggers (`Function ▾`, `Level ▾`, `Work mode ▾`, `Location ▾`, `More ▾`) with a separate row of removable active-filter chips underneath. Worth naming directly: since nothing is shown until a trigger is clicked, the "too many pills crowding the row" problem that motivated the earlier curated-4-of-6 function list doesn't apply to this shape at all — the Function popover now lists all 6 real functions, no curation needed, because the popover itself is the thing keeping the row compact, not a reduced option count.
`More ▾` holds a genuinely new, real filter (posted date: Today / This week / This month), using `posted_at` data already present — not a placeholder with nothing behind it, since no other real filterable dimension existed to put there.

**Real company logos, not always-initials** — `CompanyLogo.tsx`, using Google's public favicon endpoint (`google.com/s2/favicons`, no API key, no signup, no new dependency) keyed off a *guessed* domain (lowercase company name + `.com`, since no website field exists anywhere in the data). Falls back to the existing `CompanyAvatar` monogram automatically on load failure. **Two things flagged honestly, not glossed over:** (1) the domain guess will be wrong for many companies with non-obvious domains — wrong guesses just silently fail to the monogram, never break anything, but the real "logo hit rate" in practice is genuinely unknown until observed live; (2) the specific behavior of Google's favicon endpoint for *unrecognized* domains (does it 404, or return a generic fallback icon at full size?) could not be verified from this sandbox — no network path to google.com. A `naturalWidth <= 16` heuristic attempts to catch a small generic-icon case, but this threshold is unconfirmed against a real response and may need adjusting once actually observed. `CompanyAvatar.tsx` is **not** orphaned by this change — it's now real, active fallback infrastructure inside `CompanyLogo`, not a superseded component.

**`JobCard` changes, several of them direct reversals of the immediately preceding pass:** the per-company colored border (top border on compact cards, left border on full cards) added last milestone specifically for "visual distinction" is **removed** — explicitly named as decorative rather than semantic, and orange is now reserved for selected/interactive states only. The raw `fn` badge, which literally rendered the word "data" on cards for analytics roles (genuinely ambiguous out of context), now goes through the same `fnLabel()` mapping used everywhere else (extracted to a new shared `lib/jobs/functionLabels.ts`, previously duplicated only inside `JobFilters.tsx`). The posted-date label lost its color-coded recency dot and green/amber/gray tone system entirely — explicitly de-emphasized to quiet muted text, no signal-by-color anymore. Padding tightened throughout to cut the "unnecessary empty vertical space" the brief called out.

**A fourth occurrence of the Tailwind opacity-modifier bug, caught before shipping this time**, unlike some of the earlier ones: `text-text-tertiary/70` on the de-emphasized posted-date text silently compiled to nothing, same root cause as `bg-accent/10`, `bg-green/20`, and `bg-bg-base/40` before it — our color tokens are plain hex values, not the RGB-channel format Tailwind's opacity-modifier syntax needs. Given this is now a confirmed *recurring* mistake (four times), a full pattern-based scan (`grep`-equivalent regex across every `.tsx` file for any `bg-|text-|border-` class followed by `/\d+`) was run across the entire codebase after this fix, not just the one file that triggered it — zero other instances found. This scan is now worth running as a standing check any time a new arbitrary color-with-opacity class is introduced, the same way the escape-sequence sweep became standard practice earlier.

**`/companies` enriched into an actual discovery page** — gained a search input (filters by name) and a function-pill filter row (filters by whether a company has any open roles in that function), both operating on the same derived company list, no new fetch. Card copy reframed from a bare stat block to Company → open roles → areas hiring, matching the requested editorial framing.

**A new inline "Companies hiring" discovery module inside the Jobs feed**, replacing the removed sidebar — inserted after the first 8 results (splitting the results into two grid segments around it, rather than injecting a differently-shaped item into the middle of a CSS grid, which would have broken the grid's column alignment). Heading text is contextual to the *currently filtered* result set (derived from `filtered`, not the full unfiltered job list) — "Companies hiring for Analytics" when the Function filter is Analytics (the pre-selected default, so this is what most visitors see first), "Companies hiring {mode} {function} talent" when both Function and Work mode are set, falling back to "Companies hiring now" with nothing active. Matches the brief's own worked examples exactly.

### Nav restructure, Companies-as-feed, curated Jobs pills, mobile pass (2026-08-23)

Five requested changes, all shipped:

**1. "Home" added back to nav.** Was dropped in the v7 rebuild on the reasoning that the wordmark already links home; brought back by explicit request — in practice a separate nav item was still wanted alongside the wordmark link.

**2. "Companies" removed from top-level nav, replaced by a parallel feed inside the Jobs page.** `JobList.tsx` now renders a two-column layout on desktop (`lg:grid-cols-[1fr_260px]`) — job results on the left, a "Companies hiring" sidebar on the right, derived from the exact same already-fetched job list via `deriveCompanies()` (no second fetch). Capped at 8 companies with a "See all companies" link to the full `/companies` page, which **still exists and still works** — only its nav promotion is gone, not the route itself (job cards and this new sidebar both link into it). On mobile, the sidebar drops below the job results rather than competing for horizontal space — DOM order was already main-content-first, confirmed rather than assumed.

**3. Footer tagline updated** from "Build a better analytics career." (the superseded v7 hero's copy) to "Fast-Track Your Analytics Career." (the current, actual hero H1). A stale-copy bug essentially — the footer had been quietly contradicting whichever hero was actually live for at least one full rebuild cycle.

**4. Mobile-specific pass**, concrete changes not just "doesn't break at small widths": `ProductFrame`'s browser-chrome traffic-light dots now hide below the `sm` breakpoint (saves horizontal room specifically for the label text, which also gained `truncate` so a long label like "onestopcareers.com/jobs" can't overflow on a narrow screen), header padding tightened (`px-3 py-2.5` vs `px-4 py-3` desktop), content padding tightened (`p-4` vs `p-5` desktop). Checked (not assumed) that the alternating two-column Home sections (Opportunities, Career Circle) already had text-before-visual DOM order regardless of their `lg:order-1`/`lg:order-2` desktop-only reordering — they did, no fix needed there, but worth having actually verified rather than guessed.

**5. Jobs function-pill row curated down from 6 always-shown pills to 4 + expandable.** `CORE_FNS = ['data', 'product', 'engineering', 'bizops']` shown by default with friendly labels (Analytics / Product / Engineering / Business), a "+ More" toggle reveals the remaining two (Finance, Design) rather than hiding them entirely. `activeFn` now defaults to `'data'` (Analytics pre-selected) instead of `null` (all functions) — matches the site's actual analytics focus rather than defaulting to an unscoped view.

**A real data limitation surfaced and flagged, not silently worked around:** the request's example pill set included "Data science" as a category separate from "Analytics." Checked `crawler.js`'s `detectFn()` before building anything — both "data scientist" and "data analyst" titles map to the *same* `fn: 'data'` bucket; there is no way to distinguish them with current data. Building a separate "Data science" pill would have produced identical results to "Analytics" while implying a real distinction that doesn't exist — declined to build it, used the 4 categories the data can actually support instead.

### Problem section removed from homepage (2026-08-23)

The user directly asked to remove the "Your analytics career is more than a job search." Problem section from `Home.tsx` — headline, copy, and the `FragmentedJourney` visual all cut. New section order: Hero → How It Works (Platform Pillars) → Show The Product → Proof → Final CTA. The hero's own copy ("Know what to learn, what to build, and what to do next") already implies the problem being solved, so going straight from hero into "how it works" reads as tighter rather than leaving a gap — consistent with the "don't repeat the same promise" discipline this whole rebuild has been following. `FragmentedJourney.tsx` marked orphaned, left in the repo per standing practice.

### Missing favicon and robots.txt found via the sync script's honesty fix (2026-08-23)

The sync script's "Synced:" reporting fix (from the earlier scripting-bug saga) paid for itself immediately: the very next real run reported `! Not found in zip, skipped: public` — the first honest signal, ever, that `public/` didn't exist in the delivered build. Checked and confirmed: it genuinely never existed. This is the same favicon gap flagged all the way back in the very first platform audit (`PLATFORM_AUDIT.md`) and never actually closed across dozens of milestones since.

**Fixed now:** `public/favicon.svg` — a simple on-brand mark (dark rounded square, italic serif accent-orange "o", matching the nav wordmark's own styling) — and a proper `<link rel="icon">` tag added to `index.html` (there wasn't one at all before; browsers were silently 404ing on the default `/favicon.ico` request this whole time). Also added `public/robots.txt` (`Allow: /`, no sitemap reference — deliberately not linking to a sitemap.xml that doesn't exist, since referencing a non-existent resource would be the same class of small dishonesty this project has been catching everywhere else). Verified both actually land in the real Vite build output (`dist/favicon.svg`, `dist/robots.txt`), not just present in source.

### Home page v8.1 — fixing the "two sections feel the same" problem (2026-08-23)

A screenshot review caught something the code review hadn't: the Problem section's `FragmentedJourney` and the How-It-Works section's `PlatformPillars` used the identical visual pattern (uniform bordered-box grid, same spacing, same muted styling) despite meaning opposite things — one represents scattered/fragmented tools, the other represents one unified clean path. Visually they read as duplicate sections, undermining the contrast the narrative depends on.

**`FragmentedJourney.tsx` redesigned to visually feel scattered, not organized** — rounded-pill tags instead of bordered cards, no grid alignment (`flex-wrap` instead), irregular per-item rotation and vertical offset, muted/reduced opacity. The section now looks the way its name says it should, rather than looking like a smaller preview of the clean pillars section below it.

**`PlatformPillars.tsx` v3 — descriptions made concrete, not generic.** The v2 copy ("Learn from peers, mentors, and people already doing the work") could describe almost any career platform's community feature. Each pillar now has a second, smaller detail line naming the actual real mechanism: CONNECT specifically names "a small Career Circle WhatsApp group, not a public feed of thousands" (the user's own example), and the other three pillars got matching specificity (real job data refreshed daily for DISCOVER, real datasets/business problems for BUILD, "what you actually built" for PREPARE) rather than leaving CONNECT as the only concrete one.

**Added a traveling-arrow animation along the pillar connector line** — a small arrow icon moves left-to-right across the line at 3.5s per cycle, fading in/out at each end rather than an abrupt jump-cut restart, giving the "one clear path forward" idea literal motion instead of a static line. Respects `prefers-reduced-motion` (freezes with the arrow hidden rather than force-animating).

**A real CSS bug caught and fixed before shipping, worth naming as its own instance of an ongoing pattern:** the first attempt at adding the traveling-arrow used `bg-bg-base/40` (Tailwind's opacity-modifier syntax) for the scattered tags' background — the same class of bug as the earlier `bg-accent/10` and `bg-green/20` incidents, since our color tokens are plain hex values, not the RGB-channel format that syntax requires. Caught by checking the compiled CSS output for the literal class string before considering it done (0 matches), same standing practice as before. **A second, unrelated bug was caught in the same pass**: the `str_replace` that inserted the new `@keyframes travel-arrow` block accidentally consumed the opening line of the adjacent pre-existing `@keyframes fill-bar` block (a copy-paste boundary mistake, not a Tailwind issue), which would have silently broken the "Fresh this week" live-proof strip's progress-bar animation elsewhere on the site — an unrelated component nowhere near what was actually being changed. Caught by grepping the file structure immediately after the edit rather than assuming a successful `str_replace` call means the surrounding file is still correct.

### Home page v8 — second full rebuild, narrative discipline (2026-08-23)

A second, more prescriptive strategy brief superseded the v7 homepage entirely. The key difference from v7 wasn't scope, it was an explicit anti-repetition rule: **"Do not repeat the same promise in multiple sections"** and a required narrative order (What is this? → Why do I need it? → How does it work? → Show me the product → Can I trust it? → What do I do next?). Most of the actual work in this rebuild was consolidation, not addition.

**Cut, not just replaced:**
- **`PainPointCards` removed entirely**, not relocated. The brief explicitly forbids a pain-point section "immediately after" the problem section, and on inspection its content (job-search fatigue, loneliness, content overload, AI anxiety) substantially restated the fragmentation problem Section 2 already covers — exactly the repetition the brief's core principle warns against. Marked orphaned, left in the repo.
- **The old standalone "Future Vision" 5-card roadmap section is gone.** Its content (Real-world projects, Resume & interview support, Curated resources, AI readiness, Career guidance) is now covered, with actual visual mockups instead of icon-and-paragraph cards, by the new Section 4 product previews below.
- **Platform Pillars reduced from 5 to 4** (`PlatformPillars.tsx` v2) — the ADAPT/AI pillar is gone as a standalone box. The brief was explicit: AI "should NOT feel like a disconnected sixth feature," it's the changing backdrop the other four operate inside, not one more step in the list. Reordered to Discover → Build → Connect → Prepare, matching the brief's exact sequence; AI's role is now a line of supporting copy above the pillars instead of a fifth icon.
- **The old separate full-width Jobs and Career Circle sections are gone as standalone sections** — both folded into the new Section 4 "show the product" sequence instead of existing as their own repeated pitch, since having both a dedicated marketing section AND a product-preview section for the same thing was exactly the kind of duplication being eliminated.

**New: a "show the actual product" section with six sub-areas**, each answering one specific question (Career Path: "what should I do next?", Opportunities: "where can I go?", Projects: "how do I build capability?", Career Circle: "who can help me?", Career Prep: "how do I present myself?", AI Readiness: "how do I stay relevant?"). **`ProductFrame.tsx`** is a new reusable browser-chrome wrapper built specifically so every one of these six sections carries the same honest, consistent status signal — a small "live" (green, pulsing) or "preview" badge — rather than each section inventing its own way of indicating whether something is real. Only Opportunities (real job data) and Career Circle (the mockup already used elsewhere) get "live"; Career Path, Projects, and Career Prep are all genuinely new UI with no real feature behind them yet, and are honestly marked "preview" — three new small illustrative components (`CareerPathPreview.tsx`, `ProjectsPreview.tsx`, `CareerPrepPreview.tsx`), all using generic, non-personalized sample content on purpose (faking personalization would be a worse claims-audit problem than the mockup itself).

**Hero and final CTA both use "Build My Career Path" as the primary button text, routed differently on purpose:** in the hero it's an anchor scroll to the new product section (`#product`) — honest, since no real "path builder" tool exists yet to send someone to; by the final CTA, after they've seen the whole product walkthrough, it routes to `/jobs`, the one concrete real action available. Same label, different destination, is a deliberate and common pattern (convince first, then route to the realistic next step) rather than an inconsistency.

### Home + Jobs polish round (2026-08-23)

**Career Journey section removed from Home.tsx.** User correctly flagged it as redundant with Platform Pillars — both sections cover "we're useful across your whole career," just with different labels (DISCOVER/CONNECT/BUILD/PREPARE/ADAPT vs. START/BUILD/CONNECT/PREPARE/OPPORTUNITY/GROW/ADAPT). `CareerJourney.tsx` marked orphaned, not deleted, per standing practice.

**Pain-point cards gained an explicit heading** — the four-card section previously rendered with zero context; a visitor could see four cards with no signal they were meant to be "does this sound like you." Added "Sound familiar?" / "The problems we built this to solve."

**Pain-point cards, mobile: shortened copy + horizontal scroll-snap carousel.** The desktop 2x2 grid with full paragraph-length copy, stacked to 4 full-height cards on mobile, was becoming the page's longest single scroll on small screens. Added a `headlineShort`/`solutionShort` pair per card (roughly half the length) shown only below the `md` breakpoint, rendered in a `overflow-x-auto snap-x snap-mandatory` horizontal carousel rather than a JS carousel library — works with native touch scrolling instead of fighting it, zero new dependencies. Desktop is unchanged.

**Jobs filters: reverted from dropdown `<select>`s back to pills, keeping the grouping.** This was a real, explicit decision, not a default — the original "chip wall" complaint (which motivated the dropdown version) was about *ungrouped* chips across every filter dimension in one undifferentiated row, not about pills as an interaction pattern. A closed dropdown is objectively slower to use than a pill (open, then select, vs. one click) and worse for scanning all options at a glance. Kept the small category labels (Function / Level / Work mode) from the dropdown version, reverted the actual controls to one-click toggle pills — combining the organization win from the dropdown redesign with the interaction-speed win pills always had.

**`JobCard` visual pass:** company name promoted from `text-secondary` to `text-primary` with more weight (`font-medium`, larger size) — was competing for attention with the job title at nearly the same visual weight despite being the brief's stated primary anchor. Added a subtle per-company colored accent (top border on compact cards, left border on full cards) using the same color already driving the monogram avatar — a restrained way to add visual distinction between cards without reintroducing the "unexplained colored bar" problem from before this whole redesign, since the color's meaning (company identity) is now established via the avatar right next to it.

**`JobDetail.tsx`: fixed a reported overflow bug** (description content appearing to spill out past/behind the Career Circle sidebar callout). Couldn't visually confirm the exact mechanism without a screenshot, so applied the set of fixes that eliminate the most likely causes rather than guessing at one: removed `position: sticky` from the sidebar (a sticky element overlapping content that follows its container is a known class of bug, and sticky was a nice-to-have here, not essential — removing it removes the entire risk category at low cost), added explicit `items-start` to the grid container, and added `break-words` to the fetched description text (a long unbroken token, e.g. a URL pasted into a job description, can overflow a column without it). If the issue persists after this pass, needs a screenshot to diagnose further — flagged as open in case it recurs.

### Jobs/Companies architecture, adapted from an external brief (2026-08-23)

### Jobs/Companies architecture, adapted from an external brief (2026-08-23)

An external product-architecture brief (full text preserved in conversation history) proposed a Jobs+Companies dual-navigation product with a full relational Company/Job data model, company profile pages, cross-navigation, logos, and eventually global search and hiring-velocity signals. Adopted selectively, not wholesale — the brief itself says "don't turn this into a giant redesign project," which was taken seriously.

**Logo decision — verified before building, not assumed.** The brief's card designs put a company logo as the primary visual anchor. Checked first: Clearbit's free Logo API (`logo.clearbit.com`), the old default choice for this, was **confirmed fully shut down December 8, 2025** — building against it would have shipped broken images. The official replacement (Logo.dev) needs a new account/token, same friction pattern as every other third-party integration weighed in this project. Chose instead to build `CompanyAvatar.tsx` — a colored monogram (company initial in a circle) using the per-company brand color already in `companies.json`'s `c` field. This also directly answers something the brief itself flagged: the old JobCard's colored vertical bar was "unexplained" — the same color, now shown as a monogram, has clear meaning (it's the company's visual identity) instead of being a decorative accent.

**Companies is a derived view, not a new data model.** The brief's Phase 10 proposes a full relational `Company`/`Job` schema with a `company_id` foreign key, company descriptions, size, locations, etc. Building that would require crawler changes and new data capture for ~186 companies. Instead, `src/lib/jobs/companies.ts` computes everything needed (open-role count, function breakdown, company color) by grouping the *existing* fetched job list client-side — zero new crawler fields, numbers are always live/real (recomputed from the actual current feed, never a cached/stale count), and `/companies` + `/companies/:slug` both work off this one function. Explicitly not included, since the data doesn't exist: company descriptions, website links, size, locations, "hiring velocity" signals (would need historical tracking we don't have).

**Nav gained "Companies," not a replacement nav.** The brief's own recommended nav is just "Jobs | Companies," on the assumption that's the whole product. This repo already has Career Circle as a real, separate differentiator built out over many milestones — removing it to match an external brief that didn't know it existed would have been a regression. Companies was added alongside the existing nav instead.

**`JobCard.tsx` redesigned to match the brief's exact hierarchy** — company (avatar + name, independently clickable to the company profile) → title → location/mode → function/level → posted date, both compact and full variants.

**`JobFilters.tsx` rebuilt from a flat chip wall to grouped selectors** — Function / Level / Work mode / More (city), matching the brief's Phase 1 spec. City moves from "deferred" (a note that had sat unresolved since the original filter component was built) to actually live, tucked inside "More" rather than given its own row, since cardinality was always the concern with surfacing it as a top-level chip.

**Explicitly not built, staying within the brief's own "don't over-build" instruction:** global unified search across Jobs+Companies (Phase 9), the full relational data model (Phase 10), hiring-velocity/"recently added" signals (Phase 6 — needs historical tracking), saved jobs (the brief itself marks this "potentially later").

### Repo merge — crawler moved into this repo (2026-08-23)

**Decision context:** a separate-vs-merge tradeoff was explicitly debated before today (see the exchange preceding this entry) — the recommendation was to keep `jobscout-date` and this repo separate, since they have genuinely different trigger/lifecycle shapes (scheduled batch crawl vs. on-demand per-request), and the actual pain point (duplicated ATS-fetching knowledge between `crawler.js` and the new `job-description.js` function) was judged small enough to solve with cross-reference comments rather than a repo merge. The user explicitly overrode this and asked for a full merge regardless — executed as asked, with the risk (see below) managed rather than re-argued.

**What moved:** the entire `jobscout-date` repo — `crawler.js`, `config/companies.json`, `config/pipeline.json`, `data/*.json` (real seed data, not empty), and its GitHub Actions workflow — now live inside this repo under `crawler/`. The workflow file itself (`crawl.yml`) had to move to this repo's **true root** `.github/workflows/`, not `crawler/.github/workflows/` — GitHub only discovers workflows at the repo root, never in a subdirectory. `defaults.run.working-directory: crawler` was added to every step so the workflow behaves as if it still lived in its own repo.

**Two real bugs fixed while moving it, not by design:**
1. A **duplicate `env:` key** in the original workflow's "Run crawler" step (`env:` appearing twice, nested) — invalid YAML structure, would very likely have broken the step. Caught by validating the new workflow with a real YAML parser before considering it done, not by eyeballing it.
2. **The exact User-Agent drift bug that caused the original v7/v8 version-inconsistency finding recurred a third time**, in the exact same spot (`fetchGoogleSheet`'s User-Agent string) — missed in both the v7→v8 fix and the initial v8→v9 bump pass today, only caught by actually *running* the crawler after the version bump and noticing the console banner still printed "v7" (a different, even older drift than the one being fixed). `fetchGoogleSheet`'s User-Agent is now a confirmed recurring blind spot in this file specifically — worth a specific check on it any time this file's version number changes again, not just a general grep pass.

**Version bumped to v9** (header comment, all three User-Agent strings, both `jobs.json`/`meta.json` `v:` fields, and the console startup banner — all six confirmed consistent by grep after the fact, and by actually running `node crawler.js --new-only` and reading the printed banner, not just by inspecting the source).

**Deliberately NOT done in this pass — the frontend still reads from the OLD repo's CDN URL.** `fetchJobs.ts`'s `CDN` constant was not touched. Flipping it now, before the crawler has successfully run even once in its new home inside this repo, would point the live site at a `jobs.json` that doesn't exist yet at the new path — an entirely avoidable, self-inflicted outage. The correct order:

**Cutover checklist — must happen in this order, not skipped or reordered:**
1. Push this merge (crawler/, .github/workflows/crawl.yml, updated README) to `main`.
2. On GitHub, manually trigger the workflow once (Actions tab → JobScout Crawler → Run workflow → mode: `force`, so it does a full run rather than relying on the 23h-TTL cache from the old repo's `state.json`, which won't mean anything in this new location's git history).
3. **Verify the run actually succeeded** — check the Action's logs, and confirm `crawler/data/jobs.json` was committed back to `main` with a real `updated_at` timestamp and non-zero job count.
4. Only then, update `src/lib/jobs/fetchJobs.ts`'s `CDN` constant to `https://cdn.jsdelivr.net/gh/Gketan97/onestopcareers@main/crawler/data/jobs.json`.
5. Deploy the frontend with that change, and confirm the live site still shows real jobs — jsDelivr's CDN caches aggressively, so this may take a few minutes to reflect after step 4's push even once the underlying file is correct.
6. **Only after step 5 is confirmed working:** go to the old `jobscout-date` repo and disable its GitHub Actions workflow (Settings → Actions → Disable workflow), so it stops running as a redundant, now-orphaned duplicate crawler. Don't delete or archive that repo immediately — keep it as a rollback path until this repo's crawler has proven itself over a few real daily runs.

**A second, larger process gap found while fixing this entry:** the mandatory escape-sequence sweep established earlier today (see the Jobs-roadmap-build entry above) only ever globbed source code files (`src/**/*.tsx`, `*.ts`, `*.js`) — **it never once checked `docs/*.md`, including this very file.** A check just run found **56 unfixed instances in this document alone**, accumulated across every design-doc update made today, meaning this file has been rendering literal escape-sequence text instead of real em-dashes and apostrophes for a significant part of today's session, in a document whose entire purpose is being read by a human. Fixed now (0 remaining, verified the same way). **The sweep's glob pattern is corrected going forward to always include `docs/*.md`, `README.md`, and every subdirectory README** — not just application source code. Documentation is not exempt from this bug class; if anything it's worse there, since a broken doc is silently wrong for as long as nobody happens to open it, while a broken UI string is usually caught the first time someone looks at the page.

### Jobs roadmap build — slugs, real descriptions, SEO, sort/filter (2026-08-23)

Built from a 9-phase external Jobs roadmap brief. Scope was explicitly split three ways before writing any code, since the roadmap mixed things at genuinely different levels:

**Not buildable in this repo:** Phase 1's data pipeline (normalize/dedupe/expiry) already exists, differently, in `jobscout-date`. Building it again here would duplicate infrastructure across two repos.

**Architecturally limited (client-only SPA, no SSR):** per-job Open Graph tags for link-preview bots (WhatsApp/LinkedIn) genuinely can't work without server-side rendering — those bots don't execute JS. Not built as a fake gesture; flagged honestly instead.

**Built, all of it:**

1. **On-demand job description fetching — the user explicitly authorized bringing crawler-adjacent logic into this repo** (“whatever it takes, even if we have to copy jobscout code”) rather than leaving descriptions unavailable. Implemented as `netlify/functions/job-description.js` — the **first backend infrastructure in this repo** (`netlify.toml` added to declare it). Fetches real descriptions from Greenhouse/Lever/Ashby (≈87% of active companies) *only when a specific job's detail page is opened*, not as part of the daily batch crawl — keeps `jobs.json` small and descriptions always fresh rather than aging in a duplicated store. Every other source (and any fetch failure) fails soft to `{ available: false }`; the frontend then shows an honest “view on {company}'s site” link rather than fabricated Responsibilities/Requirements content, since the crawler never captured that data to begin with.
   **Not verified against live APIs** — this sandbox has no network access to the real ATS endpoints (confirmed: a live test against `boards-api.greenhouse.io` returned a 403 from the sandbox's own egress proxy, not from Greenhouse itself). The function's per-source API shapes are built from documented/known formats, not a confirmed live response. Each source is independently try/caught specifically so a wrong assumption about one source degrades to “unavailable” for that source only, never a broken function. **Needs a real post-deploy smoke test** against a handful of live job URLs per source — see open questions.
   Also means **local dev (`vite`) can't exercise this function** (no Netlify runtime locally) — the local-preview step in `sync-and-deploy.sh` will always show the fallback link state, by design, not a bug. Real descriptions only appear once actually deployed on Netlify.
2. **Slug-based job URLs** (`src/lib/jobs/slug.ts`) — cosmetic/SEO slug generated fresh from current job data on every render (title-company-city-id), with the real `id` embedded as the trailing segment for lookup. Never stored, so links never go stale even if a job's title changes upstream between crawls. `JobDetail` redirects (`<Navigate replace>`) if an old/mismatched slug resolves to a job, canonicalizing to the current correct URL rather than serving two URLs for one job.
3. **`JobPostingSchema.tsx`** — real `schema.org/JobPosting` JSON-LD, injected client-side. This is the one piece of “SEO-ready job pages” that's genuinely achievable in a client SPA (Google renders JS before reading structured data). `validThrough` is computed from `posted_at + 30 days` — the crawler's own real dedup cutoff, not an invented number.
4. **`JobDetail.tsx` fully restructured**: two-column layout (content + sticky Career Circle sidebar CTA, a real link), “About this role” section wired to the new description fetch, “More [function] roles” using real same-function jobs from the already-fetched dataset, a deliberately minimal acquisition strip (per the brief's own “don't turn the job page into a marketing page” instruction), and an honest not-found state (“This role may no longer be accepting applications” + a real list of similar active roles, not just a text link).
5. **Sort control** on `/jobs` — “Newest” (genuinely chronological, `posted_at` desc) and “Most relevant” (title-match ranking, only meaningful with an active search query — the toggle is disabled with no query rather than pretending there's a ranking signal that doesn't exist yet).
6. **Seniority filter** added to `JobFilters.tsx` — a real field we already had but hadn't exposed. City filter remains deferred (documented reason unchanged: high cardinality needs a searchable dropdown, not chips).

**Explicitly not built, and why:** skills-based filtering/tags (`job.skills` doesn't exist in the schema — crawler doesn't capture it), salary display (never scraped), “Recently updated” as distinct from “Newest” (no separate `updated_at` field exists, only `posted_at`), “New on OneStopCareers” framing as distinct from “Posted Xd ago” (would need a `discovered_at` timestamp the crawler doesn't track — kept the existing, already-claims-audited `posted_at`-based labels rather than fabricate a distinction we can't back with real data).

**A process failure worth being blunt about:** the literal-escape-sequence bug (`\’` written as text inside JSX children instead of inside a real string literal) recurred **five more times** across this single build pass, despite having been caught, fixed, and explicitly documented as a standing practice twice before today. Shell-based `grep` checks used earlier in the day were themselves unreliable (a quoting mistake caused false negatives — the check reported “clean” on a file that still had the bug). Fixed by switching to a Python-regex sweep (`re.findall(r'\\\\u[0-9a-fA-F]{4}', content)` across every touched file, with actual automatic replacement, not just detection) run **after every file write**, unconditionally — not as a remembered lesson, but as a mechanical step in the same category as running `tsc` or `vite build`. This is now the standing verification method; the `grep`-based version used in earlier sessions should be considered unreliable and not repeated.

### Career Circle page rebuild + Jobs page confirmation (2026-08-23)

**Career Circle** fully rebuilt from a dedicated 10-section brief, same pattern as the homepage rebuild — supersedes the previous pain-point-led version of this page entirely (kept in this doc's history, not in the file). New structure: Hero → What is Career Circle → What happens inside (6 cards) → Why a small circle (5 concepts) → The experience (mockup, updated with the brief's exact example conversation topics) → How it works (4 steps) → Who is it for (2–5 YOE, 5 named roles) → Community principles (5 lines) → FAQ (7 questions, answered only from facts already established elsewhere in this doc — capped at 50, 2–5 YOE, WhatsApp-based, free — no invented pricing or policy beyond that) → Final CTA. Both CTAs stay "coming soon" throughout — the group itself still isn't live.

**Jobs page** — confirmed, not rebuilt structurally. The user explicitly stated this page publishes every role tracked, across every function, and is *not* scoped to analytics the way the homepage preview is — filter logic for a narrower view is planned for a later build, not this one. Copy updated to state this directly ("Every role we track, across every function") rather than leaving it implicit. No changes to `JobList`/`JobFilters`/`JobCard` — filtering behavior is unchanged.

**A bug pattern worth calling out explicitly, since it recurred three times in one session:** the literal-escape-sequence bug (writing `’` as text inside JSX children instead of inside a real string literal, or inside a code comment where it never mattered) happened again twice more while building these two pages, despite having been caught and documented after the v6 hero rebuild. Both instances were caught the same way — grepping the actual source and compiled output for literal backslash-u sequences before considering the work done, not by inspection alone. A full sweep of `src/` after this pass found zero remaining instances. **Standing practice going forward:** prefer HTML numeric entities (`&#8217;`, `&mdash;`) over raw Unicode characters or `\u` escapes when writing JSX text via any tool that constructs file content as a string (heredocs, `create_file`) — entities are visually distinguishable in the source (easy to eyeball-check) and cannot silently fail the way an escape sequence outside a string literal can.

**Also fixed while touching `CareerCircleMockup.tsx`:** `bg-green/20` was the same opacity-modifier bug as the earlier `bg-accent/10` case (documented under Home page v5) — Tailwind's opacity-modifier syntax doesn't work with our hex-based color tokens, and this one had been silently rendering as a transparent (invisible) badge background since it was first written, unnoticed until this pass. Fixed with an inline `rgba()` style, same fix pattern as before. No `-soft` token exists for green the way `--accent-soft` does for the accent color — worth adding one later if more green-tinted UI shows up, rather than continuing to reach for inline rgba each time.

### Home page v7 — full rebuild from an external strategy brief (2026-08-23)

The user provided a complete, fully-specified homepage strategy brief (positioning, section-by-section copy, IA, design direction) and asked for it to be built directly. This **supersedes** most of the iterative v1–v6 hero work above (the pain-point spotlight/resolve sync, the "cut the crap" dynamic headline, the 4-item nav) — kept in this doc as history, not deleted, since the reasoning in each earlier entry is still valid for understanding *why* things were the way they were before this rebuild.

**Naming decision, confirmed explicitly with the user before building:** "OneStopCareers" stays one word (wordmark unchanged). "Career Circle" becomes two words, replacing "CareerCircle" everywhere in visible text (nav, footer, homepage sections). The `/career-circle` URL slug is unchanged — only display text changed.

**Two deliberate overrides from the brief, not silently followed:**
1. **Jobs section uses real live data** (`fetchJobs`, filtered to `fn === 'data'`), not the brief's suggested "realistic but clearly fictional" sample job cards. We already have real analytics roles working from Milestone 9 onward — replacing them with fictional cards would be a regression against the claims-audit discipline that's held for the entire project, not an improvement.
2. **No testimonials at all, not even labeled-sample ones.** The brief explicitly forbids fabricated testimonials, even placeholder-labeled — stricter than the "Sample layout — real stories coming soon" section shipped in v3/v4. That section is removed entirely, replaced with the brief's specified philosophy block ("Real opportunities. Real people. Real work. Real career growth.") and empty, visibly-unfilled testimonial slots (dashed border, quote icon, "Real member story, coming soon" — structurally ready, zero fabricated content).

**New IA:** nav becomes Jobs · Career Circle · Resources · Projects · AI (Resources/Projects/AI all `enabled: false`, same "visible but inert" treatment already established for unbuilt modules). "Home" dropped as a separate nav item (the wordmark already links home). "Success stories" dropped from nav — folded conceptually into the new "Future vision" section instead of being a standalone destination. Nav gained "Log in" (inert placeholder — no auth exists) and a primary "Start Building" button, pointing at `/jobs` — the one concrete, live "start" experience the platform actually has.

**New homepage structure, 11 sections:** Hero → Core problem (fragmented-tools concept) → Four pain-point cards (static, no rotation — brief explicitly says "do not over-animate") → Platform pillars (Discover/Connect/Build/Prepare/Adapt, shown as a connected system with a spine line, not five isolated cards) → Career Circle (headline, mockup, "peer network not a group chat" positioning) → Jobs (real data) → Future vision (5 roadmap cards, clearly labeled "Coming soon") → AI section (old-vs-evolving-analytics visual transition) → Career journey (7-stage vertical timeline) → Social proof (philosophy + empty testimonial slots) → Final CTA.

**New components:** `FragmentedJourney.tsx`, `PainPointCards.tsx`, `PlatformPillars.tsx`, `AITransition.tsx`, `CareerJourney.tsx` — all new. `CareerCircleMockup.tsx` reused with its visible label updated to "Career Circle." `PainPointSpotlight.tsx`, `PainPointRotator.tsx`, `useRotatingIndex.ts`, and `ServicesConstellation.tsx` are now all unused — left in the repo, not deleted, per the project's standing practice for superseded-but-potentially-reusable components.

**Footer and `index.html` also rebuilt in this pass** (not strictly homepage, but both were explicitly specced in the brief and both closed real, previously-flagged gaps): footer now mirrors the full nav and adds a positioning line + social placeholders (genuine placeholders, `href="#"`, not claims that these accounts exist). `index.html` finally has a real meta description — this closes platform-audit finding G3/C7 (no meta description existed at all before this).

**Process note:** this file was written using HTML numeric entities (`&#8217;`, `&mdash;`) for apostrophes and em-dashes in JSX text content, rather than raw Unicode characters or `\u` escape sequences. HTML entities decode correctly in JSX text natively; the earlier v6 bug (literal `’` text appearing on-page) was specifically about a JS escape sequence misplaced outside a string literal — entities avoid that failure mode entirely and were verified present and correctly decoded in the compiled output before considering this done.

### Home page v6 — synced spotlight/resolve, resolving the "cut the crap" contradiction (2026-08-23)

The user correctly identified a real contradiction the previous rotator never resolved: a rotating question (one pain point shown, three hidden behind a timer) paired with a fixed, generic answer ("It's time to cut the crap.") on the right side regardless of which pain point was active. A brand about directness was asking visitors to wait, and answering a specific question with a generic statement.

**Six structural options were brainstormed and scored** (time-to-value, build complexity, accessibility, mobile, motion, cut-the-crap fit) before picking one — including two the user's own back-and-forth surfaced that weren't in the original three: a user-driven picker (rejected — reverses the explicit "animated only, no user input" decision) and a hybrid spotlight-with-persistent-visibility pattern, which is what shipped.

**What shipped:**
- `PainPointSpotlight.tsx` — all four pain points are **always rendered and always fully readable**, not hidden behind a timer. The active one gets a filled icon badge, a border, and full-brightness text; the other three dim to secondary color but never disappear. This is the fix for the earlier rotator's core flaw (a visitor arriving mid-cycle used to miss 3 of 4 value props entirely).
- `useRotatingIndex.ts` — a shared hook lifted out of the old rotator so **one index drives both sides of the hero**. The right side's headline, sub-line, and CTA are now specific to whichever pain point is spotlighted (e.g., spotlight on "no one to ask" → headline becomes "You don't have to do this alone" → CTA becomes "Join CareerCircle"), resolving the actual contradiction rather than patching around it: nothing generic is ever on screen, every visible pairing is a complete, specific question-and-answer.
- **"Cut the crap" demoted to a small static motto tag**, no longer asked to also serve as a dynamic headline that has to make sense against four different questions simultaneously.
- **Eyebrow stat moved to the Jobs section**, next to the live-proof mockup — its natural evidentiary home, no longer competing with the hero headline for attention.
- **Explore row rebuilt as bordered pill links** (was plain underlined text) — the complaint was both size and position/weight, not one or the other; pills read as real, weighted options rather than an afterthought regardless of viewport.
- **`PainPointRotator.tsx` and its private per-component rotation state are now unused** — left in the repo, marked as orphaned, not deleted.

**A real bug caught before shipping, not after:** the first draft of this rebuild used literal `’`/`“`/`”` escape-sequence text directly inside JSX children (e.g., `<>You don’t have to do this...</>`) rather than inside actual JS string literals. Unicode escapes only resolve inside quoted strings — as raw JSX text they would have rendered as literal backslash-u-text on the page. Caught by grepping the actual compiled output for real Unicode characters before considering the build done, same discipline established after the `bg-accent/10` bug in v5.

### Home page v5.1 — hero column balance fix (2026-08-23)

A live screenshot of v5 caught a real layout bug: the two-column hero used `items-start`, and the left column (rotator: icon, one pain point, CTA, progress bar) is inherently shorter than the right column (headline, sub-line, quote card, button, explore row). Top-aligning both meant the shorter left column just stopped, leaving ~500–600px of dead black space beneath it before the next section appeared — reading as unfinished content, not intentional whitespace. Fixed by switching the grid to `items-center`, so the shorter column centers against the taller one instead of leaving an unbalanced trailing gap. Flagged separately, not yet confirmed: a possible stray border/rendering artifact near the quote card's right edge in the same screenshot — held for a follow-up look since it wasn't clearly reproducible from a static image alone.

### Home page v5 — hero split, real bugs caught (2026-08-23)

A live screenshot review of v4 caught real problems, not just polish opportunities:

1. **The explore row (CareerCircle/Resources/Success stories) was functionally invisible** — `text-tertiary` at 13px, the same marginal 4.82:1 contrast value flagged in the earlier WCAG audit. Passing a contrast check on paper didn't mean it read as a visible, clickable link in practice. Fixed to `text-secondary` (7.48:1) with a small "Or explore" mono label above it, so it reads as an intentional navigation aid rather than optional-looking gray text.
2. **Trust bar removed from the hero entirely** — "Pulled directly from company career pages" and "No AI-generated links" were restating what the sub-paragraph two lines above already said, in a quieter voice. Redundant, not reinforcing.
3. **The "Built by people who've sat exactly where you're sitting" line got its own visual treatment** — was plain paragraph text blending into the flow above it; now a distinct bordered card with a quote mark, matching the emotional weight the line is trying to carry.
4. **Hero split into two columns on desktop** — the pain-point rotator now gets its own side of the page instead of being squeezed above the headline, competing with it for vertical space in a single column. Rotator got a real visual upgrade to match: a glowing icon badge (using the already-correct `--accent-soft` token — an earlier attempt used Tailwind's `bg-accent/10` opacity-modifier syntax, which silently compiled to nothing because our color tokens are plain hex values, not the RGB-channel format that syntax requires; caught by checking the actual compiled CSS output, not by inspection alone) and a timer-fill progress bar per point (an Instagram/YouTube-Shorts-story pattern showing real elapsed time, not just position) replacing the small static dots.

**Process note worth keeping:** the `bg-accent/10` bug is a good example of why "does this look right in the code" isn't sufficient QA for anything involving Tailwind's dynamic class generation — the class can be syntactically valid TSX and still compile to an empty, do-nothing rule. Grepping the actual built CSS for the expected class name (as done here) is now the standard check before shipping any new arbitrary-value or opacity-modifier Tailwind class on this project.

### Home page v4 — composition and redundancy fixes (2026-08-23)

A live-screenshot review found the page had accreted three separate "Jobs" moments (live-proof strip, orbit node, full section) and one all-at-once pain-point block dense enough to read as a wall of text before the headline even appeared — each individual addition was justified in isolation at the time it shipped, but nobody had stepped back to look at the whole assembled scroll until now. Fixed:

1. **Pain-point rotator, not a stacked list.** `PainPointRotator.tsx` shows one pain point at a time, larger, auto-cycling every ~4.2s, with passive progress dots — same four pain points, same per-point CTA, staged over time instead of dumped simultaneously. Respects `prefers-reduced-motion` (stops on the first point rather than force-cycling). This is the single biggest density fix on the page — the heaviest block is now roughly a quarter of its former height.
2. **Orbit (`ServicesConstellation.tsx`) removed from the page entirely** — left in the repo, not deleted, but no longer imported. It had become a fourth wayfinding mechanism doing the same job the hero's per-point CTAs, the quiet explore row, and the two full sections already did, more slowly and less specifically than any of them.
3. **Live-proof strip merged into the Jobs section**, side-by-side on desktop (`lg:grid-cols-2`) — the claim ("refreshed daily, straight from source") and the evidence for it (the actual live browser-mockup with real job cards) now sit in the same glance instead of two scrolls apart.
4. **CareerCircle got a matching visual moment** — `CareerCircleMockup.tsx`, an illustrative WhatsApp-style chat mockup, same honesty standard as the testimonials section (fictional names, explicitly labeled "not a real chat," not styled to pass as an actual screenshot). CareerCircle was the only full section with zero visual craft, which is exactly why it read weaker than Jobs even though its copy was equally strong.
5. **CareerCircle copy rewritten** from a feature list ("referrals, feedback, updates") to the impostor-syndrome research already grounding the pain points ("Everyone around you already seems to know this... that feeling doesn't go away when you get the job").
6. **Testimonials moved up**, now sitting between the Jobs and CareerCircle sections rather than after both — social proof works as a breather between two dense pitches, not a footnote once the reader is already fatigued.

### Home page v3 — analytics pivot, research-grounded pain points (2026-08-23)

**Scope decision:** platform pivots to Analytics-focused positioning, but only the homepage for now — `/jobs` itself still shows all functions (product, engineering, design, finance, bizops, data). This is a known, accepted gap: the homepage now promises "analytics roles" specifically, and clicking through to `/jobs` shows a broader mix. Acceptable for this phase, but `/jobs` needs its own scoping pass before this gap sits too long — flagged in open questions below.

**Pain points were rewritten twice** — first pass was invented from assumption, rejected. Second pass was grounded in actual research (Reddit/Blind/Substack/Medium posts on analytics career transitions, imposter syndrome, and 2025–2026 sources on AI's effect on entry-level analytics work), then scored against a rubric (specificity, research-grounding, ownability, voice-fit) with 3 options per pain point. Final copy is the user's own further-tightened versions of the winning concepts:

1. "Refreshing 10 job platforms a day, hoping something new shows up? We already do that grind for you — free." — maps to Jobs.
2. "No one to ask when you're stuck. No one to tell you you're not failing. Doing this alone burns you out fast." — maps to CareerCircle. Grounded in the specific, named pattern across nearly every source: self-doubt that persists *after* getting the role, not just during the search.
3. "A hundred roadmaps, a thousand YouTube videos, three paid courses — still can't tell what actually matters?" — maps to Resources (not yet built).
4. "AI already writes the SQL and builds the dashboard. If that's the job, what's left for you in 3 years?" — maps to Resources. Grounded in a specific, current (2025–2026) research finding: junior "report-runner" analytics work — the traditional entry point into the field — is exactly what AI is absorbing first.

**CTA structure — resolved via a real debate, not a default:** rejected both a single generic CTA and a grouped 4-button row (the user's original ask, modeled on the nav bar). Landed on a three-tier hierarchy instead: one dominant primary CTA (`Browse jobs`), an inline link next to *each* pain point answering that specific question where it's asked, and a quiet text-only "explore" row below the primary CTA for the remaining paths. Reasoning: research on multi-CTA pages consistently shows equal-weight competing buttons increase hesitation rather than reduce it; hierarchy (one loud action + several quiet ones) outperforms four co-equal choices.

**Live-proof strip re-scoped to analytics** (`fn === 'data'`) so the homepage's own evidence matches its own pitch — showing engineering/product roles under an analytics-focused hero would have been a self-contradiction the claims-audit process should have caught before shipping, not after.

**Sub-paragraph — flagged, not blocked:** "Built by people who've sat exactly where you're sitting" is a specific personal/founder claim, the same category of statement as every other claim this doc holds to a truth standard. Shipped on the user's explicit instruction, but needs confirmation it's literally true before this goes live for real — see open questions.

**Testimonials — held at the line, not crossed.** The user asked for testimonials with invented content; declined to write fabricated quotes attributed to fictional named people, since that crosses from "brand voice" into deceptive-advertising territory regardless of a stated intent to replace them later — there's no guarantee a real visitor doesn't see and believe the fake version first. Built instead as clearly-labeled sample content: a visible "Sample layout — real stories coming soon" tag, and role-only attribution (e.g. "Analytics transition, 3 YOE") instead of invented names or photos. Same visual structure as the real thing will have, none of the fabrication.

**"Vetted by real experts" — a new claim requiring a real answer before Resources ships**, same class of risk as "checked by hand" (removed in the first audit) and "5x job updates" (flagged as a commitment to honor). Not blocking the homepage now, since Resources isn't live yet and the claim is about a not-yet-existing thing — but whoever builds Resources needs an actual, real answer to "who vets this and how" before that module ships, not just the phrase reused as marketing copy.

### Home page v2 — live screenshot review fixes (2026-08-23)

A screenshot of the actually-deployed v2 hero surfaced five real issues a visual-only review (rather than reading the code) caught:

1. **Straight apostrophes/quotes sitewide** (`&apos;`, `&ldquo;`, `&rdquo;` HTML entities render as straight `'`/`"`, not typographic `'`/`"`/`"`) — on a page whose identity leans on an editorial serif, this reads as a finishing-polish gap. Fixed in `Home.tsx`, `CareerCircle.tsx`, `JobList.tsx` — every entity replaced with the real Unicode character.
2. **Eyebrow color competed with the H1 for attention** — the live-stat eyebrow was full-saturation `text-accent`, the single highest-contrast element on the screen, actually *louder* than the much-larger H1 despite being far less important. Changed to `text-text-tertiary` — the green pulse dot still signals "live," the number is still readable, but it no longer wins the first glance.
3. **Icon semantic collision** — the "Unsure where to find the right jobs?" pain-point line used a location-pin icon (`MapPinned`), which already means "city" everywhere else on the site (job cards show a pin next to the city name). Swapped to `Search` for the pain-point line (better fit anyway — it's about the *act* of searching) and kept `Briefcase` for the Jobs module badge, matching what `ServicesConstellation.tsx` already used, so both representations of "Jobs" agree.
4. **H1 line-break was accidental** — "You don't have to guess. We already checked." wrapped wherever the browser happened to fit it at a given width, splitting mid-sentence in a way that wasn't composed. Added an explicit `<br />` after "guess." so the two-clause structure always reads as intended, at any viewport width.
5. **Hero top padding read as empty rather than premium** — `pt-20 md:pt-28` (up to 112px) stacked on top of the nav's own height read as a large, unexplained gap before any content appeared, on a page that's otherwise dense with information immediately below. Reduced to `pt-12 md:pt-16` (hero) and `pt-16 md:pt-20` (Jobs section, same pattern).

### Home page audit fixes (2026-08-21)

Following the full element-by-element home page audit (`docs/HOME_PAGE_AUDIT.md`), the top four ranked findings were fixed:

1. **Hero eyebrow** — was a static "Cut the crap." motto in a small mono label, judged as undersold (bold words, filing-label execution) and asserting nothing verifiable. Replaced with a real, computed number (`{jobCount} roles tracked right now`) pulled from the same `fetchJobs()` call already needed for "Fresh this week" — shows a neutral "Checking today's roles…" placeholder while loading, never a fake number. The motto itself isn't lost — it still lives in the orbit hub's tagline (`ServicesConstellation.tsx`).
2. **Hero H1** — was "If that's you, OneStopCareers is for you," judged the weakest line on the page: generic reassurance-copy where everything around it was specific. Replaced with "You don't have to guess. We already checked." — directly resolves the four "unsure" pain-point questions instead of a vague affirmation, and matches the two-clause blunt cadence already established by the Jobs-section H2.
3. **Orbit connector lines** — previously appeared instantly, fully drawn, despite being the page's one genuinely distinctive layout element. Now use an SVG `stroke-dasharray`/`stroke-dashoffset` line-drawing animation (`animate-draw-line`, `index.css`), staggered per satellite. Tradeoff: the lines were previously dashed (`strokeDasharray="3 4"`) for a restrained look; the draw technique requires the full line length as the dash value, so lines are now solid once drawn rather than dashed. Judged an acceptable, intentional tradeoff — a solid completed connection reads fine, arguably better ("this connected") than a static dash pattern ever did.
4. **"Fresh this week" reframed as a live-product proof, not a plain list** — the audit's single highest-leverage finding was that the entire page makes claims with zero visual evidence. Rather than add a static screenshot (which would go stale and become exactly the kind of unverifiable claim the claims-audit process exists to catch), the real `JobCard` components with real fetched data are now framed in a browser-chrome mockup (fake traffic-light dots + a URL bar reading `onestopcareers.com/jobs`) with a live-updating job count and a pulsing "live" indicator. It's not a picture of the product — it is the product, styled to read as evidence rather than as a content section.

**Incidental fix surfaced while building #4:** `--bg-elevated` has existed in `tokens.css` since the original scaffold but was never added to `tailwind.config.cjs`'s color mapping — meaning `bg-elevated` has been a dead, unusable class this entire time (nothing in the codebase used it, because it silently did nothing). Added to the Tailwind config as part of this pass, now real and used for the browser-chrome mockup's top bar.

**Not yet done from the audit's ranked list:** consolidating arbitrary `text-[Npx]` values to a real defined type scale (deprioritized — investigated first, and the type-scale tokens referenced in earlier design-doc drafts were never actually wired into Tailwind's `fontSize` config, so this is a larger, sitewide undertaking rather than a home-page fix, better scheduled as its own pass); the sub-paragraph's Jobs-specific claim still sits in the platform-level hero (a soft violation of the positioning-layers rule, flagged but not resolved, since Jobs remains the only fully-live service and removing the claim would leave the hero with less evidence, not more).

### Visual polish audit (2026-08-20)

An honest FAANG-lens pass found the visual system was tokenally correct but under-executed — good bones, missing finish. What was found and fixed:

| Gap | Fix |
|---|---|
| Zero icons anywhere — even the search magnifying glass was a hand-rolled inline SVG | Added `lucide-react`. Every icon site (nav, search, filters, cards, empty/error states, CTAs) now uses a real icon, not text or hand-drawn paths. |
| **No mobile nav menu** — `hidden md:flex` hid the nav links with no alternative on small screens; only the logo and CTA button remained reachable | Real hamburger menu in `Nav.tsx` (`Menu`/`X` icons, slide-down panel), state-managed, closes on navigation. This was a functional bug, not just a polish gap. |
| No `focus-visible` styling anywhere | Global focus-ring token (`--focus-ring`) applied to every interactive element via `index.css`. Keyboard users previously got browser default or nothing. |
| No motion beyond a single button hover translate | Added `--ease-out`/`--dur-fast`/`--dur-base` tokens, a `fade-in-up` keyframe utility, staggered entrance on `JobCard` lists (`index` prop → animation-delay), pain-point stacks, and the services strip. Respects `prefers-reduced-motion`. |
| Empty/error states were text-only | `EmptyState` and `JobDetail`'s not-found state now get an icon in a circle — a moment, not just a sentence. |
| No shadow tokens — cards relied on border-only depth | Added `--shadow-sm/md/lg`, used sparingly on hover (cards, buttons) — still borders-first per the original editorial direction, shadows are a hover accent, not a base state. |
| **Hero had zero CTA** — a growth-lead audit finding (2026-08-20): the first screen a visitor sees had four pain-point questions and a headline, nothing to click. Buttons lived only in the Jobs section, well below the fold. | Added a real CTA row to the platform hero (`Browse jobs` + a `See what's here ↓` anchor link to the Services section). The Jobs-section CTA further down stays too — intentional repetition for visitors who scroll past the hero unconvinced, not redundant filler. |
| `ServicesConstellation`'s hub circle used the old `onestop.` wordmark and an ungrounded tagline ("Learning to jobs") not in the copy canon, inconsistent with the `onestopcareers` wordmark already fixed in `Nav.tsx` weeks earlier | Hub now matches Nav exactly (`onestopcareers`, accent on "careers"), tagline replaced with the established "Cut the crap." motto — reinforced at the literal visual center of the homepage instead of introducing new unaudited copy. |

Not addressed in this pass, flagged for later: no custom illustration/photography anywhere (still type + icon + color only), no page-transition between routes, no skeleton-to-content crossfade (skeletons just get replaced instantly).

### Inherited DNA (from previous dark-theme version, adapted to light)

The previous version's visual identity had good bones worth keeping: a serif/sans/mono typographic triad, a single warm accent color rather than a rainbow palette, a layered-surface token system, restrained motion, and semantic color-coding for recency. This table is historical — it documents the original dark→light conversion; the theme reversed back to dark on 2026-08-20 (see the note above), so the "Carried forward as (light)" column no longer reflects the live site. The actual current values are in `src/styles/tokens.css` and the updated token set below.

| Element | Previous (dark, pre-2026) | Light (2026, superseded) |
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

### Current token set (dark, live)

```css
:root {
  /* Surfaces — warm charcoal, not pure black */
  --bg-base:        #0E0D0C;
  --bg-sunken:      #17140F;
  --bg-surface:     #1D1A16;
  --bg-elevated:    #232019;
  --bg-skeleton:    rgba(255,255,255,0.06);

  /* Text — warm off-white, not pure white */
  --text-primary:   #F3F0E9;
  --text-secondary: #A6A096;
  --text-tertiary:  #6F6A60;
  --text-on-invert-secondary: #5C574C; /* for the bg-text-primary "inverted card" pattern */

  /* Accent */
  --accent:         #E86B35;
  --accent-soft:    rgba(232,107,53,0.14);
  --accent-border:  rgba(232,107,53,0.35);

  /* Semantic (recency, status) — re-picked for dark-surface contrast,
     not a mechanical inversion of the light values */
  --green:  #34D399;
  --amber:  #FBBF24;
  --gray:   #9C978D;
  --red:    #F87171;

  /* Borders — light-on-dark alpha strokes */
  --border-subtle:  rgba(255,255,255,0.08);
  --border-default: rgba(255,255,255,0.16);

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
| `home/ServicesConstellation.tsx` | Desktop-only (`lg+`) hub-and-spoke layout for the Services strip, added 2026-08-20 with the dark-theme reversal. Mobile uses a plain grid via `ServiceCard`, defined inline in `Home.tsx`. |

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
11. **Sub-paragraph founder claim** — "Built by people who've sat exactly where you're sitting" needs explicit confirmation it's literally true before this ships for real. If it isn't true as written, it needs to be softened before launch, not after.
12. **"Vetted by real experts" for Resources** — a real claim with no real answer yet behind it. Needs an actual vetting process (who, how, how often) decided before Resources ships — not urgent today since Resources isn't live, but shouldn't be forgotten once it is.
13. **`/jobs` scoping gap** — the homepage now promises analytics-specific roles; `/jobs` itself still shows every function. Accepted for this phase per the user's explicit "homepage only for now" decision, but this gap needs a resolution (scope `/jobs` to match, or make the homepage's promise more general again) before it sits long enough to become its own trust problem.
14. **`job-description.js` needs a real post-deploy smoke test** — verify the Greenhouse/Lever/Ashby response-shape assumptions against a handful of actual live job URLs per source once deployed (this sandbox has no network access to confirm them). If any source's shape is wrong, that source degrades gracefully to the fallback link rather than breaking — but it should still be fixed once known, not left silently degraded.
15. **Skills/description capture** — real content for job pages (skills tags, salary, structured Responsibilities/Requirements beyond the raw fetched description text) requires the crawler itself to start capturing this data (`content=true` on Greenhouse calls, equivalent elsewhere), a `jobscout-date` change, not a frontend one. Worth scoping as its own effort if job-page richness becomes a priority beyond what on-demand fetching already provides.
