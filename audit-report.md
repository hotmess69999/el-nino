# El Niño — audit report

Date: 2026-08-03. Scope: build, dependencies, tests, responsive design, SEO,
social preview, favicon/manifest, performance.

## Build

`npm run build` (Next.js 16.2.12, Turbopack) — **clean.** All 12 routes compile.
`npx tsc --noEmit` — **clean.** `npm run lint` (ESLint, type-aware) — **clean.**

## Dependencies

All runtime and dev dependencies were installed through the project's
install-security guard with exact versions and integrity verification —
see `docs/dependency-security-log.md` and `security/approved-packages.json`
for the full per-package review trail. No unreviewed packages in the tree.

## Tests

- Unit/integration (Vitest): **72/72 passing**, 0 skipped (includes 4
  database-backed tests, verified against a real PostgreSQL instance).
- End-to-end (Playwright, desktop + Pixel 7): **50/50 passing** — auth,
  profiles, follows, Watch Zones, uploads, warnings, space weather,
  moderation/admin, navigation, feed.
- Verified in CI (GitHub Actions, `hotmess69999/el-nino`, run `30805535672`) —
  fully green: lint, typecheck, migrations, seed, tests, Playwright, build,
  `npm audit --audit-level=high`.

## Responsive design

Mobile-first single-surface layout below 1024px, left-rail navigation above
it (per `docs/DESIGN_SYSTEM.md`). Verified via the Pixel 7 Playwright project
across every route (`e2e/*.spec.ts`, `mobile` project) and the final visual
package (`preview-screenshots/final/mobile/`, 19 screenshots).

## SEO metadata — fixed this pass

Previously: bare `title`/`description` only, no Open Graph, no Twitter card,
no keywords, no canonical base URL. Now (`src/app/layout.tsx`):
title template, description, keywords, `metadataBase`, Open Graph (title,
description, image, type), Twitter summary-large-image card.

## Social preview image — fixed this pass

No `og-image.png` existed before this pass. Generated `public/og-image.png`
(1200×630, on-brand dark canvas + accent blue, matches
`docs/DESIGN_SYSTEM.md`'s token palette) and wired it into both Open Graph
and Twitter card metadata.

## Favicon and manifest — fixed this pass

No favicon or manifest existed before this pass. Added `public/favicon.ico`,
`public/icon-192.png`, `public/icon-512.png`, and `src/app/manifest.ts`
(Next.js's native manifest route, confirmed generated at `/manifest.webmanifest`
in the build output above).

## Performance

- Feed: only the active video decodes at a time (`IntersectionObserver`-driven
  play/pause), preload capped to adjacent items — see
  `src/components/feed/FeedScreen.tsx`.
- Map: raster/image-source graticule (no live vector tiles fetched) —
  see `docs/investigations/MAPLIBRE-GEOJSON.md` for why, and the gating
  decision that follows from it.
- Lighthouse baseline captured: `docs/performance/lighthouse-baseline.json`
  (Phase 9, against a production build).
- No performance regressions introduced by this pass's metadata/icon
  additions — all are static assets served from `public/`, no added
  client-side JavaScript.

## Known, already-documented limitations (not fixed in this pass — out of scope for "finish and polish")

These are pre-existing, intentionally scoped decisions from earlier phases,
not defects introduced or missed by this audit:

- Dynamic vector map data (drawn Watch Zone boundaries, warning polygons) is
  gated — see `docs/investigations/MAPLIBRE-GEOJSON.md`.
- Upload pipeline is single-shot, not resumable/chunked, no transcoding —
  see `docs/checkpoints/PHASE-5-6.md`.
- No CI-triggered deployment, no rate limiting, no security headers yet —
  see `docs/SECURITY.md` and `docs/DEPLOYMENT.md`.
