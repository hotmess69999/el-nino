# Deploying El Niño to Vercel

Full provider-neutral detail lives in `docs/DEPLOYMENT.md` (architecture,
security headers, backup/rollback procedure). This is the exact, minimal
path to get this repo live on **Vercel** specifically.

## 1. Provision a Postgres database

Vercel doesn't host Postgres itself — use any managed Postgres provider
(Vercel Postgres/Neon integration, Supabase, Railway, etc.), PostgreSQL 16+.
Grab the connection string; you'll need it below.

## 2. Push this repo to GitHub

```
git push origin <branch>
```

## 3. Import the project in Vercel

1. https://vercel.com/new → Import the GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Build command: `npm run build` (default — no change needed).
4. Output: managed automatically by the Next.js preset.

## 4. Set environment variables

In the Vercel project → Settings → Environment Variables, add for
**Production** (and Preview if you want preview deploys working):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | your Postgres connection string from step 1 |
| `AUTH_SECRET` | a real random secret — generate with `openssl rand -base64 32`, never reused across environments |
| `APP_ENV` | `production` |
| `APP_BASE_URL` | your Vercel URL, e.g. `https://el-nino.vercel.app` (HTTPS required — Better Auth's session cookies assume it) |
| `NEXT_TELEMETRY_DISABLED` | `1` |

Leave everything else in `.env.example` unset — no shipped code reads those
vars yet (see `docs/ENVIRONMENT.md`).

## 5. Run migrations against the production database

Before (or immediately after) the first deploy, run once from your machine
(or a CI step) with `DATABASE_URL` pointed at production:

```
npx prisma generate
npx prisma migrate deploy
```

Do **not** run `prisma db seed` against production — it creates fictional
demo data and has no environment guard.

## 6. Deploy

Push to the branch Vercel is watching (or click Deploy in the dashboard).
Vercel runs `npm install && npm run build` and serves the result.

## 7. Verify

- Visit the deployed URL — the globe map should load on `/`.
- `/feed`, `/alerts`, `/space-weather` should render without errors.
- Sign up a test account at `/sign-up` and confirm it redirects to `/profile`
  (first real signal the database connection works).

## CI

`.github/workflows/ci.yml` runs on every push/PR to any branch: lint,
typecheck, a real Postgres service container, migrations, seed, unit +
integration tests, Playwright (desktop + Pixel 7), production build,
`npm audit`. Verified green against `hotmess69999/el-nino` (run
`30805535672`). CI does not deploy anywhere — it only verifies.

## What's not wired up yet

- No deployment target is provisioned by default (see `docs/DEPLOYMENT.md`
  for an illustrative, non-chosen architecture).
- No `/api/health` route yet — add one before deploying behind a load
  balancer that needs a health check target.
- No security headers (CSP, HSTS, frame options) configured yet.
- Object storage: uploads currently write to local disk
  (`public/uploads/`), which does **not** survive a redeploy on Vercel's
  ephemeral filesystem or scale past one instance — swap
  `src/lib/storage/local.ts` for an S3-compatible client before real users
  upload real files.
