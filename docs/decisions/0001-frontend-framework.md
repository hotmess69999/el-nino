# ADR 0001: Frontend framework — Next.js

## Status

Accepted (2026-07-31)

## Context

Section 18 of the master prompt allows either React+Vite or Next.js, "after auditing
the existing codebase" — N/A here since the project is greenfield. It notes: "A
client-heavy Vite architecture may suit the immersive feed and map. Next.js may add
value for public event pages, search indexing and server rendering."

El Niño's route map (Appendix A) includes many public, shareable, SEO-relevant pages
that benefit from server rendering and stable indexable URLs: `/events/:eventSlug`,
`/places/:placeSlug`, `/users/:handle`, `/alerts`, `/space-weather`. These are meant
to work for anonymous users (no forced auth to view public weather content, per
section 6) and to have stable links that survive event merges/renames (section 9).

The globe and vertical feed are the client-heavy, interactive core, but they can be
mounted as client components within a Next.js app — this doesn't require a
client-only framework.

## Decision

Use **Next.js** (App Router) for the consumer web application and the admin route
group (as a protected route bundle within the same app, per section 18's application
boundaries — or a separate Next.js app if operational isolation becomes necessary
later).

## Consequences

- Public event/place/profile pages get server rendering and indexability for free.
- The globe/feed/map remain client components — no server-rendering benefit is lost
  for interactive-only surfaces, but this must be watched for unnecessary
  server-round-trip overhead on highly interactive routes (performance-cost-engineer
  skill should flag this if it becomes a problem).
- Admin route group can reuse the same deployment initially (modular monolith
  preference from section 19); split into a separate app only if proven necessary.

## Alternatives considered

- **React + Vite**: simpler client-only architecture, likely faster dev-server
  iteration for the interactive core, but loses server rendering for public/SEO-
  relevant pages without adding a separate rendering layer.

## Exit strategy

If Next.js's server-rendering model proves to add more complexity than value (e.g.
excessive client/server boundary friction around the globe/feed), migrate to Vite +
a lightweight SSR/prerendering solution for public pages only. Revisit after Phase 2
(globe/map/event read experience) is built and measured.
