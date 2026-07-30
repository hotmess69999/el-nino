# Architecture (Phase 0 baseline)

## Status

Greenfield project. No pre-existing El Niño codebase was found on this machine, so
the "audit existing codebase" step of Phase 0 (see [`specs/El_Nino_Master_Prompt_Draft_3_Pages.md`](../specs/El_Nino_Master_Prompt_Draft_3_Pages.md))
does not apply yet. If an existing project surfaces later (another repo, a Wix/Replit
project, etc.), audit it before building further and update this document.

## Target shape (per the master prompt)

- **Web app**: Next.js + TypeScript, globe-first UI (MapLibre + a WebGL globe layer),
  TikTok-style vertical video feed.
- **Realtime**: Socket.io for live weather events, warnings, and feed updates.
- **Jobs/queues**: BullMQ backed by Redis, for video processing (FFmpeg/Sharp) and
  AI categorisation of uploads.
- **Data**: PostgreSQL via Prisma or Drizzle (decision deferred — see Open Decisions).
- **Storage**: S3-compatible object storage for video/image uploads.
- **Auth**: Better Auth or Clerk (decision deferred).
- **Notifications**: Firebase Cloud Messaging + Web Push.
- **Observability**: Sentry (errors) + PostHog (product analytics).
- **CI/CD**: GitHub Actions, Dependabot, Renovate.

## Open decisions (need a call before Phase 1)

- Prisma vs Drizzle
- Better Auth vs Clerk
- Monorepo layout (single Next.js app vs. apps/ + packages/ workspace) once native
  mobile/desktop clients and public APIs come into scope

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
