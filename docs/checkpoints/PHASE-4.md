# Phase 4 checkpoint — Auth, profiles & Watch Zones

Status: **implemented, not verified end-to-end against a live database.** See
"What wasn't verified" below before treating this as production-ready.

## What was built

- **Database**: `prisma/schema.prisma` (User/Session/Account/Verification — Better
  Auth's tables — plus Follow, WatchZone, UserPreference). Initial migration at
  `prisma/migrations/20260731190000_init/`. See `docs/DATABASE.md` and ADR 0004.
- **Auth**: Better Auth wired up (`src/lib/auth/server.ts`, `src/lib/auth/client.ts`,
  `src/app/api/auth/[...all]/route.ts`) — email/password sign-up/in/out, session
  restoration via `src/lib/auth/session.ts`. `/sign-up`, `/sign-in` pages.
- **Profiles**: `/profile` (own, edit-in-place) and `/users/[handle]` (public, no
  private fields). `src/lib/users/service.ts` enforces a public-safe field
  allowlist (never returns email).
- **Follows**: follow/unfollow with a DB-level unique constraint plus an
  application-level upsert, so double-following is a no-op, not an error.
  Follower/following counts shown on both profile views.
- **Watch Zones**: full CRUD (`src/lib/watchZones/service.ts` + `src/lib/actions/
  watchZones.ts`), point + radius model (no drawn polygon — gated per
  `docs/investigations/MAPLIBRE-GEOJSON.md`), ownership-checked server-side on
  every mutation. Shown as an accessible list on `/profile` and as plain point
  markers on the globe (`src/components/map/GlobeMap.tsx`'s `watchZones` prop) —
  never a raster circle implying a precision the model doesn't have.
- **User preferences**: `src/lib/preferences/service.ts` — autoplay, muted
  playback, reduced data, localised warnings, distance unit, timezone. Upserted
  lazily; no row required until first write.
- **Security**: ownership checks on every Watch Zone/profile mutation
  (`assertOwnedZone` throws rather than silently no-op-ing on a mismatched
  owner), username normalization/validation, unique constraints on
  email/username/follow-pair, Better Auth's own session-cookie/CSRF handling,
  public-profile queries never select `email`.

## Dependencies added

`better-auth@1.6.25`, `pg@8.22.0`, `@prisma/adapter-pg@7.9.1` (runtime);
`tsx@4.23.1` (dev, for `prisma db seed`). All reviewed through the
install-security guard and recorded in `security/approved-packages.json` and
`docs/dependency-security-log.md`.

## Tests

- Unit (`npx vitest run`): validation logic for Watch Zones and profile edits
  (`src/lib/watchZones/validation.test.ts`, `src/lib/users/validation.test.ts`) —
  pure functions, no DB needed, all passing.
- Integration (`src/lib/db/integration.test.ts`): schema constraints, ownership
  enforcement, follow uniqueness, preference persistence — gated behind
  `RUN_DB_TESTS=1` + `DATABASE_URL`, **skipped in this pass** (no reachable
  Postgres — see below).
- Playwright (`e2e/auth.spec.ts`, `e2e/watchZones.spec.ts`, `e2e/follow.spec.ts`):
  sign-up/in/out, profile editing, Watch Zone create/edit/pause/delete/validation,
  follow/unfollow across two browser contexts. **Written and confirmed to parse
  and list correctly (`playwright test --list`), not executed** — the dev server
  they run against needs the same live database.

## What wasn't verified (genuine blocker, not glossed over)

No PostgreSQL instance was reachable in this sandbox: no `docker` binary, no local
Postgres install, and `prisma dev`'s embedded local-Postgres server requires
downloading `@prisma/cli-dev` at runtime, which the install-security guard's
script-execution restriction blocks (confirmed directly, not assumed — see ADR
0004 "Why not run in this pass"). As a result, none of the following were actually
executed:

- `prisma migrate dev` against a real database (the migration SQL was generated
  and validated via `prisma migrate diff --from-empty`, and `prisma generate`/
  `prisma validate` both succeed, but the migration has never actually been
  applied to a live Postgres).
- `prisma db seed` (the script itself runs and reaches the DB-connection step
  cleanly — confirmed it fails with `ECONNREFUSED`, not a code error — but never
  completes).
- The DB integration tests and the three new Playwright specs.
- Any production-route smoke test that touches the database (sign-up, profile
  edit, Watch Zone CRUD, follow).

**To close this gap**, from a machine with Docker or a local Postgres:

```
docker compose up -d postgres
cp .env.example .env   # AUTH_SECRET can be any random string for local dev
npm run db:migrate
npm run db:seed
RUN_DB_TESTS=1 DATABASE_URL=postgresql://el_nino:el_nino@localhost:5432/el_nino npx vitest run src/lib/db/integration.test.ts
npx playwright test e2e/auth.spec.ts e2e/watchZones.spec.ts e2e/follow.spec.ts
```

What **was** verified without a database: `npx tsc --noEmit` (clean), `npm run
lint` (clean), `npx vitest run` (52 passed, 4 correctly skipped), `npm run build`
(clean production build, Turbopack — auth/profile/users routes correctly render as
dynamic `ƒ` routes, not statically prerendered), and the full pre-existing
Playwright suite (30/30, unaffected by these changes).

## Explicitly deferred (per the plan)

Uploads, FFmpeg processing, BullMQ, Socket.io, live weather APIs, comments
backend, notification delivery, recommendation systems, warning polygons, vector
Watch Zone boundaries, production email infrastructure, social sign-in providers —
none of these were started, matching `docs/checkpoints/PHASE-4-PLAN.md`.

## Visual checkpoints

`preview-screenshots/phase-4/{desktop,mobile}/` (also copied to
`~/Desktop/El-Nino-Visual-Preview/Phase-4/`):

- **Checkpoint A (partial)**: `sign-in.png`, `sign-up.png`, `profile-signed-out.png`
  — the three screens that render without a database. All confirmed correct on
  inspection (forms render with all labelled fields; `/profile` correctly falls
  back to the sign-in form when signed out).
- **Checkpoint B (not captured)**: Watch Zone management needs a signed-in session
  with real data, which needs a live database. A first attempt included a
  `/users/nonexistent-handle` 404 screenshot, but that page hits the database
  before the not-found check runs, so it actually captured a Next.js error
  overlay, not a real 404 state — removed rather than kept as a misleading
  screenshot.

## Next steps

1. Run the verification commands above on a machine with Postgres available;
   fix anything that surfaces (the schema/code were validated as far as possible
   without a live DB, but a first real migration run is the actual proof).
2. Capture Checkpoint B (Watch Zone management, create/edit/pause/delete, desktop
   + Pixel 7) once signed in against a live database with seeded data.
3. Consider Phase 6's warning-matching logic against the bounding-box + haversine
   approach noted in ADR 0004 before assuming it scales.
