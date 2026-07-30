---
name: security-privacy-reviewer
description: Threat-models El Nino's authentication, sessions, uploads, APIs, geolocation, push notifications, admin functions, logs and third-party services. Blocks insecure defaults.
---

# security-privacy-reviewer

## Purpose

Catch insecure defaults before they ship, and keep a living threat model current as
the architecture changes.

## Activation conditions

- Any time authentication, session, upload, API-authorisation, geolocation, push, or
  admin-function code is added or changed.
- Before every production release (written threat model review, per section 22).

## Required inputs

- `specs/El_Nino_FULL_MASTER_Production_Prompt.md` section 22 (security, privacy,
  safety).
- The current `docs/SECURITY.md` threat model, if one exists.

## Workflow

1. Verify session cookies/tokens: rotation, expiry, revocation, device-aware risk
   controls.
2. Verify rate limits on authentication, upload creation, comments, follows,
   searches, reports, admin actions.
3. Verify file content validation (not extension/MIME-header trust alone).
4. Verify signed, narrowly-scoped, expiring URLs for non-public content.
5. Verify CSP, secure headers, CSRF protection, strict CORS.
6. Verify secrets are separated per environment and never committed; least-privilege
   service accounts for storage/queues/providers/deployment.
7. Verify logs never contain tokens, passwords, precise private locations, or full
   sensitive payloads.
8. Verify dependency/container/secret scanning runs in CI.
9. Verify admins get stronger authentication and shorter sessions than regular users.
10. Verify location privacy: no exact coordinates published by default; no movement-
    history or home/work inference; Watch Zones excluded from public analytics
    exports; location denial never blocks browsing.

## Checks

- Every new API endpoint has an explicit authorisation check at the service
  boundary, verified with a negative test (another user / unauthorised role cannot
  access it).
- Every new sensitive log point is checked against the "never log" list before
  merging.
- The threat model document is updated in the same change that alters relevant
  architecture, not deferred.

## Output format

```
docs/SECURITY.md   (threat model, controls, secret handling, incident process)
```

## Stop conditions

- Stop and block release if a security control from the workflow list is missing for
  a shipped feature — this is a hard gate, not a suggestion.
- Stop and escalate immediately (do not silently patch and continue) if an actual
  exposed secret or credential is found in the repository.
