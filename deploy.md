# Deploy

Full detail lives in `docs/DEPLOYMENT.md` (provider-neutral requirements,
architecture, security headers, backup/rollback procedure). This is the
short version for actually shipping a build.

## Prerequisites

- A PostgreSQL 16+ instance with its connection string as `DATABASE_URL`.
- A real, random `AUTH_SECRET` (never reused across environments).
- `APP_BASE_URL` set to the real public URL (HTTPS required in production —
  Better Auth's session cookies assume it).
- Node.js 20+.

## Steps

```
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

Do **not** run `prisma db seed` against production — it has no environment
guard yet (see `docs/DEPLOYMENT.md`'s "Seed restrictions in production").

## CI

`.github/workflows/ci.yml` runs on every push/PR to any branch: lint,
typecheck, a real Postgres service container, migrations, seed, unit +
integration tests, Playwright (desktop + Pixel 7), production build,
`npm audit`. Verified green against `hotmess69999/el-nino` (run `30805535672`).
CI does not deploy anywhere — it only verifies.

## What's not wired up yet

- No deployment target is provisioned (see `docs/DEPLOYMENT.md` — one
  illustrative, non-chosen architecture is documented there).
- No `/api/health` route yet — add one before deploying behind a load
  balancer that needs a health check target.
- No security headers (CSP, HSTS, frame options) configured yet.
- Object storage: uploads currently write to local disk
  (`public/uploads/`), which does not survive a redeploy on most platforms
  or scale past one instance — swap `src/lib/storage/local.ts` for an
  S3-compatible client before deploying anywhere with more than one
  instance or an ephemeral filesystem.
