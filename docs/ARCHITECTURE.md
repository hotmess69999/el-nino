# Architecture (Phase 0 baseline)

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

- **Web app**: React (Vite) or Next.js — decision deferred to Phase 1, to be recorded
  as an ADR (see spec section 18). Globe-first UI (MapLibre + a WebGL globe layer),
  TikTok-style vertical video feed.
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

## Open decisions (need a call before Phase 1)

- React+Vite vs Next.js for the frontend
- Prisma vs Drizzle
- Better Auth vs Clerk
- Monorepo layout (single app vs. apps/ + packages/ workspace) once native
  mobile/desktop clients and public APIs come into scope
- First warning provider to integrate for Phase 6

## Repository layout (current)

```
el-nino/
├── docs/            # architecture, migration, setup docs (this Phase 0 output)
├── specs/           # transcribed product/master-prompt specs
├── src/
│   ├── app/         # Next.js app router routes (empty scaffold)
│   ├── components/  # shared UI components
│   ├── features/    # feature modules (globe, feed, watch-zones, ...)
│   ├── lib/         # shared utilities
│   └── server/      # server-only code (db, queues, socket handlers)
├── docker-compose.yml  # local Postgres + Redis
├── package.json
└── tsconfig.json
```
