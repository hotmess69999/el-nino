# Security

Threat model summary and control inventory — see `docs/decisions/` for the
reasoning behind specific choices (auth provider, database) and
`docs/dependency-security-log.md` for the supply-chain review process.

## Sensitive data

Precise upload coordinates, private Watch Zones, session tokens, and moderation
evidence are the sensitive categories in this system (section 22).

- **Location**: `src/lib/uploads/validation.ts`'s `fuzzCoordinate` rounds public
  report coordinates to two decimal places (~1.1km) *before* they are ever
  persisted — the exact submitted point is never stored, not just never
  displayed. Watch Zones are private by default (never selected in any public
  query — `src/lib/users/service.ts`'s `PUBLIC_PROFILE_SELECT` never includes
  them).
- **Email**: never selected in a public-facing profile query (same
  `PUBLIC_PROFILE_SELECT` allowlist).
- **Session**: Better Auth-managed cookies, 7-day expiry with daily rotation on
  activity (`src/lib/auth/server.ts`).

## Access control

- Every Watch Zone/profile mutation is ownership-checked server-side
  (`assertOwnedZone` in `src/lib/watchZones/service.ts` throws rather than
  silently no-op-ing on a mismatched owner — an attacker gets an error, not a
  silent skip that could be mistaken for success).
- Admin routes (`/admin/moderation`) check `User.role` server-side on every
  request and action, not just at the route boundary — `resolveModerationReportAction`
  re-checks `isModeratorRole` even though the page already gated access, since a
  server action can be called directly. Unauthorised access returns `notFound()`,
  not a 403, so the route's existence isn't confirmed to a probing anonymous or
  regular-user request.
- `UserRole` (access control) and `VerificationType` (public trust badge) are
  deliberately separate fields — a verified meteorologist badge never grants
  moderation access, and vice versa.

## Input validation

All user-facing mutations validate on the server (never trusting client-side
checks alone): `src/lib/watchZones/validation.ts`, `src/lib/users/validation.ts`,
`src/lib/uploads/validation.ts`. Upload validates MIME type against an allowlist
and enforces a byte-size ceiling before the file is ever written to disk.

## Known gaps (not yet addressed)

- **Rate limiting**: not implemented. Better Auth ships hooks for this but no
  limits are configured yet — sign-up/sign-in/upload/report endpoints are
  currently unthrottled. This is the most significant open item before a real
  production launch.
- **CSRF**: relies entirely on Better Auth's built-in same-site cookie handling;
  not independently verified.
- **File content validation**: upload validation checks MIME type and size only,
  not actual file content/malware scanning (section 22's "validate file content
  rather than trusting extensions or MIME headers" is not fully met — the MIME
  type is read from the browser-supplied `File.type`, not sniffed from bytes).
- **Secrets**: `.env` is gitignored and `.env.example` has no real values;
  production/staging secret separation is documented in `docs/ENVIRONMENT.md`
  but not exercised (no staging/production environment exists yet).
- **Dependency/container/secret scanning in CI**: no CI pipeline exists yet
  (see `docs/checkpoints/PHASE-9.md` for what Phase 9 covers vs. defers).

## Verification performed this pass

Everything above was verified by reading the code, not by running a live
penetration test or automated scanner — no live database was reachable in this
sandbox to exercise auth/ownership/role checks against real requests (see ADR
0004 "Why not run in this pass" for the same constraint across every DB-backed
phase). Treat this as a code-level review, not a tested security posture.
