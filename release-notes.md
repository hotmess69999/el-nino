# Release notes

## Unreleased — SEO/social/favicon polish

- Added favicon, PWA manifest, and app icons (`public/favicon.ico`,
  `public/icon-192.png`, `public/icon-512.png`, `src/app/manifest.ts`).
- Added a social preview image (`public/og-image.png`) and full Open
  Graph/Twitter card metadata.
- Expanded page metadata: title template, description, keywords, canonical
  base URL.

## Phase 9 — production hardening (verified against live infrastructure)

- Verified full stack against a real PostgreSQL instance for the first time:
  clean migration from an empty database, idempotent seed, 72/72 unit tests,
  50/50 Playwright tests, production build, production-route smoke test,
  dependency audit, Lighthouse baseline.
- Fixed 8 real bugs surfaced only by that live verification (stale env
  loading in tests, PowerShell/Docker stderr handling, fixture timestamps
  going stale against a real clock, a nulled-event bug in the upload form,
  CI missing a Prisma Client generation step, and CI-only Playwright
  rendering differences on the mobile project).
- Added Docker Compose bring-up scripts (`scripts/setup-phase9.ps1` and
  friends), a GitHub Actions CI workflow, and provider-neutral deployment
  documentation (`docs/DEPLOYMENT.md`).
- Pushed to `https://github.com/hotmess69999/el-nino` — CI is green
  (`master`, run `30805535672`).

## Phase 7-8 — space weather, moderation, admin

- Space weather section (`/space-weather`) with a deterministic fixture
  provider, plain-language + technical summaries.
- Moderation queue (`/admin/moderation`), role-gated (`user`/`moderator`/
  `admin`), and a report control wired into the feed.

## Phase 5-6 — upload and localised warnings

- Weather-report upload workflow (local storage, single-shot, location
  fuzzed to ~1.1km before storage).
- Official warnings (`/alerts`) with a deterministic fixture adapter and
  Watch Zone relevance matching; degrades gracefully if the database is
  unavailable rather than crashing the route.

## Phase 4 — authentication, profiles, Watch Zones

- Better Auth (email/password), profiles, follows, and private point-radius
  Watch Zones with server-side ownership checks on every mutation.

## Phases 0-3 — foundation

- Repository audit, design-token system, responsive navigation shell,
  interactive MapLibre globe, vertical weather-video feed with licensed
  media fixtures.

See `docs/checkpoints/` for the full per-phase detail behind every line
above.
