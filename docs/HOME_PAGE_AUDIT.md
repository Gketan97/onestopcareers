# Home Page — Full Element-by-Element Audit

**Question being answered for every single element below:** why does this exist, is it the best available choice, and what would state-of-the-art actually look like instead of what's shipped? Nothing gets a pass for "it's fine" — either it's justified or it's a gap.

---

## 0. The honest headline verdict

No. It is not yet the best and most modern experience we can provide, and the reason isn't any single element — it's that **every individual decision is defensible, but the page has zero moments of visual ambition.** It is a very well-argued, well-typeset, accessible, on-brand document. It is not yet a *product* that looks expensive. The single biggest gap on the entire page: **there is not one image, illustration, product screenshot, or piece of real visual craft anywhere on it.** Type, icons, and color are carrying 100% of the visual weight. That's a legitimate minimalist strategy — Stripe's early homepage did this — but it only works if the typography and motion are doing *more* than they currently are, and right now they're doing the minimum needed to be "clean," not the maximum needed to be "state of the art."

---

## 1. "Cut the crap." — the hero eyebrow

**What it is:** `font-mono text-xs uppercase tracking-wide text-accent`, a small pulsing green dot, sitting alone above the pain-point stack.

**Directly answering your question — should the motto be stated this literally?** Yes, keep it as text, but the *execution* currently undersells it. A phrase this blunt, sitting in an 11px mono label with a decorative dot, reads like a category tag ("New," "Beta"), not a statement of intent. The words are doing the work of a manifesto; the typography is doing the work of a filing label. That mismatch — bold words, timid presentation — is the single clearest example on the page of a decision that's *defensible in isolation* but *undersold in execution*.

**What state-of-the-art would actually do:** either (a) commit further — larger, more confident treatment, maybe the first thing that animates in with real weight, or (b) stop stating it and let the four blunt pain-point questions immediately below *be* the demonstration of "cut the crap" without needing a label first. Right now it does neither fully — it announces the attitude, then the page proceeds to make its case the ordinary way anyway. Recommendation: cut the label, let the pain-point stack open cold. "Cut the crap" as a *sitewide belief* still belongs in the nav/footer/meta description; as hero copy, the pain-point stack already proves it without narrating it.

## 2. The pain-point stack (4 lines)

**What it is:** `text-lg text-text-secondary`, an accent em-dash bullet, staggered fade-in at 40/90/140/190ms.

**Typography:** correct choice — body weight, not display weight, because these are meant to be *read as questions to yourself*, not admired as headline copy. Using the serif here would make them feel like assertions; the sans keeps them conversational.

**Copy:** genuinely good, this cleared a real audit already (question-stack-then-resolve is a proven pattern, each line lets a different visitor self-identify). No change needed to the words.

**Motion:** the stagger is correct in principle, understated in execution — 50ms between lines at this length means most visitors won't consciously register a stagger happened, they'll just see text appear. State-of-the-art here isn't more animation, it's better-timed animation: worth testing longer gaps (120–150ms) so the stagger reads as *deliberate pacing* (like someone asking you these questions one at a time) rather than a technical fade-in.

## 3. H1 — "If that's you, OneStopCareers is for you."

**Typography:** Instrument Serif, `text-5xl md:text-7xl` — this is the single largest, most confident typographic moment on the page, correctly so. The italic accent on "is for you" is a nice touch — matches the pattern used on every other headline sitewide (Jobs section, CareerCircle), which is good systemic consistency.

**Positioning:** correct as the resolve-line payoff after the pain-point agitation. No change.

**Copy — the honest critique:** this is the weakest line on the page relative to everything around it. The pain-point stack is specific and sharp; "OneStopCareers is for you" is generic reassurance-copy that could sit on almost any product's homepage after almost any pain-point list. It doesn't cut the crap — it's the single most conventional sentence on the page, positioned as the headline. Compare to the Jobs-section H2 ("You know how to job search. You just don't do it daily.") — that one is specific, ownable, impossible to mistake for a competitor's line. The hero H1 should hit that same bar and currently doesn't.

**Recommendation:** replace with something that resolves the *specific* four questions just asked, not a generic "we're for you." E.g., something that names what actually happens next (jobs, resources, community, roadmap — the four pain points, mirrored back as the four things solved) rather than a feel-good affirmation.

## 4. The sub-paragraph (job-sourcing claim)

**Copy:** this is genuinely strong — it's the platform's real, *verified* differentiation (direct-from-source, auto-expiry, dedup), stated as mechanism, not marketing. No change needed to the words; this cleared a claims audit and earned its place.

**Positioning — a structural question worth raising:** this paragraph is entirely about *Jobs* (career-page sourcing, dead-listing expiry) sitting in the *platform-level* hero, which is supposed to be scoped above any single service (per the design doc's own positioning-layers principle, §2 rule #6). This is a soft violation of the platform's own rule: a Jobs-specific proof point is doing double duty as the platform's trust statement. It works today because Jobs is the only live service, but the moment Resources or Success stories ship, this paragraph will read as oddly Jobs-centric for a "platform" hero. Worth flagging now rather than after it's baked into muscle memory.

## 5. Trust bar (2 checkmark items)

**Typography/positioning:** `text-[13px]`, small and quiet under a border-top divider — correctly deprioritized below the sub-paragraph, since it's reinforcement, not the main claim.

**A real inconsistency, worth naming precisely:** the design doc's type scale defines `--text-xs` through `--text-3xl` as named tokens, specifically so type sizing is a *system*, not ad hoc choices. In practice, `Home.tsx` alone uses six different arbitrary bracket values (`text-[13px]`, `text-[11px]`, `text-[56px]`, `text-[10.5px]`, etc.) instead of the defined scale. This isn't a home-page-only problem — it's sitewide — but the home page is the highest-visibility place it shows up. Every arbitrary value is a tiny, independent decision instead of a systemic one; over time this is exactly how "clean but common" happens, one pixel value at a time. Recommendation: audit and consolidate to the named scale everywhere, home page first.

## 6. Hero CTA row (Browse jobs + "See what's here ↓")

**Hierarchy:** correct — one primary (filled button), one quiet secondary (text link), not two competing buttons. This is right.

**The anchor-scroll link — an honest UX question:** "See what's here ↓" scrolling to the orbit section is a reasonable pattern, but it's also the kind of thing that state-of-the-art execution would make *feel* like something, not just jump the viewport. Right now `scroll-behavior: smooth` (global) is the only motion involved — serviceable, not memorable.

## 7. The Services orbit (`ServicesConstellation.tsx`)

**This is the single best idea on the page and the single most under-animated.** The concept (hub-and-spoke, visualizing "one platform, several services") was the correct call per the RICE reasoning already documented. But look at what actually happens on load: the connector lines just *appear*, fully drawn, with no animation at all — only the hub and satellite cards fade up. The lines are the entire visual metaphor of "orbit," and they currently have zero motion.

**What state-of-the-art actually looks like here, concretely:**
- Connector lines should **draw themselves** (SVG `stroke-dashoffset` animation, a well-established technique) from hub to satellite, not appear instantly — this is the single highest-leverage animation upgrade available on the whole page, because it's the page's one genuinely distinctive layout.
- Consider a very subtle idle animation on the hub (a slow pulse or breathing glow) so the "live platform" feeling persists after the entrance animation finishes, not just during the first 500ms of page load.
- The satellite cards use the exact same `SatelliteCard`/`ServiceCard` visual treatment as a flat grid card would — nothing about their *rendering* signals "this is special," only their *position* does. A slightly distinct visual treatment for the orbit satellites (vs. the plain mobile-grid fallback cards) would reinforce that this is a designed moment, not a repositioned list.

**Mobile fallback:** correct engineering call (a literal orbit breaks under ~1024px), but worth naming clearly: **mobile users, likely the majority of traffic for this audience, never see the best idea on the page at all.** They get the safe grid. This isn't wrong, but it means the "state of the art" moment is currently a desktop-only privilege — worth deciding if that's acceptable long-term or if a mobile-appropriate *alternate* expression of the same idea (e.g., a vertical connected timeline instead of a radial layout) is worth building later.

## 8. Jobs service section (H2, sub, CTA)

**Copy:** this is the strongest writing on the page, already covered above. No change.

**A repeated CTA — is it filler?** "Browse jobs" appears twice on the page (hero, and here). Reasoned as intentional non-redundant repetition in the design doc ("for visitors who scroll past the hero unconvinced"), which is a legitimate, common pattern (e.g., a landing page CTA repeated at top and bottom). Holding, not a genuine problem — flagging only because you asked for justification of every CTA, not because it needs fixing.

## 9. "Fresh this week" (live job cards)

**This is the page's only real piece of "state" — actual live data rendering, not static copy.** It deserves more visual weight than it currently gets: it's presented identically to a generic content section (a header + "see all" link + a list), with nothing marking it as "this is real, this is happening right now." Concretely: no live-updating timestamp, no subtle "updated Xh ago" marker, no visual distinction between this section (real, dynamic) and the orbit section (static, illustrative) above it. A visitor scrolling past has no signal that they just crossed from marketing copy into an actual live product.

**Skeleton-to-content transition:** loading skeletons are correctly present, but they're replaced instantly when data arrives — no crossfade. A small polish gap, flagged in the earlier platform audit (D-lens), worth doing here specifically since this is the first real data a new visitor sees.

## 10. Images — the direct answer to "where do we need imagery"

Zero images exist anywhere on the home page. The honest assessment, by category:

- **Stock photography of people:** actively recommend *against*. Generic stock photos of "diverse professionals smiling" are exactly the kind of manufactured, interchangeable content the brand is positioned against — adding them would contradict "cut the crap" more than help it.
- **A real product screenshot of the Jobs page (grid view):** recommend *for*, strongly. This is the single missing piece of evidence on the entire page. Every claim currently made is verbal ("refreshed daily," "direct from source," "500 people already applied") — none of it is *shown*. A framed screenshot of the actual live Jobs grid, placed either directly under the hero or beside the "Jobs — live now" section, converts every abstract claim into something a visitor can see is real. This is the highest-leverage visual addition available, higher-leverage than any animation upgrade.
- **Illustration for CareerCircle's "walking circle" concept:** already prototyped as a chat demo, never shipped to the actual site. That's a real, larger undertaking — flagging as a known available asset, not re-recommending it be rebuilt from scratch here.

## 11. CTAs — full inventory and verdict

| CTA | Verdict |
|---|---|
| Hero "Browse jobs" | Correct — clear, primary, points at the only fully-live service |
| Hero "See what's here ↓" | Fine, could be more memorable (see §6) |
| Jobs section "Browse jobs" | Correct, intentional repetition, not filler |
| "See all jobs →" (Fresh this week) | Correct, appropriately quiet since it's a secondary path within an already-engaged section |
| Nav "Join CareerCircle" | **Currently a dead end** — points at a real page whose own CTA is "coming soon." Flagged already in the platform audit (P2) as a trust cost; restating here since it's reachable from the home page nav on every scroll position. |

---

## Summary — what "state of the art" actually requires, ranked

1. **A real product screenshot** — highest leverage, currently the single biggest gap, not an animation problem at all.
2. **Rewrite the H1** — the weakest line of copy on the page, sitting in the most prominent position.
3. **Animate the orbit connector lines drawing in** — the highest-leverage motion upgrade, because it's the page's one distinctive layout element currently under-selling itself.
4. **Reconsider the "Cut the crap." eyebrow's execution** (or cut it and let the pain-point stack open cold).
5. **Consolidate arbitrary type sizes to the defined scale** — a systemic fix, not a single-page one, but most visible here.
6. **Give "Fresh this week" a visual signal that it's live data**, distinct from the static sections around it.
7. Smaller: crossfade skeletons instead of instant swap; reconsider the sub-paragraph's Jobs-specific claim sitting in the platform-level hero.
