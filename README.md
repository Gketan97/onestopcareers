# OneStop Jobs

Standalone jobs frontend, rebuilt clean per `docs/DESIGN_DOC.md`. Consumes
`jobs.json` published by the separate `jobscout-date` crawler repo — this
repo does not scrape anything itself.

## Status

Phase 1 (foundation) scaffolded. See `docs/DESIGN_DOC.md` §5 for the full
component build order — build one component at a time, in that order.

## Getting started

```bash
npm install
npm run dev
```

## Structure

```
docs/DESIGN_DOC.md   — the design doc: brand, tokens, IA, data contract, security
src/app/App.tsx       — routing (single source of truth for routes)
src/pages/            — thin pages composing components
src/components/jobs/  — Jobs-domain components (Phase 2)
src/components/ui/    — generic primitives
src/components/shell/ — Nav, Footer, Layout
src/lib/jobs/          — Job type + CDN fetch, isolated from pages
```

## Deploys

Connected to Netlify — pushes to `main` deploy automatically.
