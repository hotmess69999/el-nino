# Phase 4 plan — Auth, profiles & Watch Zones

Status: **planning only, no implementation in this pass.** See "Why not implemented
now" at the end.

## 1. Scope, from the master prompt

Required outcome (phase table, section "Implementation phases"): *"Accounts,
profiles, follows, private zones, preferences, personalised globe/feed reasons."*
Detailed requirements pulled from sections 12 and 14 and the representative screen
list:

- **Auth**: sign up/in/out, session management, account deletion/export path
  (section "Settings and privacy" references this even though full settings UI is a
  later polish item).
- **Profiles** (`/users/:handle`, section 14): display name, weather-focused bio,
  optional approximate region, uploads, saved collections, badges, follow controls.
  Exact locations/private zones/moderation details never shown publicly.
- **Follows**: follow/unfollow; following aids discovery but must not dominate
  ranking over relevance/freshness/verification (no immediate ranking algorithm work
  required yet, but the data model must not preclude it later).
- **Watch Zones** (section 12): create by place search, map area, or admin region;
  name, location, radius/region, event preferences, independent notification
  settings; pause/mute/quiet-hours/delete per zone; never revealed publicly; overlap
  deduplication (notification-time concern, not zone-storage concern).
- **Personalised globe/feed reasons**: globe/feed content can reference "why you're
  seeing this" tied to a zone or follow — minimal version: a small label, not a full
  ranking system.

## 2. What's genuinely required now vs. deferred

**Required for Phase 4 (per the outcome line above):**
- Better Auth wired up (ADR 0003) with email/password at minimum.
- User + Profile data model, session handling.
- `/users/:handle` public profile page.
- Follow/unfollow relationship + UI affordance on profile.
- Watch Zone CRUD (place-search creation is enough; map-area/admin-region creation
  can follow once a zone exists at all) with pause/mute/delete.
- Zones stored privately, never exposed via any public endpoint or profile.

**Explicitly deferred, per already-established gating decisions or later phases:**
- **Watch Zone drawing on the map / zone geometry visualisation** — blocked by the
  unresolved GeoJSON/MapLibre worker issue
  (`docs/investigations/MAPLIBRE-GEOJSON.md`). Zones must be created via place-search
  (text input → geocoded point + radius), not a drawn polygon, until that's
  resolved. This is a hard input from that investigation, not a new decision.
- Warning-zone matching, push notifications, quiet-hours enforcement — Phase 6
  (Localised warnings) owns the delivery side; Phase 4 only owns zone *storage* and
  *preferences* fields.
- Badge verification workflows, reputation signals, moderation — Phase 8.
- Full Settings/privacy page, account export/deletion flows — later polish; Phase 4
  needs only the minimum account/session lifecycle (sign up, sign in, sign out).
- Space weather zone alerts (section 13) — Phase 7.

## 3. Dependencies this phase actually needs

- **Database.** Nothing exists yet (`grep` for `prisma`/`api routes` found none) —
  this phase requires standing up a database and an ORM/query layer, not just an
  auth library. This is the largest net-new infrastructure piece so far in the
  project.
- **Better Auth** (ADR 0003) — needs its own adapter for the chosen DB, session
  cookie config per section 22 (rotation/expiry/revocation).
- A geocoding/place-search lookup for Watch Zone creation (can start with a small
  static/seed place list, same posture as `seedEvents.ts`, rather than a live
  third-party geocoding API — avoids adding an external dependency prematurely).

## 4. Data model changes (representative, not final schema)

- `User` (id, email, passwordHash/session via Better Auth, createdAt)
- `Profile` (userId, handle, displayName, bio, approxRegion, createdAt)
- `Follow` (followerId, followeeId, createdAt) — composite unique key
- `WatchZone` (id, userId, name, label, lat, lon, radiusKm, categories[],
  severityThreshold, quietHours, paused boolean, createdAt) — never joined into any
  public-facing query.

## 5. Routes/components affected

- New: `/sign-in`, `/sign-up`, `/users/[handle]`, zone management UI (likely inside
  `/profile` rather than a new top-level route, per the nav table's existing
  Profile destination).
- `src/components/nav/*` — Profile nav item currently a "Phase 4" placeholder
  (`docs/checkpoints/PHASE-1.md` line 62) needs to become real.
- `GlobeMap`/`FeedScreen` — minimal "why you're seeing this" label wiring, gated on
  a zone/follow actually existing (no visible change for anonymous/no-zone users).

## 6. Accessibility requirements

Forms (sign up/in, zone creation) need labelled inputs, inline validation announced
via `aria-live`, keyboard-only completability, and error states that don't rely on
colour alone — consistent with the design-system baseline already in place from
Phase 1.

## 7. Testing plan

- Unit: Follow/WatchZone data-layer functions (create/pause/delete, uniqueness
  constraints), Better Auth session helpers.
- Playwright: sign-up → sign-in → create a Watch Zone → pause it → delete it;
  visiting another user's public profile never exposes zones.
- No regression risk to the GeoJSON-gated map code, since zone creation deliberately
  avoids drawn geometry.

## 8. Visual checkpoints

Desktop + Pixel 7 screenshots of: sign-in/sign-up forms, own profile (with zones),
another user's public profile (zones absent), zone creation flow, zone list with
pause/delete.

## 9. Risks

- **Database/infra decision not yet made** (only the auth *library* is decided, per
  ADR 0003 — no ADR yet for the database itself). This should be its own quick ADR
  before writing any schema, not decided implicitly by whichever code gets written
  first.
- **Scope size**: this is the first phase requiring persistent server-side state at
  all. Given the vertical-slice methodology used in Phases 1–3, Phase 4 should
  likely be split into two commits/checkpoints internally (auth+profiles, then
  follows+zones) rather than one large change, even though it's one phase.
- **GeoJSON gating** compounds here: if Watch Zone drawing is expected sooner than
  Phase 6, the map investigation needs to be revisited earlier than planned.

## 10. Why not implemented in this pass

This plan doc was requested before any Phase 4 implementation, per explicit
sequencing. Phase 4 requires a net-new database/infrastructure decision (no ADR
exists yet) and Better Auth wiring — starting that without a documented DB choice
would be exactly the kind of implicit architectural decision the ADR process in this
project exists to avoid. Recommended next step: a short ADR for the database/ORM
choice, then implement Phase 4 as its own dedicated pass.
