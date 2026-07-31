# Phase 5-6 checkpoint — Upload/media pipeline & localised warnings

Status: **implemented, not verified end-to-end against a live database** — same
constraint as Phase 4 (see `docs/checkpoints/PHASE-4.md`, ADR 0004 "Why not run in
this pass"). No new dependencies were added; no new database/infra decision needed.

## Scope completed

**Phase 5 — smallest working upload pipeline**, not the full spec's resumable
chunked upload/transcoding pipeline:
- `Report` + `MediaAsset` Prisma models (migration
  `prisma/migrations/20260731200000_reports_and_warnings/`).
- `src/lib/storage/local.ts` — a storage abstraction (`putObject`) writing to
  `public/uploads/` (gitignored) — swap for an S3-compatible client later without
  touching callers.
- `src/lib/uploads/service.ts` — validate, store, publish. Location is fuzzed to
  ~1.1km precision (`fuzzCoordinate`, two-decimal rounding) before it's ever
  persisted — the exact submitted point is never stored, not just never displayed.
- `/upload` — real form (file, category, caption, location + "use current
  location"), sign-in gated like `/profile`.

**Phase 6 — provider-neutral warning model + one controlled adapter**:
- `OfficialWarning` Prisma model, same migration.
- `src/lib/warnings/localAdapter.ts` — one deterministic fixture adapter (no real
  provider credentials exist in this environment). Shaped exactly like a real
  adapter's output so a future real provider only means a new adapter file.
- `src/lib/warnings/matching.ts` — pure haversine point-radius matching (no DB
  import, unit-testable) — same bounding-box-not-PostGIS approach as Watch Zones.
- `src/lib/warnings/service.ts` — idempotent `ingestWarnings` (upsert by
  `providerId`+`providerWarningId`, never duplicates), `listActiveWarnings`,
  `listWarningsForWatchZones`.
- `/alerts` — real, replacing the placeholder. Warnings visually distinct from
  community content (red-bordered "Official" badge, never shared wording with
  reports). Degrades to an honest "temporarily unavailable" state on a
  provider/DB failure rather than crashing the route (section 23) — this was
  caught and fixed during this pass, see "Regression caught" below.

## Existing code reused

Ownership-check pattern, server-action + validation-result shape, and CSS module
conventions all reused from Phase 4 (`src/lib/watchZones/`, `src/lib/actions/`) —
no new architectural pattern introduced.

## Schema, API and dependency changes

Two new Prisma models plus `ReportStatus` enum; no new npm packages. Server
actions (`src/lib/actions/upload.ts`) follow the same pattern as Phase 4's.

## Test, accessibility and migration evidence

- Unit: `src/lib/uploads/validation.test.ts`, `src/lib/warnings/matching.test.ts`
  — pure functions, no DB, all passing.
- Playwright: `e2e/upload.spec.ts`, `e2e/alerts.spec.ts` added (parse/list
  correctly, need a live DB to execute — same limitation as Phase 4's specs).
- Full suite run: 16/16 pre-existing tests still pass; 6 new DB-dependent tests
  fail on connection-refused, exactly as expected without Postgres.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean.
- Migration SQL generated via schema diff (not a live `prisma migrate dev`), same
  as Phase 4 — not applied to a real database in this pass.

### Regression caught and fixed

Making `/alerts` DB-backed initially broke `e2e/nav.spec.ts`'s existing "navigates
to Alerts" test — the route threw an unhandled error on DB connection failure,
crashing the whole page (no nav shell rendered at all) instead of degrading. Wrapped
the warnings fetch in a try/catch that renders an honest "temporarily unavailable"
state, per section 23's resilience requirement. Confirmed fixed by rerunning the
full suite: the pre-existing nav test passes again.

## Known limitations and gated features

- Upload is single-shot, not resumable/chunked — the master prompt's full
  10-step pipeline (chunked upload, container/codec inspection, transcoding,
  duplicate/privacy-risk checks) is not implemented. Reports publish immediately
  after basic validation; `processing`/`rejected` `ReportStatus` values exist in
  the schema for a future async step to use, not currently reachable.
- No FFmpeg/Sharp/BullMQ/object-storage infrastructure added — none was genuinely
  required yet for a single-shot local-disk upload, per "add only when the
  functioning implementation genuinely requires them."
- Uploaded reports are not yet wired into the vertical feed (`src/lib/feed/
  reports.ts` still only serves the seed events) — connecting them is separate
  scope, not attempted here to keep this batch bounded.
- The warning fixture's timestamps are anchored to a fixed reference date
  (2026-07-31); it will eventually read as permanently expired to a real clock
  and needs updating (or a relative-to-now generator) before this stops being a
  purely local dev/test fixture.
- Warning-to-Watch-Zone matching runs in application code on every request (no
  caching/precomputed match table) — fine at this data volume, called out in the
  master prompt as an acceptable Phase 6 starting point.

## Rollback/recovery notes

Both features are additive (new tables, new routes) — reverting means dropping the
`20260731200000_reports_and_warnings` migration and its commit; no existing Phase
0-4 data or route is touched.

## Next executable scope

Phases 7-9 per the master prompt's batching policy (space weather; trust/
moderation/admin; production hardening) — after this batch's database work is
actually verified against a live Postgres instance (see the verification commands
in `docs/checkpoints/PHASE-4.md`, which apply unchanged here).
