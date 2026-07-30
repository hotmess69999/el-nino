# ADR 0002: Database ORM — Prisma

## Status

Accepted (2026-07-31)

## Context

Section 19 requires PostgreSQL with geospatial support and says to "choose Prisma or
Drizzle after auditing the current data layer" — N/A here since the project is
greenfield, so the choice is made directly on requirements.

El Niño's data model (section 19's representative entity list) is large and
relational (User, Event, OfficialWarning, WatchZone, MediaAsset, ModerationCase,
etc.) with many foreign-key relationships, soft-deletes, and audit-log needs. It also
needs PostGIS geospatial types (section 17/19) for event geometry, warning polygons,
and Watch Zone areas.

## Decision

Use **Prisma** with the `postgresql` connector and PostGIS extensions accessed via
raw SQL / `Unsupported("geometry")` fields where Prisma's type system doesn't natively
model geospatial types.

## Consequences

- Strong migration tooling (`prisma migrate`) fits the "forward-safe migrations with
  rollback instructions" requirement (section 19) well.
- Generated, typed client fits the "strict validation, typed contracts" requirement
  (section 30 execution block) directly.
- Geospatial columns (event geometry, warning polygons, Watch Zone areas, upload
  public coordinates) need raw SQL for PostGIS-specific queries (point-in-polygon,
  distance) since Prisma's query builder doesn't have native geospatial operators —
  this is expected and handled through `$queryRaw` in the weather/geospatial data
  domain layer, isolated behind the map-geospatial-engineer skill's boundaries.

## Alternatives considered

- **Drizzle**: lighter weight, SQL-first, arguably better native fit for PostGIS raw
  queries throughout (less fighting the ORM), but weaker migration tooling and less
  mature ecosystem for this project's scale. Reconsider if Prisma's PostGIS friction
  becomes a recurring maintenance cost.

## Exit strategy

Revisit after Phase 2 (geospatial event index, viewport APIs) is implemented and the
real cost of raw-SQL geospatial queries under Prisma is measured. Migration to
Drizzle later is possible but not free — would require a documented, evidence-based
migration plan per the master prompt's non-negotiable rule against unnecessary
rewrites.
