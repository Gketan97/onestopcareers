# OneStopCareers

Career platform for analytics professionals — Jobs, Career Circle, and
more on the way. See `docs/DESIGN_DOC.md` for the full history of how
this got built (it's long, and worth reading before making changes —
almost every non-obvious decision in this repo is explained there, not
just declared).

## Repo structure — this is now a merged monorepo

As of 2026-08-23, this repo contains **two genuinely different things**
that happen to live together by explicit decision (see the "repo merge"
entry in the design doc for the full reasoning, including the case for
keeping them separate that was considered and overridden):

```
src/                    — the React/Vite frontend (Netlify build target)
netlify/functions/      — one serverless function (on-demand job description fetch)
crawler/                — the daily job-data crawler, previously its own repo
  crawler.js              — the whole pipeline
  config/companies.json   — company registry
  data/                   — output, committed by GitHub Actions after each run
.github/workflows/       — crawl.yml MUST live here (repo root), not inside crawler/
docs/                    — design doc + audits, the actual source of truth for "why"
```

**These do not share a build, a deploy, or a `node_modules`.** The
frontend build (`npm run build` at repo root) only touches `src/`. The
crawler has its own `package.json` in `crawler/` and runs entirely via
GitHub Actions, on its own schedule — pushing frontend code does not
trigger a crawl, and a crawl finishing does not trigger a frontend
deploy.

## Getting started (frontend)

```bash
npm install
npm run dev
```

## Getting started (crawler)

```bash
cd crawler
npm install
npm run crawl
```

See `crawler/README.md` for run modes and what secrets (if any) it needs.

## Deploys

Frontend: connected to Netlify, pushes to `main` deploy automatically.
Crawler: runs daily via `.github/workflows/crawl.yml`, commits its own
output back to `crawler/data/`.

**Important, read before touching `fetchJobs.ts`:** the frontend
currently still reads job data from the CDN URL of the *old* standalone
`jobscout-date` repo, not from this merged repo's `crawler/data/`. That's
deliberate sequencing, not an oversight — see the cutover checklist in
the design doc before changing that URL.
