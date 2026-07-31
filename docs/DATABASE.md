# Database schema

Source of truth: `prisma/schema.prisma`. This is a summary, not a duplicate — read
the schema file for exact field types/defaults.

See `docs/decisions/0002-orm-choice.md` and `docs/decisions/0004-database-and-orm.md`
for why Prisma + PostgreSQL, and the Prisma 7 driver-adapter/generator specifics.

## Models

- **User** — `id`, `email` (unique), `emailVerified`, `name` (Better Auth's core
  display-name field — exposed to the app as `displayName`, see
  `src/lib/users/service.ts`), `username` (unique), `image`, `bio`,
  `verificationType` (`none`/`meteorologist`/`emergency_service`/`media`),
  `weatherScore`. Never expose `email` from a public-facing query — see
  `PUBLIC_PROFILE_SELECT` in `src/lib/users/service.ts`.
- **Session**, **Account**, **Verification** — Better Auth's required tables
  (email/password provider). Field shapes follow Better Auth's Prisma adapter
  contract; don't rename without checking `better-auth/adapters/prisma` first.
- **Follow** — `followerId`/`followingId`, unique on the pair (prevents duplicate
  follows at the DB level; `src/lib/follows/service.ts` also upserts so a repeat
  follow call is a no-op rather than an error).
- **WatchZone** — point + radius (`latitude`/`longitude`/`radiusKm`), not a
  geometry column — see ADR 0004 "Geospatial limitations". `categories` is a
  Postgres text array validated against `EVENT_CATEGORIES`
  (`src/lib/map/categories.ts`) in the application layer, not a DB enum, so adding
  a category doesn't require a migration.
- **UserPreference** — one row per user (`userId` is the primary key), created
  lazily on first write (`src/lib/preferences/service.ts` upserts); a user with no
  row yet gets sensible defaults from `getPreferences`, not a missing-row error.

## Migrations

`prisma/migrations/20260731190000_init/` is the initial schema, generated via
`prisma migrate diff --from-empty` against the schema file (no live database was
reachable to generate it via the normal `prisma migrate dev` flow — see ADR 0004).
Apply it locally with `npm run db:migrate` once a database is reachable
(`docker compose up -d postgres` first). Production uses `prisma migrate deploy`
(not yet wired into a deployment pipeline).

## Seeding

`prisma/seed.ts` creates two deterministic, clearly-fictional dev users (matching
the existing feed's `@dfw_stormwatch`/`@tromso_aurora_chaser` handles from
`src/lib/feed/reports.ts`) with one Watch Zone and one follow relationship each.
Upsert-based, safe to rerun. Run with `npm run db:seed`. These seed users have no
password/Account row, so they can't sign in through the UI — they exist only to
give follow/Watch-Zone relations something to point at; create a real account via
`/sign-up` for anything that needs to sign in.

## Local setup

```
docker compose up -d postgres
cp .env.example .env   # fill in DATABASE_URL/AUTH_SECRET if not already
npm run db:migrate
npm run db:seed
```
