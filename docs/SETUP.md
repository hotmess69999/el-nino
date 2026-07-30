# Setup Log (Phase 0)

Verified on this machine on 2026-07-31 (Windows 11, Git Bash):

| Tool | Status | Version | Notes |
|---|---|---|---|
| Node.js | ✅ installed | v24.16.0 | Newer than LTS; fine for now, pin to LTS in CI later |
| npm | ✅ installed | 11.17.0 | |
| pnpm | ⚠️ substituted with npm | — | See "pnpm deviation" below |
| Git | ✅ installed | 2.51.2.windows.1 | |
| Docker / Docker Compose | ❌ not installed | — | `docker-compose.yml` is written and ready; install Docker Desktop to run local Postgres/Redis |
| TypeScript | 📝 configured, not yet installed | — | `tsconfig.json` in place; package not yet added to `node_modules` |
| ESLint / Prettier | 📝 configured, not yet installed | — | Config files in place (`.eslintrc.cjs`, `.prettierrc.json`) |
| Vitest / Playwright | 📝 scripted, not yet installed | — | `package.json` scripts reference them |
| PostgreSQL / Redis | 📝 defined via `docker-compose.yml` | — | Requires Docker |
| Prisma / Drizzle, Socket.io, BullMQ, MapLibre, FFmpeg, Sharp, S3 client, Better Auth/Clerk, FCM, Web Push, Sentry, PostHog | ⏳ deferred | — | Not installed yet — see "Next install batch" below |

## pnpm deviation

The org-wide package-install guard (`safe-package-install.sh`) flagged pnpm's install
bundle (base64 blobs, an `eval()`, hardcoded IPs in its minified CLI bundle — typical
false-positive triggers for a bundler/CLI tool, not confirmed malicious) and refused
to install it automatically. Rather than bypass the security check, this scaffold uses
**npm** as the package manager for now. If you specifically want pnpm, install it
yourself (e.g. via the official installer at pnpm.io) and I'll switch the scripts/lockfile
over.

## Docker deviation

Docker Desktop is not installed on this machine. `docker-compose.yml` (Postgres 16 +
Redis 7) is ready to go once Docker is installed — no further changes needed.

## Why dependencies aren't installed yet

This is the Phase 0 scaffold: repo structure, configs, and docs only, per your
"Phase 0 only" scope decision. Installing the full dependency list (Next.js, Prisma,
Socket.io, BullMQ, MapLibre, etc.) means running many individual package installs
through the security guard — better done as a deliberate next step (or batch) rather
than silently in the background here.

## Next install batch (when ready to move past Phase 0)

Run each through the guard, e.g.:

```
bash /c/Users/jasmi/safe-package-install.sh npm next
bash /c/Users/jasmi/safe-package-install.sh npm react react-dom
bash /c/Users/jasmi/safe-package-install.sh npm typescript
bash /c/Users/jasmi/safe-package-install.sh npm prisma @prisma/client   # or drizzle-orm
bash /c/Users/jasmi/safe-package-install.sh npm socket.io socket.io-client
bash /c/Users/jasmi/safe-package-install.sh npm bullmq ioredis
bash /c/Users/jasmi/safe-package-install.sh npm maplibre-gl
...
```

Say the word and I'll run these (and the dev-dependency set: eslint, prettier,
vitest, @playwright/test, typescript-eslint) in the next session.

## Scripts (Part I.D of the master prompt)

All required setup outputs now exist:

| Script | Purpose |
|---|---|
| `scripts/setup-windows.ps1` | Idempotent local setup (Windows) |
| `scripts/setup-unix.sh` | Idempotent local setup (macOS/Linux) |
| `scripts/verify-environment.mjs` | Checks runtimes, env var presence (no values printed), Docker Compose file; writes `artifacts/setup-verification.{json,md}` |
| `scripts/dev.ps1` / `scripts/dev.sh` | Starts local infra (if Docker available) + dev server |
| `scripts/reset-local-data.ps1` / `scripts/reset-local-data.sh` | Recreates local Postgres/Redis containers and reseeds — **local data only** |

Run `node scripts/verify-environment.mjs` any time to check environment status
without needing Docker or installed dependencies — it degrades gracefully and
reports what's missing.

See also [`ENVIRONMENT.md`](./ENVIRONMENT.md) for the full variable reference and
[`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for common issues.
