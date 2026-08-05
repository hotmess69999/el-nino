# Post-launch TODO

Not blockers for shipping the MVP — track and address after launch.

1. **Object storage for uploads.** `src/lib/storage/local.ts` writes to
   local disk (`public/uploads/`), which doesn't persist on Vercel's
   ephemeral filesystem. Swap for an S3-compatible client before real users
   upload real files. See `docs/DEPLOYMENT.md`.
2. **Security headers.** No CSP, HSTS, `X-Frame-Options`, or CORS
   restriction configured yet. See `docs/SECURITY.md` → "Known gaps."
3. **Health check route.** No `/api/health` exists. Add one before putting
   this behind a load balancer that needs it.
4. **Backups.** No automated Postgres backup/restore procedure configured
   for the production database yet.
5. **Seed-script guard.** `prisma/seed.ts` has no `APP_ENV !== "production"`
   check — don't wire it into any automated pipeline until it does.
6. **E2E DB-dependent flows.** `e2e/auth.spec.ts`, `watchZones.spec.ts`,
   `upload.spec.ts`, `follow.spec.ts`, `spaceWeatherAndAdmin.spec.ts` need a
   live, migrated Postgres to pass — wire up a CI database before relying on
   full e2e coverage in automation.
7. **Connection pooling.** Not configured at the application layer — use a
   managed Postgres with built-in pooling (e.g. PgBouncer) once under real
   load.
