# ADR 0003: Authentication — Better Auth

## Status

Accepted (2026-07-31)

## Context

Section 19 (Identity and access) and Appendix B (`AUTH_SECRET=...`) require session/
role/badge/block/consent management. Section 30's execution block and the tool policy
(Part I.B) allow "Better Auth, Clerk, or the existing authentication solution — based
on migration cost, ownership, privacy, mobile roadmap and operational complexity. Do
not replace a sound system without a measured benefit." N/A here for "existing
system" since the project is greenfield.

Section 22 requires secure session cookies with rotation/expiry/revocation/device-
aware risk controls, stronger auth + short sessions for admins, and strict data
ownership around location/Watch Zones (section 22, Location privacy). Section 27
Phase 4 (Authentication, profiles, Watch Zones) is a mid-project phase, not Phase 0 —
this decision only needs to be recorded now so later phases aren't blocked, not
implemented yet.

## Decision

Use **Better Auth** (self-hosted, open-source) over Clerk.

## Consequences

- Full data ownership: no third-party service holds user session/auth data, which
  simplifies the location-privacy and Watch-Zone-privacy guarantees in section 22
  (data never leaves infrastructure the team controls).
- No per-monthly-active-user vendor cost as the platform scales toward "millions of
  users" (long-term vision in the original 3-page draft) — operationally cheaper at
  scale than a hosted auth vendor.
- More implementation work up front (session management, admin role/permission
  wiring) versus Clerk's batteries-included dashboard — acceptable given the modular-
  monolith-first, own-your-infrastructure direction in section 19.
- Badge verification (Meteorologist, Emergency Service, etc., section 14) requires
  custom manual-review workflows regardless of provider, so Clerk's built-in role
  UI doesn't remove much of that work anyway.

## Alternatives considered

- **Clerk**: faster initial setup, polished built-in UI for auth flows and org/role
  management, but introduces a third-party data dependency for exactly the kind of
  privacy-sensitive data (location-linked accounts, Watch Zones) this product treats
  as sensitive by design (section 22).

## Exit strategy

If Better Auth's operational burden (session infra, admin tooling) turns out to
outweigh the data-ownership benefit before Phase 4 ships, switch to Clerk — this is
a Phase 4 blocker decision, not a Phase 0 one, so there's no sunk migration cost yet
if reconsidered before implementation begins.

## Implementation notes (Phase 4)

- Better Auth's core `User` schema requires a `name` field — the app exposes this
  as `displayName` at the service/UI boundary
  (`src/lib/users/service.ts`/`src/lib/users/validation.ts`) rather than fighting
  Better Auth's field-mapping options, but the underlying Prisma column is `name`.
  Don't rename it in the schema without checking `better-auth/adapters/prisma`.
- `email/password` only for this phase (`emailAndPassword: { enabled: true,
  minPasswordLength: 8 }` in `src/lib/auth/server.ts`) — no email delivery is
  configured, so there's no verification-email step; accounts are usable
  immediately after sign-up. Social providers, passkeys, SMS, and production email
  are explicitly out of scope per `docs/checkpoints/PHASE-4-PLAN.md`.
- `username`/`bio`/`verificationType`/`weatherScore` are declared via
  `user.additionalFields` in `src/lib/auth/server.ts` — `verificationType` and
  `weatherScore` are server-only (`input: false`), so they can't be set through the
  public sign-up/update-user API surface.
- Sessions: 7-day expiry, refreshed once per day of activity
  (`session.expiresIn`/`updateAge`) — short-lived per section 22, not indefinite.
