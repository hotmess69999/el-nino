# ADR 0004: Database and ORM for Phase 4 — confirm Prisma + PostgreSQL

## Status

Accepted (2026-07-31)

## Context

ADR 0002 already selected Prisma + PostgreSQL for the project's eventual data layer,
before any schema existed. Phase 4 (`docs/checkpoints/PHASE-4-PLAN.md`) is the first
phase that actually needs a database, so this ADR confirms that choice against
Phase 4's real requirements rather than the abstract ones ADR 0002 was written
against, and records the concrete decisions ADR 0002 left open (driver adapter,
geospatial approach, migration workflow).

## Options compared

Per instruction, only the two options genuinely relevant to this project: **Postgres
+ Prisma** (already installed — `@prisma/client`/`prisma` are in `package.json`) vs.
**Postgres + Drizzle**. Both would run on the same `docker-compose.yml` Postgres
service; the database itself was not reconsidered — Postgres has been the assumed
target since ADR 0002, `docker-compose.yml`, and `.env.example`'s `DATABASE_URL` all
predate this decision and nothing about Phase 4's requirements argues against it.

| Criterion | Prisma | Drizzle |
| --- | --- | --- |
| Already installed | Yes — `@prisma/client`/`prisma` in `package.json` since before Phase 4 | No — would be a new dependency |
| Migration workflow | `prisma migrate dev`/`deploy`, generates SQL migration files, tracks history in `_prisma_migrations` | `drizzle-kit push`/`generate`, comparable but a smaller/newer toolchain |
| Type safety | Generated client, fully typed queries/results from the schema | Also fully typed, arguably closer to raw SQL types |
| Auth integration | Better Auth ships a first-party Prisma adapter (`better-auth/adapters/prisma`) | Better Auth ships a first-party Drizzle adapter too — roughly even |
| Geospatial (Phase 4 needs) | Phase 4's Watch Zones are point + radius (`Float` lat/lon/radiusKm) — no PostGIS column needed yet; Prisma's known PostGIS friction (ADR 0002) doesn't apply this phase | Same — Drizzle has no particular geospatial advantage for a scalar point+radius model |
| Testability | Standard Prisma Client against a real Postgres; no in-memory/SQLite fallback for either | Same constraint applies to Drizzle |
| Deployment complexity | Prisma 7 requires a driver adapter (`@prisma/adapter-pg` + `pg`) passed to the client — one extra dependency pair, otherwise unchanged | Drizzle always requires its own driver package — comparable |
| Dependency/build impact | Adds `@prisma/adapter-pg` + `pg` (Prisma 7's new client-config model no longer accepts a schema-file `url`) | Would add `drizzle-orm` + `drizzle-kit` + `pg`, replacing all of the above |

## Decision

**Keep Prisma.** No concrete technical reason surfaced that it can't adequately
support the Phase 4 data model (User/Account/Session/Verification/Follow/WatchZone/
UserPreference — see `prisma/schema.prisma`), and it was already installed before
this decision was reconsidered. Switching to Drizzle now would be a net-new
dependency and a rewritten migration/query layer to solve a geospatial problem
Phase 4 doesn't actually have yet (point + radius, not polygons).

## Prisma 7 concrete decisions (not covered by ADR 0002)

- **Driver adapter required.** Prisma 7's client-config model removed the
  schema-file `datasource.url` — `prisma validate` fails with `P1012` if it's
  present. The client now takes an adapter instance
  (`new PrismaPg({ connectionString })` from `@prisma/adapter-pg`, wired in
  `src/lib/db/client.ts`). `pg` and `@prisma/adapter-pg` were added and reviewed
  through the dependency-security process (`docs/dependency-security-log.md`).
- **Generator**: `provider = "prisma-client"` (Prisma 7's new ESM client), output to
  `src/generated/prisma` — gitignored (`prisma init` added this) and excluded from
  ESLint, since it's regenerated via `prisma generate` and shouldn't be hand-edited
  or linted as project source.
- **Seeding**: `prisma db seed` needs a TS runner. Node's built-in
  `--experimental-strip-types` can't run Prisma's generated client directly — its
  internal relative imports are extensionless (bundler-resolution style, not raw
  Node ESM), confirmed by testing it directly and hitting `ERR_MODULE_NOT_FOUND`.
  `tsx` was added (reviewed, see dependency-security-log) and wired as
  `migrations.seed` in `prisma.config.ts`.

## Geospatial limitations

Phase 4's Watch Zones are stored as `latitude`/`longitude`/`radiusKm` scalar
columns, **not** a PostGIS `geometry` column — see `prisma/schema.prisma`'s
`WatchZone` model and `docs/checkpoints/PHASE-4-PLAN.md`. This is deliberate, not
deferred-by-accident:

- Phase 4 explicitly excludes drawn polygon Watch Zones (gated on the unresolved
  GeoJSON/MapLibre worker issue, `docs/investigations/MAPLIBRE-GEOJSON.md`) — a
  point + radius model has no polygon to store, so PostGIS's main advantage
  (precise geometry operations) isn't needed yet.
- Radius/bounding-box matching (e.g. "which Watch Zones contain this warning
  point") can be done with a simple bounding-box pre-filter in SQL
  (`latitude BETWEEN ... AND longitude BETWEEN ...`) followed by an application-level
  haversine distance check — adequate at Phase 4's scale, no PostGIS extension
  required.
- **Future PostGIS support**: when Phase 6 (Localised warnings, official warning
  polygons) or a later Watch-Zone-polygon feature needs real geometry, ADR 0002's
  approach still applies — a `geometry` column accessed via
  `Unsupported("geometry")` and raw SQL (`$queryRaw`) for point-in-polygon/distance
  operators, isolated behind the map-geospatial-engineer skill's boundaries. This
  ADR doesn't need to be revisited for that; ADR 0002 already covers it.

## Migration strategy

`prisma migrate dev` generates timestamped SQL migration files under
`prisma/migrations/`, committed to version control (`prisma/migrations/20260731190000_init/migration.sql`
is Phase 4's initial schema). Production applies migrations with
`prisma migrate deploy` (no interactive prompts, no schema-drift resolution) — not
yet wired into a deployment pipeline, since none exists yet at Phase 4.

## Why not run in this pass

No PostgreSQL instance is reachable in the sandbox this phase was implemented in —
no `docker` binary, no local Postgres install, and `prisma dev` (Prisma's embedded
local-Postgres dev server) requires downloading `@prisma/cli-dev` at runtime, which
the install-security guard's `--allow-scripts` restriction blocks. This was
confirmed directly (`npx prisma dev` fails with `EALLOWSCRIPTS`, `npx prisma migrate
dev` fails with `P1001: Can't reach database server at localhost:5432`), not assumed.
The schema was still fully validated (`prisma validate`, `prisma generate` both
succeed), and the migration SQL was generated via `prisma migrate diff --from-empty`
against the schema (not a live DB) and committed as the initial migration. Real
migration/seed/e2e execution against a live database is a genuine gap — see the
Phase 4 completion report for what to run locally to close it.

## Conditions that would justify revisiting this decision

- Point + radius Watch Zones prove insufficient before Phase 6 (e.g. product wants
  drawn zone boundaries sooner than the GeoJSON/MapLibre gate resolves) — revisit
  whether Prisma's `Unsupported("geometry")` + raw-SQL pattern is worth adopting
  early, per ADR 0002's exit strategy, rather than switching ORMs.
- Prisma's driver-adapter model or generated-client output path changes again in a
  way that meaningfully increases build/dependency complexity beyond what's
  documented here.
- Measured raw-SQL geospatial query cost under Prisma becomes a real maintenance
  burden once Phase 6+ actually needs polygon operations — ADR 0002's own exit
  strategy already anticipates this.
