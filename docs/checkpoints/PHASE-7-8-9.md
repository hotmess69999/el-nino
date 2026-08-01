# Phase 7-9 checkpoint — Space weather, moderation/admin, hardening

Status: **implemented at the scope described below; not verified against a live
database.** Same standing constraint as every DB-backed phase in this project —
no PostgreSQL instance is reachable in this sandbox (see ADR 0004 "Why not run
in this pass"). This checkpoint does not claim production readiness.

## Phase 7 — Space weather

Real, scoped-down slice: one deterministic fixture adapter
(`src/lib/spaceWeather/localAdapter.ts`), `/space-weather` route, linked from
Alerts. Distinguishes observed/forecast, shows confidence and source, never
implies aurora visibility is guaranteed. No DB persistence — deferred until
Watch Zone aurora-alert matching (section 13's "Allow Watch Zones to receive
relevant aurora or disruption alerts") needs a queryable table; the
`space-weather` category is already a valid Watch Zone category, so that wiring
is additive, not a redesign, when it happens.

## Phase 8 — Trust, moderation and admin

`UserRole` (`user`/`moderator`/`admin`) added as a Better Auth field, kept
strictly separate from `VerificationType` (public trust badge, not an access
grant — see `docs/SECURITY.md`). `ModerationReport` model + service
(file/list/resolve), `/admin/moderation` queue, role-checked server-side on
every request and action (not just route-gated), `notFound()` for unauthorised
access rather than a 403.

**Closed in a follow-up commit** (`028d363`): the feed now has a Report control
(`src/components/feed/ReportButton.tsx`) with an inline reason picker.
`prisma/seed.ts` seeds one real DB `Report` row per feed seed event
(`seed-report-<eventId>`) so the button has a genuine foreign-key target
instead of a dangling seed-event id — `src/lib/feed/reports.ts`'s new
`reportId` field carries that mapping. Splitting `MODERATION_REASONS` into a
pure `src/lib/moderation/reasons.ts` (no Prisma import) was required after the
client bundle build initially failed pulling `node:module` in via
`service.ts` → `db/client.ts` → `pg` — same fix pattern already used for
`warnings/matching.ts` and `moderation/roles.ts`.

## Phase 9 — Hardening (partial — see gaps below)

- `docs/SECURITY.md` — threat model summary, access-control inventory, and an
  explicit "known gaps" section (rate limiting, CSRF verification, real file
  content validation, no CI pipeline yet).
- Visual package: `preview-screenshots/final/{desktop,mobile}/` (also copied to
  `~/Desktop/El-Nino-Final-Visuals/`) — 8 routes × 2 viewports = 16 screenshots,
  covering every route that renders without a database (globe, feed, sign-in,
  sign-up, profile-signed-out, upload-signed-out, alerts, space-weather).
  **Not included**: combined desktop/mobile/contact-sheet montages (the
  Definition of Done asks for these) — no image-compositing tool is wired into
  this project yet (Sharp is listed in `package.json`'s `overrides` for a
  transitive CVE fix only, never installed as a direct, usable dependency; see
  `docs/dependency-security-log.md`). Individual screenshots are real; the
  montage step is a genuine gap, not faked.
  **Also not included**: any signed-in state (Watch Zone management, own
  profile with data, moderation queue, admin views) — all require a live
  database session, which this sandbox cannot provide. The `alerts.png`
  screenshot genuinely shows the degraded-mode fallback (see PHASE-5-6.md's
  "Regression caught and fixed"), not a real empty-warnings state.

### Not attempted in Phase 9

- CI pipeline (lint/typecheck/test/build/security-scan on push) — no CI
  provider is configured for this repository.
- Backup/restore, disaster-recovery, deployment environments — none exist yet;
  this project has never been deployed anywhere.
- Rate limiting, container scanning, full accessibility audit (automated tools
  like `axe-playwright` were flagged as worth adding back in the Phase 3
  checkpoint and still aren't installed).
- Production checklist (master prompt Appendix C) — most items require a real
  deployment target or live database and are unchecked; not filled in
  dishonestly here.

## Test, lint, build evidence

`npx tsc --noEmit`, `npm run lint`, `npm run build` all clean after every
change in this batch. Unit tests: 67 passed, 4 correctly skipped (DB
integration tests, gated behind `RUN_DB_TESTS=1`). Playwright: 18/18 tests that
don't need a database pass (16 pre-Phase-4 tests + the new space-weather
smoke test); 7 DB-dependent tests (auth, watch zones ×2, follow, upload,
alerts, admin-role-check) fail on connection-refused, exactly as expected.

## Rollback/recovery notes

All three phases are additive (new tables, new routes, one new Better Auth
field) — reverting means dropping migration
`20260731210000_moderation_and_roles` and the relevant commits; nothing in
Phases 0-6 is touched.

## Infrastructure handoff (this environment cannot run Docker/Postgres)

Confirmed again directly in this pass (`docker --version` → command not found)
— no Docker, therefore no Postgres, therefore none of the DB-backed
verification below has been executed. Everything needed to finish it on a
machine that *does* have Docker was prepared instead:

- **`docker-compose.yml`** — added a `pg_isready` healthcheck to the
  `postgres` service so scripts can wait for real readiness, not just "the
  container process started."
- **Five PowerShell scripts** (`scripts/setup-phase9.ps1`,
  `start-database.ps1`, `reset-database.ps1`, `verify-database.ps1`,
  `run-final-checks.ps1`) — syntax-validated with PowerShell's own parser
  (`[System.Management.Automation.Language.Parser]::ParseFile`, all five
  clean) since this sandbox has no Docker to actually execute them against.
  `setup-phase9.ps1` is the one-command entry point: checks Docker,
  starts/waits on Postgres, applies migrations, seeds, runs the DB
  integration tests, prints a clear pass/fail summary. `run-final-checks.ps1`
  runs the complete Phase 9 quality gate (lint, typecheck, all tests with
  `RUN_DB_TESTS=1`, a full clean-migration+seed+idempotency cycle, the full
  Playwright suite, production build, a production-route smoke test,
  `npm audit`, and a best-effort Lighthouse baseline) and prints one final
  summary table — it does not stop at the first failure, so one broken step
  never hides the status of the rest.
- **`.github/workflows/ci.yml`** — full CI (Postgres service container,
  migrate, seed, lint, typecheck, tests with `RUN_DB_TESTS=1`, Playwright
  with failed-trace-only artifact retention, build, `npm audit`). Inert until
  this branch is pushed to a real GitHub repository — no remote is
  configured and none was created or pushed to by this change. GitHub
  Actions activates automatically on first push; no separate registration
  step exists.
- **`docs/DEPLOYMENT.md`** — provider-neutral: required env vars, Postgres/
  object-storage/media-processing requirements, persistent vs. ephemeral
  storage, migration/rollback/backup procedure, health-check gap (none
  exists yet — flagged, not built, since it needs a decision about where it
  lives), security-header gap, one illustrative (not provisioned, not
  chosen) container-based architecture diagram.

**The exact command to run from `C:\Users\jasmi\el-nino`** (on the actual
checkout, or this worktree — either has the same scripts) to pick up where
this pass left off:

```
powershell -ExecutionPolicy Bypass -File scripts\setup-phase9.ps1; if ($LASTEXITCODE -eq 0) { powershell -ExecutionPolicy Bypass -File scripts\run-final-checks.ps1 }
```

This is one line so it can be pasted as-is: it runs the database bring-up
first, and only proceeds to the full quality gate if that succeeds.

## Explicitly not done — do not treat as complete

Per instruction, the four skipped/gated DB tests
(`src/lib/db/integration.test.ts`, gated behind `RUN_DB_TESTS`) were **not**
un-gated — they have not been proven to pass against real Postgres in this
pass, only reasoned about and exercised against nothing. The final desktop/
Pixel-7 screenshot package, contact sheets, CI activation, deployment
provisioning, and Lighthouse baseline are all likewise **not done** — they
require the command above to be run somewhere Docker exists. This project is
not complete until that happens and every check in `run-final-checks.ps1`
passes for real.
