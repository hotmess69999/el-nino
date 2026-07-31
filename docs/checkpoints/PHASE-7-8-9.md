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

**Known gap, not silently omitted**: there is no "Report" button in the
consumer feed UI yet to actually file a `ModerationReport` — the feed still only
renders seed events (`src/lib/feed/reports.ts`), not the DB-backed `Report`
model from Phase 5. The service/action layer is complete and tested; wiring a
report-filing control into the feed UI is the next piece, not done here to keep
this batch bounded.

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

## Next executable scope

1. Run every phase's DB verification commands (`docs/checkpoints/PHASE-4.md`,
   `PHASE-5-6.md`) against a real Postgres instance — this is the single
   biggest gap across the whole Phases 4-9 batch.
2. Wire a report-filing control into the feed UI (Phase 8's known gap).
3. Decide on and stand up a real CI pipeline and deployment target before
   treating any "production checklist" item as actionable.
4. Add an image-compositing step (or a manual process) for the contact-sheet
   deliverable once signed-in states can actually be captured.
