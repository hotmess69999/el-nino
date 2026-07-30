# EL NIÑO – Production Master Prompt (Draft)

> Source: `El_Nino_Master_Prompt_Draft_3_Pages.pdf` (transcribed verbatim, 2026-07-31)

This document is the beginning of the complete engineering specification for the El
Niño weather-only social platform. It is intended to guide Claude Code through
redesigning the existing El Niño application rather than replacing it.

## Project Objectives

- Audit the existing El Niño project before changing any code.
- Preserve mature functionality and improve weak areas.
- Create a globe-first weather experience with a TikTok-style vertical feed.
- Build only weather-related functionality.
- Design for production, scalability and maintainability.

## Design Direction

The visual language combines the previously approved "Map First" and "Map
Experience" concepts. The globe is the centrepiece of the application. The interface
uses dark charcoal backgrounds, subtle blue and teal highlights, clean typography,
smooth transitions and minimal interface chrome. The application must never
resemble a generic AI-generated dashboard.

## Foundation & Development Workflow

### Phase 0

Before any product development begins, Claude Code must:

1. Audit the existing codebase.
2. Produce architecture and technical debt reports.
3. Create a migration strategy.
4. Install all required tooling.
5. Verify every dependency.
6. Document the entire setup.

### Required Tooling

Node.js LTS, pnpm, TypeScript, Docker, Docker Compose, Git, ESLint, Prettier,
Playwright, Vitest, PostgreSQL, Prisma or Drizzle, Redis, Socket.io, BullMQ, MapLibre,
OpenStreetMap, FFmpeg, Sharp, S3-compatible storage, Better Auth or Clerk, Firebase
Cloud Messaging, Web Push, Sentry, PostHog, GitHub Actions, Dependabot, Renovate
and recommended VS Code/Cursor extensions.

## Core Product Features

- Interactive 3D globe
- Infinite vertical video feed
- Live weather event pages
- Watch Zones
- Localised official warnings (no disaster mode)
- Space Weather section
- Weather-only uploads with AI categorisation
- Search, profiles, moderation and realtime updates

## Long-Term Vision

Design the platform so it can later support native Android, iOS, desktop clients, public
APIs, emergency agency integrations, advanced mapping layers, and millions of users.
Every design and engineering decision should prioritise trust, clarity, speed and
long-term maintainability. This document serves as the first section of a much larger
engineering specification that will ultimately be expanded into a comprehensive
master reference.
