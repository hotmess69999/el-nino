# Deployment

Provider-neutral. No provider has been chosen or provisioned — this documents
what any deployment target needs, plus one practical example architecture for
illustration. Nothing here has been executed; this project has never been
deployed anywhere (see `docs/checkpoints/PHASE-7-8-9.md`).

## Required environment variables

See `.env.example` for the full list and `docs/ENVIRONMENT.md` for what each
variable is for and which phase activated it. At minimum for the features
implemented so far (Phases 0-9 as scoped in this repo):

- `APP_ENV`, `APP_BASE_URL`
- `DATABASE_URL` — PostgreSQL connection string (see below)
- `AUTH_SECRET` — a real, random, environment-specific value (never reused
  across dev/staging/production, per `docs/ENVIRONMENT.md`'s rules)
- `NEXT_TELEMETRY_DISABLED=1`

Not yet required (no code reads them): `REDIS_URL`, `OBJECT_STORAGE_*`,
`WEATHER_PROVIDER_*`, `SPACE_WEATHER_PROVIDER`, `MAP_STYLE_URL`/`MAP_TILE_TOKEN`,
`PUSH_*`, `SENTRY_DSN`, `POSTHOG_KEY` — reserved for later phases per
`docs/ENVIRONMENT.md`; don't provision infrastructure for these until code
actually reads them.

## PostgreSQL requirements

- PostgreSQL 16+ (matches `docker-compose.yml`'s `postgres:16-alpine`).
- A managed instance (or self-hosted with your own backup discipline) — this
  project stores real user data (accounts, Watch Zones, uploaded report
  metadata) as of Phase 4, not disposable cache data.
- Connection pooling is not yet configured at the application layer — a
  managed Postgres with built-in pooling (e.g. PgBouncer in front of it) is
  safer than pointing `DATABASE_URL` directly at a small instance under load.
- No PostGIS extension is required yet (see ADR 0004 — Watch Zones and
  warnings are point+radius, not geometry columns).

## Object-storage requirements

Not yet required by any implemented feature. `src/lib/storage/local.ts`
writes uploads to local disk (`public/uploads/`, gitignored) — this does
**not** survive a redeploy on most container platforms (ephemeral filesystem)
and does **not** scale past one instance. Before deploying anywhere with more
than one instance or an ephemeral filesystem, replace `local.ts` with an
S3-compatible client behind the same `putObject` interface — this was
designed as a swap point for exactly this reason (see
`docs/checkpoints/PHASE-5-6.md`).

## Media-processing requirements

None yet — Phase 5 deliberately shipped the smallest working upload pipeline
(no FFmpeg/transcoding/derivatives). Add processing infrastructure only when
a deployment target's real upload volume justifies it, per the project's
standing "add only when genuinely required" policy.

## Persistent vs. ephemeral storage

| Data | Persistence needed |
| --- | --- |
| PostgreSQL data | Persistent, backed up |
| Uploaded media (`public/uploads/`) | Persistent — **not** currently object storage; see above |
| `.next/` build output | Ephemeral, rebuilt per deploy |
| Playwright/test artifacts | Ephemeral, CI-only |

## Migration procedure

1. `npx prisma migrate deploy` — applies pending migrations non-interactively,
   never prompts, never resets data. This is the only migration command that
   should run against a production database (never `migrate dev`, which can
   prompt to reset on drift).
2. Run this as a pre-deploy step (before the new application version starts
   serving traffic), not as part of application boot — a crash-looping
   container must not repeatedly attempt migrations.
3. Every migration in `prisma/migrations/` is forward-only in this project so
   far; none have been tested with a rollback script. Before a schema change
   ships to a real production database, write and test a corresponding down
   migration or a documented manual remediation — none exist yet because no
   migration has run against a real database at all (see "Why not run in this
   pass" in ADR 0004).

## Seed restrictions in production

`prisma/seed.ts` creates clearly-fictional demo users, Watch Zones, and
report rows. **Never run `prisma db seed` against a production database** —
it has no environment guard today. Before this is safe to wire into any
automated production pipeline, add an explicit `APP_ENV !== "production"`
check at the top of `prisma/seed.ts`; not present yet since no deployment
pipeline exists to accidentally trigger it.

## Health checks

No `/api/health` route exists yet. Before deploying behind a load balancer or
container orchestrator that needs one, add a minimal route that checks
`DATABASE_URL` connectivity (a cheap `SELECT 1`) and returns 200/503
accordingly — don't reuse a page route for this, since page routes may
render successfully even when the database is down (see the Phase 6
degraded-mode fallback in `src/app/alerts/page.tsx`, which is deliberately
designed to stay up without the database).

## Rollback procedure

Not yet exercised. General shape for whatever platform is chosen:

1. Redeploy the previous immutable build artifact/container image.
2. Only run `prisma migrate deploy` forward — do not attempt to auto-revert a
   migration in production. If the new schema is incompatible with the old
   code, the rollback must happen *before* running any new migration, not
   after.
3. Confirm health checks and the production-route smoke test (see
   `scripts/run-final-checks.ps1`) pass against the rolled-back version.

## Backup requirements

Not yet configured. At minimum before real user data exists in production:
automated daily PostgreSQL backups with a tested restore procedure, and a
documented retention period. Uploaded media needs the same treatment once it
moves to object storage.

## Logging and monitoring

`SENTRY_DSN` and `POSTHOG_KEY` are reserved in `.env.example` but no code
reads them yet — per `docs/ENVIRONMENT.md`, these should only be wired up
after consent/retention rules are defined (section 26 of the master prompt),
which hasn't happened. Structured server logs currently go to stdout only
(Next.js default); no correlation IDs, no queue-depth/freshness metrics exist
yet since there's no queue or ingestion worker in this codebase.

## Security headers

Not yet configured in `next.config.ts`/middleware — no Content-Security-Policy,
`Strict-Transport-Security`, `X-Frame-Options`, or CORS restriction has been
added. This is a genuine gap for production readiness, tracked alongside the
other items in `docs/SECURITY.md`'s "Known gaps."

## Domain and HTTPS requirements

Whatever platform is chosen must terminate TLS (HTTPS) before traffic reaches
the app — Better Auth's session cookies are not configured with `Secure`-only
enforcement disabled, so they rely on being served over HTTPS in any
non-`localhost` environment. `APP_BASE_URL` must match the real public URL
exactly (used by Better Auth for callback/redirect construction).

## Example deployment architecture (illustrative, not provisioned)

One practical, portable path — not chosen or set up, just illustrative of how
the pieces fit together on *any* container-capable host (a VPS running Docker
Compose, or any managed container platform):

```
                        ┌─────────────────────┐
   HTTPS (TLS term.) →  │  Next.js container   │  ← this repo's `next build`
                        │  (Node 22 runtime)    │     output, run via `next start`
                        └──────────┬───────────┘
                                   │
                     ┌─────────────┼─────────────┐
                     ▼                           ▼
           ┌──────────────────┐        ┌──────────────────┐
           │ Managed Postgres  │        │ S3-compatible     │
           │ (backups enabled) │        │ object storage     │
           └──────────────────┘        │ (once local.ts is  │
                                        │  swapped out)       │
                                        └──────────────────┘
```

This architecture is deliberately generic — nothing here depends on a
specific vendor's proprietary APIs beyond the S3-compatible object-storage
interface (which most providers implement). Choosing an actual host, region,
and pricing tier needs explicit approval before anything is provisioned.
