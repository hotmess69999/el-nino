# Release Notes — MVP Ship

## What changed in this pass

The app did not build from a clean checkout — `node_modules` had never been
installed and the generated Prisma client was missing. Fixed both, plus two
missing local dev env values, and verified the full build/start/test chain.

- Ran `npm install` (all deps + devDeps from `package.json`).
- Ran `npx prisma generate` — `src/generated/prisma` is a build artifact and
  wasn't checked in (correctly — see `.gitignore`), but nothing regenerated
  it on install since npm install scripts are disabled in this environment.
- Created `.env` from `.env.example` and filled in `AUTH_SECRET` — its
  absence caused Better Auth to fall back to an insecure default secret
  during the build's page-data collection step.
- No source code changes were needed — the app itself was already correct.

## Verified

- `npm run build` — passes, no errors or warnings.
- `npm start` — serves `/` with HTTP 200.
- `npm run lint` — clean.
- `npm run typecheck` — clean.
- `npm run test` — 68 passed, 4 skipped, 0 failed.
- `npm run test:e2e` — 18 passed. 7 failed, all in flows that require a live
  Postgres database (sign-up, watch zones, upload, follow) — there is no
  database running in this environment. These are expected to pass once
  `DATABASE_URL` points at a real, migrated database (see `DEPLOY.md`).

## Known issues carried into this release

See `TODO_POST_LAUNCH.md`.
