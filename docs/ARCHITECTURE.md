# Architecture

## Status

Greenfield project. No pre-existing El Niño codebase was found on this machine, so
section 2 ("Existing application audit and preservation") of the authoritative
[`specs/El_Nino_FULL_MASTER_Production_Prompt.md`](../specs/El_Nino_FULL_MASTER_Production_Prompt.md)
does not apply yet — it's recorded as N/A in that document and in
[`MIGRATION_STRATEGY.md`](./MIGRATION_STRATEGY.md). If an existing project surfaces
later (another repo, a Wix/Replit project, etc.), run the `codebase-auditor` skill on
it before building further and update this document.

The full master prompt is authoritative over the earlier 3-page draft. See its
sections 17–19 for the detailed backend/data/geospatial requirements this section
summarises, and section 27 for the phased delivery plan this project follows.

## Target shape (per the master prompt)

- **Web app**: Next.js (App Router) — decided in
  [ADR 0001](./decisions/0001-frontend-framework.md). Globe-first UI: MapLibre GL JS
  (`maplibre-gl@6.1.0`) with a self-contained, no-provider dark style — see the
  Phase 2 checkpoint and `docs/DESIGN_SYSTEM.md`. TikTok-style vertical video feed
  built in Phase 3 (`src/components/feed/FeedScreen.tsx`), sharing its event
  data with the globe.
- **Realtime**: Socket.io (or similar) for active-event updates, warning issue/
  update/cancel/expiry, upload progress, comments, admin queues — durable state stays
  in Postgres; clients recover via cursor refetch, not an assumption nothing was
  missed.
- **Jobs/queues**: BullMQ backed by Redis, for transcoding, thumbnails, notification
  fan-out, event grouping, feed ranking updates, scheduled provider ingestion.
- **Data**: PostgreSQL with geospatial support, via Prisma or Drizzle (decision
  deferred — see Open Decisions). Modular monolith with domain boundaries (identity,
  media, content, events, weather, watch zones/notifications, trust & safety,
  operations) — no premature microservices.
- **Weather/space-weather data**: provider-neutral adapter layer (see the
  `weather-data-integrator` skill) — no provider hard-wired into the UI.
- **Storage**: S3-compatible object storage for video/image uploads, CDN delivery.
- **Auth**: Better Auth or Clerk (decision deferred).
- **Notifications**: Firebase Cloud Messaging + Web Push, consent-based, zone/
  category/severity configurable.
- **Observability**: Sentry (errors) + PostHog (product analytics) — only after
  consent, retention, and data-classification rules are defined.
- **CI/CD**: GitHub Actions, one dependency updater (Dependabot or Renovate).

## Decisions made

- Frontend framework: Next.js — [ADR 0001](./decisions/0001-frontend-framework.md)
- ORM: Prisma — [ADR 0002](./decisions/0002-orm-choice.md)
- Auth: Better Auth — [ADR 0003](./decisions/0003-auth-provider.md)

## Open decisions

- Monorepo layout (single app vs. apps/ + packages/ workspace) once native
  mobile/desktop clients and public APIs come into scope
- First warning provider to integrate for Phase 6
- First live basemap/tile provider (none is integrated yet; `src/lib/map/config.ts`
  uses a self-contained style with no external dependency or API key — and note
  it must be a raster/image-friendly integration path, since GeoJSON vector
  sources don't work in this bundler setup, see Phase 3 checkpoint)
- Real weather-video fixtures to replace the Phase 3 generated placeholders
  (`public/media/*.mp4`) before any production use

## Repository layout (current, end of Phase 3)

```
el-nino/
├── docs/                    # architecture, design system, checkpoints, ADRs
├── specs/                   # master-prompt specs (authoritative + superseded draft)
├── security/                # dependency install allowlist (see docs/dependency-security-log.md)
├── scripts/                 # setup/dev/verify/reset/generate-graticule-image scripts
├── e2e/                     # Playwright specs — nav.spec.ts, map.spec.ts, feed.spec.ts (30/30 passing)
├── public/
│   ├── map/                 # graticule.png (pre-rendered globe grid texture)
│   └── media/                # generated placeholder weather video fixtures + README
├── src/
│   ├── app/                 # Next.js App Router routes
│   │   ├── layout.tsx       # root layout: skip link, nav shell, main landmark
│   │   ├── page.tsx         # Globe home — real MapLibre GlobeMap component
│   │   ├── feed/            # real vertical video feed (FeedScreen)
│   │   ├── upload/          # placeholder — Phase 5
│   │   ├── alerts/          # placeholder — Phase 6
│   │   └── profile/         # placeholder — Phase 4
│   ├── components/
│   │   ├── feed/            # FeedScreen — the vertical weather-video feed
│   │   ├── map/             # GlobeMap, EventPreview — the globe/map feature
│   │   ├── nav/             # NavShell (single responsive landmark) + icon set
│   │   └── shared/          # PlaceholderScreen (honest "not built yet" surface)
│   ├── lib/
│   │   ├── feed/             # reports.ts — maps seed events to feed reports (+ tests)
│   │   ├── map/              # config, categories, events, seedEvents, graticule,
│   │   │                     # toGeoJSON, webgl (+ unit tests for each)
│   │   ├── navigation.ts
│   │   └── tokens.ts
│   └── styles/               # tokens.css (design-token source of truth)
├── docker-compose.yml        # local Postgres + Redis
├── package.json
├── tsconfig.json
├── next.config.mjs
├── vitest.config.ts
└── playwright.config.ts
```
