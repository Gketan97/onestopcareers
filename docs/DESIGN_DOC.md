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

### Career Circle page rebuild + Jobs page confirmation (2026-08-23)

**Career Circle** fully rebuilt from a dedicated 10-section brief, same pattern as the homepage rebuild — supersedes the previous pain-point-led version of this page entirely (kept in this doc's history, not in the file). New structure: Hero → What is Career Circle → What happens inside (6 cards) → Why a small circle (5 concepts) → The experience (mockup, updated with the brief's exact example conversation topics) → How it works (4 steps) → Who is it for (2–5 YOE, 5 named roles) → Community principles (5 lines) → FAQ (7 questions, answered only from facts already established elsewhere in this doc — capped at 50, 2–5 YOE, WhatsApp-based, free — no invented pricing or policy beyond that) → Final CTA. Both CTAs stay "coming soon" throughout — the group itself still isn't live.

**Jobs page** — confirmed, not rebuilt structurally. The user explicitly stated this page publishes every role tracked, across every function, and is *not* scoped to analytics the way the homepage preview is — filter logic for a narrower view is planned for a later build, not this one. Copy updated to state this directly ("Every role we track, across every function") rather than leaving it implicit. No changes to `JobList`/`JobFilters`/`JobCard` — filtering behavior is unchanged.

**A bug pattern worth calling out explicitly, since it recurred three times in one session:** the literal-escape-sequence bug (writing `\u2019` as text inside JSX children instead of inside a real string literal, or inside a code comment where it never mattered) happened again twice more while building these two pages, despite having been caught and documented after the v6 hero rebuild. Both instances were caught the same way — grepping the actual source and compiled output for literal backslash-u sequences before considering the work done, not by inspection alone. A full sweep of `src/` after this pass found zero remaining instances. **Standing practice going forward:** prefer HTML numeric entities (`&#8217;`, `&mdash;`) over raw Unicode characters or `\u` escapes when writing JSX text via any tool that constructs file content as a string (heredocs, `create_file`) — entities are visually distinguishable in the source (easy to eyeball-check) and cannot silently fail the way an escape sequence outside a string literal can.

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

**Process note:** this file was written using HTML numeric entities (`&#8217;`, `&mdash;`) for apostrophes and em-dashes in JSX text content, rather than raw Unicode characters or `\u` escape sequences. HTML entities decode correctly in JSX text natively; the earlier v6 bug (literal `\u2019` text appearing on-page) was specifically about a JS escape sequence misplaced outside a string literal — entities avoid that failure mode entirely and were verified present and correctly decoded in the compiled output before considering this done.

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

**A real bug caught before shipping, not after:** the first draft of this rebuild used literal `\u2019`/`\u201c`/`\u201d` escape-sequence text directly inside JSX children (e.g., `<>You don\u2019t have to do this...</>`) rather than inside actual JS string literals. Unicode escapes only resolve inside quoted strings — as raw JSX text they would have rendered as literal backslash-u-text on the page. Caught by grepping the actual compiled output for real Unicode characters before considering the build done, same discipline established after the `bg-accent/10` bug in v5.

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
