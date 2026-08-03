# Project log

Running log of actions, decisions, errors, and next steps across the El
Niño build-out and the marketing work for both El Niño and 365 Red Flags.
Newest entries at the bottom. Full per-phase technical detail lives in
`docs/checkpoints/`; this is the cross-cutting narrative.

## El Niño — Phases 4-9 (auth, uploads, warnings, space weather, moderation, hardening)

Implemented and verified against a real PostgreSQL instance (Docker
Desktop, installed this session — see `installed-tools.md`). Full detail:
`docs/checkpoints/PHASE-4.md` through `PHASE-9-VERIFIED.md`.

Key decisions:
- Kept Prisma (already installed) over Drizzle — no concrete reason to
  switch (ADR 0004).
- Watch Zones and warnings use point+radius, not PostGIS geometry — dynamic
  vector map data stays gated pending `docs/investigations/MAPLIBRE-GEOJSON.md`.
- Local-disk upload storage for now, explicitly flagged as not
  production-ready past one instance (`docs/DEPLOYMENT.md`).

Errors found and fixed (all via live verification, not guessing):
1. `vitest.config.ts` didn't load `.env` — the 4 database-gated tests
   silently skipped instead of running.
2. PowerShell scripts halted on Docker's own stderr progress output
   (`$ErrorActionPreference = "Stop"` treated it as fatal).
3. Warning/space-weather fixture timestamps were anchored to a fixed past
   date and went stale against the real clock.
4. `UploadForm.tsx` used a nulled `SyntheticEvent.currentTarget` after an
   `await`.
5. CI never ran `prisma generate` before typecheck.
6. Three "Save Watch Zone" Playwright clicks were intercepted by
   CI-only rendering differences (confirmed via `gh run view --log-failed`,
   not guessed) — mitigated with `click({ force: true })`.

Result: CI green on `https://github.com/hotmess69999/el-nino`
(`master`, run `30805535672`), 72/72 unit tests, 50/50 Playwright tests.

## El Niño — finish/polish pass

Audited for the items explicitly requested: build, dependencies, tests,
responsive design, SEO metadata, social preview image, favicon/manifest,
performance. Found and fixed real gaps: no favicon, no manifest, no OG/
Twitter card metadata, no social preview image — none of it existed before
this pass. Generated with ImageMagick (already present), wired into
`src/app/layout.tsx` and a new `src/app/manifest.ts`. See
`audit-report.md`, `release-notes.md`, `deploy.md`, `final-report.md`.

## Marketing content — both projects

Could not verify the Payhip product page directly (`https://payhip.com/365redflags`
returned 403 to `WebFetch`) — marketing copy for 365 Red Flags was written
to avoid asserting unverifiable specifics (price, exact format), relying
only on what the product name itself establishes.

Created, saved to `C:\Users\jasmi\marketing\`:
- `365-red-flags/`: 5 Instagram posts, 5 X posts, 5 Reddit posts
  (value-first, no in-post links — most relationship subreddits ban
  self-promotion), 3 blog articles (800-1200 words), 5 video scripts.
- `el-nino/`: same structure, educational/climate-science framing,
  Australian English, no sensationalism.
- `posting-calendar.csv`: 46 pieces scheduled across a 30-day window
  (2026-08-04 to 2026-09-01), no repeated content, no platform double-
  booked on the same day.

## Account access / publishing (Phase 5) — blocked, explained to the user

No credentials have been provided. Separately clarified a capability gap
when asked "why can't you use a browser and post": this environment has no
general interactive browser-automation tool with session/login capability —
Playwright here is scoped to the El Niño test suite against a local dev
server, and `WebFetch` is read-only, one-shot, no auth. Real options going
forward:
- **X, Reddit**: both have usable APIs — with API credentials (not a
  password) this can be done directly via HTTP requests, no browser needed.
- **Instagram**: no equivalent for personal accounts; Meta's API requires a
  Business/Creator account + app review. Realistic path is either manual
  posting or a third-party scheduler (Buffer/Later/Metricool) that already
  has Instagram's publishing permission.

Nothing was installed or attempted toward bypassing this — per the explicit
constraint against evading moderation/verification systems, and because no
credentials exist yet to act on regardless.

## Next steps (not yet done, waiting on user input)

1. If API-based posting is wanted: user supplies X API keys and/or a Reddit
   script-app client ID/secret (never pasted as plain passwords) — then a
   small posting script can be written and run locally.
2. If Instagram posting is wanted: user picks a scheduler and connects
   their own account to it; this agent can prepare export-ready
   caption/image sets for that tool.
3. Real deployment target for El Niño — not chosen yet, `docs/DEPLOYMENT.md`
   documents requirements without picking a paid provider (per standing
   instruction not to provision anything without explicit approval).
