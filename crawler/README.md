# crawler/

The job data pipeline for OneStopCareers. Merged into this repo from a
standalone `jobscout-date` repo on 2026-08-23 — see the design doc
(`docs/DESIGN_DOC.md`, "repo merge" entry) for why, and the cutover
checklist for what still needs to happen before this becomes the live
data source.

## What it does

Pulls job listings directly from each company's own ATS (Greenhouse,
Lever, Ashby, Workable, SmartRecruiters, Eightfold, Workday) — no
scraping, no HTML parsing, all official public APIs. Classifies by
India-relevance, dedupes, drops anything older than 30 days, writes
`data/jobs.json` / `data/meta.json` / `data/state.json`.

Runs daily via `.github/workflows/crawl.yml` **at the repo root** (GitHub
only discovers workflows there, not in subdirectories) — that workflow
sets `working-directory: crawler` for every step, so it behaves as if it
lived here even though the YAML file itself can't.

## Running it locally

```bash
cd crawler
npm install
npm run crawl              # incremental (skips companies scraped <23h ago)
node crawler.js --force    # full re-scrape of everyone
node crawler.js --new-only # only companies never scraped before
```

No secrets are required to run — Adzuna and JSearch are currently
disabled (see the v8/v9 changelog at the top of `crawler.js`), and the
Google Sheet manual-entry step skips gracefully if `GSHEET_CSV_URL` isn't
set.

## Files

- `crawler.js` — the whole pipeline, one file
- `config/companies.json` — the company registry (single source of truth — add companies here, not in code)
- `config/pipeline.json` — backlog of companies not yet onboarded (needs ATS/slug research before they can move to `companies.json`)
- `data/` — output, committed back by the GitHub Action after each run

## This does NOT run automatically as part of the frontend build

`npm run build` at the repo root only builds the Vite frontend in `src/`.
This crawler runs on its own schedule, completely independent of any
frontend deploy — pushing frontend changes does not trigger a crawl, and
a crawl completing does not trigger a frontend deploy (the frontend reads
`data/jobs.json` from a CDN, not from a local build-time import).
