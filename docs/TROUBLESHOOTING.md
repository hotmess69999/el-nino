# Troubleshooting

## `pnpm: command not found` / pnpm install refused

This project uses **npm**, not pnpm — see [`SETUP.md`](./SETUP.md#pnpm-deviation).
The org's package-install security guard (`safe-package-install.sh`) flagged pnpm's
install bundle and refused to install it automatically. If you want pnpm anyway,
install it yourself and let a future session know so scripts/lockfiles can switch
over.

## `docker: command not found`

Docker Desktop isn't installed. `docker-compose.yml` (Postgres 16 + Redis 7) is
ready — install Docker Desktop, then run `scripts/dev.sh` / `scripts/dev.ps1` or
`docker compose up -d` directly.

## `scripts/verify-environment.mjs` reports missing env vars

That's expected before you've copied `.env.example` to `.env` and filled in values.
Most variables aren't required until the phase that uses them — see
[`ENVIRONMENT.md`](./ENVIRONMENT.md) for which phase needs which variable. Missing
vars for a phase you haven't reached yet are not an error.

## `npm run dev` fails with "next: command not found" (or similar)

Expected at the current Phase 0 stage — no framework dependencies are installed yet
(see [`SETUP.md`](./SETUP.md#why-dependencies-arent-installed-yet)). Install the
Phase 1 dependency batch listed there before running the dev server.

## `scripts/reset-local-data.*` fails on `prisma migrate deploy`

Expected before `prisma/schema.prisma` exists — the script skips migrate/seed until
the Prisma schema is added in a later phase (per ADR 0002).

## Windows: PowerShell scripts blocked by execution policy

Run scripts with an explicit bypass for the current process only, rather than
changing the system-wide policy:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-windows.ps1
```
