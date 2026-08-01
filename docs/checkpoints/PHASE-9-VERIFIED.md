# Phase 9 — verified against a real PostgreSQL database

Status: **complete.** Every check in `scripts/run-final-checks.ps1` passed for
real against a live PostgreSQL instance (Docker Desktop, started for the
first time on this machine during this pass). This supersedes the
"infrastructure handoff, not yet verified" status recorded in
`docs/checkpoints/PHASE-7-8-9.md`.

## What actually happened

Docker Desktop was already installed on this machine but not running, and its
engine failed to start with `WSL2 is unable to start since virtualisation is
not enabled on this machine` — a real hypervisor-level nested-virtualization
block, not a missing-install problem. That got resolved outside this
session (the user's infrastructure), after which Docker's engine came up
cleanly and every step below ran for real.

## Bugs found and fixed while actually running against Postgres

None of these were visible without a live database — this is exactly why the
instruction was to verify for real rather than accept the code-reasoning-only
state from earlier checkpoints:

1. **`vitest.config.ts` didn't load `.env`.** Vitest (unlike Next.js) doesn't
   auto-load `.env` into `process.env`, so `RUN_DB_TESTS=1` alone wasn't
   enough — `DATABASE_URL` was missing and the 4 gated tests in
   `src/lib/db/integration.test.ts` silently skipped instead of running.
   Fixed with `loadEnv` from `vite` wired into `test.env`.
2. **PowerShell scripts halted on Docker's own stderr progress output.**
   `$ErrorActionPreference = "Stop"` treated Docker CLI's normal stderr
   progress lines (container start/stop status) as terminating errors even
   though the underlying command succeeded. Fixed in
   `start-database.ps1`/`reset-database.ps1`/`verify-database.ps1`/
   `setup-phase9.ps1` by switching to `"Continue"` with the explicit
   `$LASTEXITCODE` checks that were already in place (the pattern
   `run-final-checks.ps1` already used, which is why it never hit this).
3. **Warning/space-weather fixtures went permanently "expired."**
   `src/lib/warnings/localAdapter.ts` and `src/lib/spaceWeather/localAdapter.ts`
   anchored their fixture timestamps to a fixed `2026-07-31` reference date —
   caught live when `e2e/alerts.spec.ts` started failing because real time
   had crossed into `2026-08-01` and `listActiveWarnings()` filters
   `expiresAt > now`. Fixed by computing the reference as `new Date()` on
   every call instead of a hardcoded past date; ingestion stays idempotent
   (upsert by `providerId`+`providerWarningId`) so this is safe to reseed
   repeatedly.
4. **`e2e/watchZones.spec.ts`'s `getByRole("button", { name: "Edit" })`
   substring-matched two buttons** ("Edit profile" and the Watch Zone's own
   "Edit") once a real signed-in profile page had both on screen at once.
   Fixed with `exact: true`.
5. **Lighthouse ran against an already-stopped server.** The production-route
   smoke test's background server job is stopped before the Lighthouse step;
   Lighthouse was hitting a closed port and every audit failed with
   `CHROME_INTERSTITIAL_ERROR`. Fixed by giving the Lighthouse step its own
   server job.

Each fix was committed individually with the specific failure it addressed —
see the commit log around this change for detail per fix.

## Final quality gate — all real, all passing

```
Lint                                                    PASS
Typecheck                                               PASS
Unit + integration tests                                PASS
Clean database migration (reset-database.ps1)           PASS
Database verification incl. seed idempotency (verify-database.ps1) PASS
Playwright -- desktop + Pixel 7 (full suite)            PASS
Production build                                        PASS
Production-route smoke test                             PASS
Dependency audit (npm audit)                            PASS
Lighthouse baseline                                     PASS
```

- **Migrations**: all 3 migrations (`20260731190000_init`,
  `20260731200000_reports_and_warnings`, `20260731210000_moderation_and_roles`)
  applied cleanly to an empty database via `reset-database.ps1` (down -v, up,
  migrate deploy).
- **Seed**: runs cleanly and is idempotent — verified by running it twice in
  a row with no errors and no duplicate rows (`artifacts/db-verification.md`,
  upsert-keyed on fixed ids/usernames throughout `prisma/seed.ts`).
- **Unit + integration tests**: 72/72 passed, 0 skipped — the 4 previously
  gated `RUN_DB_TESTS` tests now genuinely run and pass every time (verified
  across 3 separate runs during this pass, including one deliberate rerun to
  rule out a flake).
- **Playwright**: 50/50 passed across desktop + Pixel 7 (all specs, including
  the previously-DB-blocked auth/watchZones/follow/upload/alerts/admin
  suites).
- **Production build**: clean.
- **Production-route smoke test**: all 6 checked routes (`/`, `/feed`,
  `/alerts`, `/space-weather`, `/sign-in`, `/sign-up`) returned 200 against
  `next start`.
- **`npm audit --audit-level=high`**: clean.
- **Lighthouse baseline**: written to `docs/performance/lighthouse-baseline.json`.

## Final screenshots

`preview-screenshots/final/{desktop,mobile}/` (16 screenshots each, desktop
at 1440×1000, mobile at Pixel 7's viewport) plus
`desktop-contact-sheet.png`, `mobile-contact-sheet.png`, and
`combined-contact-sheet.png` in `preview-screenshots/final/`. Also copied to
`~/Desktop/El-Nino-Final-Visuals/`.

Covers every primary route (globe, feed, sign-in, sign-up, alerts,
space-weather, profile, upload, public profile) in both signed-out and
signed-in states, plus interaction states (profile edit in progress, Watch
Zone creation form, Watch Zone list with a real saved zone, the globe showing
a real Watch Zone point marker, and the post-sign-out state). This is real
data from a real signed-up account against the live database — not the
partial/degraded-mode captures from the earlier infrastructure-handoff pass.

## What's still not covered

- Admin/moderator views (`/admin/moderation`, the feed's Report control in
  its "submitted" state) — no moderator-role account was created for the
  screenshot pass. The route and its access control are covered by
  `e2e/spaceWeatherAndAdmin.spec.ts` (which does pass), just not in the
  visual package.
- CI (`​.github/workflows/ci.yml`) is still inert — no GitHub remote exists,
  nothing was pushed. It's expected to work (it mirrors the now-verified
  local flow almost exactly — Postgres service container, migrate, seed,
  same test commands) but has not itself executed anywhere.
- Deployment (`docs/DEPLOYMENT.md`) remains documentation only — nothing
  provisioned, per instruction.
