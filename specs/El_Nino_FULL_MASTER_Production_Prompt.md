# EL NIÑO — FULL PRODUCTION MASTER PROMPT

> Source: `El_Nino_FULL_MASTER_Production_Prompt.pdf` (2026-07-31). This document
> **supersedes** [`El_Nino_Master_Prompt_Draft_3_Pages.md`](./El_Nino_Master_Prompt_Draft_3_Pages.md)
> as the authoritative specification.

Redesign and expansion specification for the existing weather-only social platform.

> **Local status note (not part of the original spec):** this document was written
> assuming an existing El Niño codebase to audit and preserve. On 2026-07-31 the user
> confirmed no such codebase exists on this machine — this project started greenfield
> in Phase 0 (see [`../docs/MIGRATION_STRATEGY.md`](../docs/MIGRATION_STRATEGY.md) and
> [`../docs/TECH_DEBT.md`](../docs/TECH_DEBT.md)). Every instruction below that assumes
> "the existing application" should be read as **N/A — nothing to audit or preserve**
> unless/until a prior implementation is located. The design direction, product
> boundaries, phases, and technical requirements remain fully applicable to new work.

**Core direction:** Retain and improve the existing El Niño web application. Combine
the map-first structure of Concept 3 with the immersive globe experience of Concept 6.
Keep the interface basic, mature, fast and non-AI-looking. Provide localised official
warnings without a separate disaster mode.

---

## Contents

- Part I — Skills, tools and setup

1. Master operating instruction
2. Existing application audit and preservation
3. Product vision and boundaries
4. Users, jobs and success measures
5. Approved design direction
6. Information architecture and navigation
7. Home globe and map experience
8. Vertical video feed
9. Discover, search and event pages
10. Upload and contributor workflow
11. Localised official warning system
12. Watch Zones and personalisation
13. Space weather section
14. Profiles, reputation and social features
15. Moderation, verification and trust
16. Admin and operations
17. Weather and geospatial data layer
18. Frontend architecture
19. Backend, database and APIs
20. Media processing and delivery
21. Realtime, notifications and background jobs
22. Security, privacy and safety
23. Accessibility, localisation and resilience
24. Testing and quality assurance
25. Performance and cost control
26. Deployment, observability and operations
27. Delivery phases and checkpoints
28. Documentation and handover
29. Definition of done
30. Final Claude Code execution block

- Appendix A — Initial route map
- Appendix B — Initial environment variables
- Appendix C — Production checklist
- Appendix D — Screen-by-screen build specification
- Appendix E — API and event contract outline
- Appendix F — Claude Code working rules
- Appendix G — Final build evidence package

---

## Part I — Skills, tools and setup

Do this part first. The purpose is to give Claude Code a disciplined set of reusable
project skills and a reliable development environment before it modifies the existing
application. The skills are local project instructions, not vague personality prompts.
Each one must have a narrow responsibility, clear inputs, required checks and a defined
output. Store them in the project so later sessions can reuse the same standards.

### A. Local skill set (create under `.claude/skills/<name>/SKILL.md`)

Each skill below must document purpose, activation conditions, required inputs,
workflow, checks, output format and stop conditions. Keep each concise enough to be
followed repeatedly; link to project documentation rather than duplicating changing
technical details. Every skill must write findings to the repository as an artefact,
not leave them only in terminal output.

- **codebase-auditor** — maps the existing repository: frameworks, entry points, data
  flows, dead code, duplicate systems, secrets risk, test coverage, high-risk
  dependencies. Never deletes or rewrites code during audit.
- **migration-planner** — turns the audit into a staged preservation/migration plan:
  keep, refactor, replace, defer, remove decisions with evidence.
- **product-guardian** — checks every proposed feature against the weather-only
  boundary, the no-disaster-mode rule, localised warnings, and the approved Concept 3
  - Concept 6 design direction.
- **ui-consistency-reviewer** — enforces typography, spacing, colour, icon, motion,
  layout and responsive rules; rejects generic AI-dashboard patterns.
- **map-geospatial-engineer** — owns MapLibre integration, globe/map interaction,
  clustering, geospatial indexes, view-state persistence, privacy-safe coordinates,
  weather overlays, map performance.
- **weather-data-integrator** — provider-neutral adapter layer for forecasts,
  observations, warnings, radar/satellite metadata, space-weather feeds; handles
  attribution, licensing, caching, freshness, fallback, outages.
- **media-pipeline-engineer** — resumable uploads, metadata extraction, transcoding,
  thumbnails, adaptive playback, object storage, signed URLs, moderation states,
  background jobs, media retention.
- **trust-safety-reviewer** — upload rules, misinformation controls, reporting,
  reputation, warning labels, location privacy, abuse prevention, moderator workflows.
- **security-privacy-reviewer** — threat-models auth, sessions, uploads, APIs,
  geolocation, push, admin functions, logs, third-party services; blocks insecure
  defaults.
- **test-quality-engineer** — unit/integration/contract/e2e/accessibility/visual/
  performance tests; keeps a requirements-to-tests traceability map.
- **performance-cost-engineer** — budgets client JS, map memory, video startup, API
  latency, worker throughput, storage, egress, provider usage.
- **release-documentation-manager** — maintains README, setup scripts, ADRs,
  migration notes, env-var reference, runbooks, changelog, production checklist,
  release evidence.

### B. Tool and dependency installation policy

Use the existing repository as the source of truth. Detect OS, package manager,
runtime versions and framework before installing anything. Prefer the project's
existing package manager when healthy; migrate to pnpm only when low-risk and
documented. Choose the smallest coherent stack that meets requirements.

- Node.js LTS via a reproducible version manager; commit the version file.
- Strict TypeScript for new application code; migrate existing JS progressively.
- ESLint (type-aware rules) + Prettier + editor settings + pre-commit + CI enforcement.
- Vitest for unit/component tests unless a healthy equivalent exists; Playwright for
  e2e/visual/browser workflow tests.
- Docker Compose for local infra (Postgres, Redis, object storage emulation, mail/push
  stubs). Don't force the frontend into Docker if native dev is faster.
- PostgreSQL with geospatial support; choose Prisma or Drizzle after auditing the
  current data layer and record the choice as an ADR.
- Redis only for explicit needs (queues, rate limits, caches, realtime coordination).
- BullMQ (or similar) for transcoding, thumbnails, notification fan-out, event
  grouping, feed ranking updates, scheduled ingestion.
- MapLibre for map/globe presentation where licence-compatible.
- FFmpeg + Sharp for media derivatives, pinned versions, tested against real phone
  footage.
- S3-compatible object storage + CDN-ready URLs; local dev may use an emulator.
- Better Auth, Clerk, or the existing auth solution — based on migration cost,
  ownership, privacy, mobile roadmap, operational complexity.
- Sentry (or equivalent) + PostHog (or equivalent) only after consent, retention and
  data-classification rules are defined.
- GitHub Actions (or existing CI) for lint, typecheck, tests, build, security checks,
  artefact retention.
- One dependency updater (Dependabot or Renovate), not both, unless documented split.
- Only official/well-maintained MCP servers, verified publisher/permissions/data
  access. Never an unknown skill/MCP server with unrestricted filesystem, browser,
  shell or secret access.

### C. Recommended Claude Code connections

Enable only when available and useful; the build must remain understandable without
them. Document each connection, its permissions, and how to disable it: filesystem/
shell access scoped to the project; Git/GitHub (no direct push to protected
production branch); Playwright/browser automation; database inspection (dev only,
production read-only and separately authorised); documentation lookup (primary docs
preferred); design-file access only when an actual design source is provided; cloud/
deployment access through least-privilege, environment-specific credentials.

### D. Setup scripts and verification

Cross-platform, idempotent scripts (PowerShell for Windows, shell for macOS/Linux).
Required outputs:

```
scripts/setup-windows.ps1
scripts/setup-unix.sh
scripts/verify-environment.mjs
scripts/dev.ps1
scripts/dev.sh
scripts/reset-local-data.ps1
scripts/reset-local-data.sh
docs/SETUP.md
docs/ENVIRONMENT.md
docs/TROUBLESHOOTING.md
.env.example
```

Scripts must: verify runtime/package-manager versions; verify native binaries
(FFmpeg, image codecs); verify local DB/queue/object-storage connectivity; verify env
vars without printing secrets; run lint/typecheck/unit tests/a minimal browser smoke
test; create deterministic seed accounts/events/warnings/videos; write
`artifacts/setup-verification.json` and `artifacts/setup-verification.md`.

---

## 1. Master operating instruction

Lead product architect, design-system owner, senior full-stack engineer, geospatial
engineer, media-platform engineer, security reviewer and delivery manager for El Niño.
Redesign and extend the _existing_ application — not a greenfield demo (see status
note above for this project's actual state).

**Non-negotiable:** Never discard the existing application merely because starting
over is easier. A rewrite is permitted only for a bounded subsystem when the audit
shows migration is more expensive/risky than replacement. Preserve behaviour, data
and user-facing URLs where practical.

- Locate the application root and read the repository before asking the user to
  repeat discoverable information.
- Create a new working branch before modifications; tag/archive current state.
- Keep the product weather-only (terrestrial weather, climate-relevant conditions,
  natural atmospheric events, or space weather affecting Earth).
- No disaster mode — localised official warnings inside the normal product
  experience.
- Design blend: Concept 3 (map-first) + Concept 6 (immersive globe).
- Interface basic in the positive sense: obvious navigation, restrained styling,
  familiar controls, low cognitive load, minimal decoration.
- Never copy proprietary TikTok/Instagram/Snapchat/Apple/Google assets, layouts or
  code — benchmark only.
- Never present mock data as live; every screen distinguishes live, delayed,
  forecast, archived, community-reported, demonstration data.
- No feature is complete without tests, error/loading/empty states, accessibility
  checks, analytics events where appropriate, and documentation.
- Work in checkpoints; run the verification suite and leave the repo usable at the
  end of each.

## 2. Existing application audit and preservation

_(N/A for this project — no prior codebase found. If one surfaces, run this section in
full before further product work.)_

Required before product work: identify frontend/backend stack, map user journeys, run
the app and capture screenshots (desktop + mobile), run existing tests/build/lint and
record failures honestly, identify performance/security/design-consistency issues,
identify data-migration risk.

Audit outputs (when applicable):

```
docs/audit/EXECUTIVE_SUMMARY.md
docs/audit/REPOSITORY_MAP.md
docs/audit/SCREEN_INVENTORY.md
docs/audit/DEPENDENCIES.md
docs/audit/SECURITY_RISKS.md
docs/audit/PERFORMANCE_BASELINE.md
docs/audit/DATA_AND_MIGRATION.md
docs/audit/KEEP_REFACTOR_REPLACE_MATRIX.md
artifacts/audit/screenshots/
artifacts/audit/test-results/
```

The keep-refactor-replace matrix lists each major subsystem/component with one
decision (keep/refactor/replace/remove/defer), evidence, user impact, migration
strategy, rollback plan, risk. Major redesign work must not begin until this matrix
exists.

## 3. Product vision and boundaries

El Niño is a weather-only social and information platform: an interactive globe, map
layers, short user videos, official reports, event pages, and space-weather events
affecting Earth. Not a general social network, emergency-management system, generic
news feed, or scientific forecasting lab.

**Allowed content:** current conditions and notable weather events (rain, storms,
hail, lightning, cyclones/hurricanes/typhoons, tornadoes, snow, ice, heat, cold, fog,
wind, dust, smoke, visibility); flooding/storm surge/bushfire-weather conditions
where the weather connection is direct; auroras, solar flares, CMEs, geomagnetic
storms, radio blackouts, GPS disruption, satellite effects, meteor events; official
warnings/forecasts/observations/radar/satellite imagery/explanatory reports; weather
journalism and educational context; user media directly showing weather or its
immediate effects.

**Out of scope:** general entertainment/lifestyle/political/unrelated breaking news;
a separate disaster-mode interface, emergency dispatch, evacuation management,
missing-person coordination, public-safety command; unverified claims presented as
official; weather-modification/conspiracy/sensational content without evidence;
complex gamification or streak pressure encouraging dangerous storm-chasing; an
AI-first UI (AI supports classification/moderation/assistance only).

## 4. Users, jobs and success measures

Personas: Local observer, Family watcher, Weather enthusiast, Storm chaser/field
reporter, Meteorologist/verified specialist, Newsroom/researcher, Moderator/operator,
Casual explorer.

Primary jobs: show local weather now; show significant weather worldwide; map marker
→ videos + official context in one action; warn me for my area/followed locations;
share footage quickly while protecting precise location; judge official vs.
verified vs. unconfirmed vs. disputed; coherent event timeline (not duplicate
uploads); explain space-weather impact without sensationalising.

Success measures (define before release): time to relevant content, map-to-video
conversion, warning relevance, upload completion, verification quality, playback
quality, trust correction time, retention by utility (not compulsive engagement),
operational reliability, accessibility quality.

## 5. Approved design direction

Blend Concept 3 (map-first structure) + Concept 6 (immersive globe).

**Visual character:** deep charcoal/midnight surfaces for globe & immersive media;
lighter neutral surfaces for long text/settings/admin; restrained weather-derived
accents (cool blue, teal, warning amber, critical red) — not flooded with status
colour; native/highly readable sans-serif with hierarchy by size/weight; moderate
corner radii only where needed (not every section in a card); one consistent icon
set; real weather imagery/maps/radar/video as content, decoration secondary;
explanatory (not ornamental) motion; elevation used sparingly (contrast/spacing over
stacked panels). **No** glassmorphism, neon glow, generic gradients, large AI-style
hero headings, decorative blobs, or control-room-dashboard feel.

**Design tokens:** colour (canvas, surface, raised, text, muted, divider, action,
warning, critical, success, map overlays), type (display, title, heading, body,
label, caption, numeric), spacing (4/8/12/16/24/32/48), radius (0/6/10/16, pill for
tags/compact controls only), motion (instant/fast/standard/map/reduced-motion),
elevation (flat/overlay/modal), layout (content widths, safe areas, nav heights, map
controls).

**Responsive:** mobile = single-primary-surface (no permanent sidebars/multi-column
grids); tablet may show globe/map beside an event panel; desktop may use map +
content rail but feed stays focused, not a dense dashboard; respect safe-area
insets/orientation/one-handed reach; preserve playback state and map location across
resize/rotation; responsive density, not just scaling.

**Signature transition:** globe → place → content (camera flight → compact event
sheet → feed). Interruptible, accessible, fast. Reduced motion → crossfade + instant
reposition.

## 6. Information architecture and navigation

Mobile nav: **Globe, Feed, Upload, Alerts, Profile**. Discover and Search reached from
headers, not extra nav slots. Same destinations on desktop (rail or top bar),
consistent labels/order.

| Destination | Purpose                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| Globe       | Default discovery surface: activity, clusters, layers, search                                                            |
| Feed        | Vertical weather-video feed (location/zones/activity/preferences)                                                        |
| Upload      | Primary contribution action                                                                                              |
| Alerts      | Official localised warnings, Watch Zone warnings, notification history (community posts never appear as official alerts) |
| Profile     | Identity, contributions, saved content, Watch Zones, preferences, privacy, account settings                              |

Rules: preserve globe view/feed position/active event across tabs; deep links open
specific content with an obvious route back; predictable back behaviour; auth gates
only for follow/upload/comment/save/alert-preference actions (viewing is open); bottom
sheets on mobile, not stacked; upload prominent but not oversized/detached.

## 7. Home globe and map experience

Open on a simplified globe with active markers, clusters, and user's approximate area
(if permitted). Clear globe/flat-map toggle (persists). Marker density/scale/animation
encode content presence, not invented severity unless explicitly labelled. Tap cluster
→ zoom/regional summary; tap event → compact preview (title, status, time, source
mix, representative media). Search by place/event/weather type from the globe.
Optional layers: official warnings, radar, satellite, temperature, wind, precipitation,
space-weather impact — only essentials visible by default, all with freshness +
attribution. Truthful empty/delayed states, never fabricated activity.

Edge cases: reduced detail on low-end devices; flat-map/list fallback if no WebGL;
neutral global view + place search if location denied; base map retained + small
error if a layer provider fails; never disclose a contributor's exact home/private
location.

## 8. Vertical video feed

Autoplay only the active item; pause/release hidden items as they leave the
virtualised window. Vertical swipe + keyboard/button controls. Overlay only essential
info (location precision, time, weather type, contributor, verification state, event
link) with a restrained scrim. Mute-state persistence, captions, progress, data-saver.
Feed scopes: For You, Nearby, Following, event, place — without fragmenting into many
unrelated feeds. Explain non-obvious recommendations. Never reward/promote unsafe
proximity to storms/hazards — add context instead.

Edge cases: portrait/landscape/square without cropping evidence; slow/intermittent/
metered network fallback; never autoplay with sound unintentionally; explain removed
media by category without exposing private moderator notes; label unverified/
disputed/reused footage prominently.

## 9. Discover, search and event pages

Discover: a restrained curated set (active events, nearby activity, notable space
weather, followed-zone updates) — not a dense trend grid. Search: places, event
names, weather types, dates, contributors, grouped by type with freshness. Event page:
title, verified status, summary, time range, affected area, official warnings
(separate section), map, timeline, videos, sources. Status vocabulary: developing,
active, easing, ended, archived (not a substitute for warning severity). Timelines
group meaningful updates; filter by official/verified/all. Archive pages make the
historical date unmistakable.

Edge cases: cross-border/cross-timezone events; providers naming the same event
differently; automated grouping errors need moderator merge/split tools; search
tolerates misspellings without exposing private upload locations; archived links stay
stable after renames.

## 10. Upload and contributor workflow

Show the weather-only rule before submission. Extract available metadata locally;
never silently publish sensitive metadata. Location via current-location/map-pin/
place-search/approximate-area with a precision-reduction explanation. Weather type,
short caption, event association, live-vs-recorded disclosure. Lightweight client
checks → resumable chunked upload with progress/pause/resume/retry. Post-upload
states: processing, review, published, limited, rejected (never instant). Optional
auto-captions/translation with contributor review. Clear rights statement (ownership,
display licence, separate consent for licensing/newsroom use).

Edge cases: faces/plates/addresses/children/private property in footage; inaccurate/
absent/inconsistent GPS; unsupported codecs/variable frame rate/HDR/damaged metadata;
duplicates/screen recordings/old footage/compilations/generated media; upload spanning
mobile data → Wi-Fi.

## 11. Localised official warning system

No disaster mode, no interface takeover. Warnings for current approximate area,
manually selected home area, and Watch Zones per preference. Compact banner/chip on
Globe & Feed when relevant; tap → detail. Alerts destination lists active/recently-
ended/acknowledged with source, issue/update time, affected area, official link.
Event pages show related warnings in a clearly labelled official section. Map layers
show warning polygons where available. Push notifications opt-in/permission-based,
configurable by zone/category/severity; quiet hours may suppress low priority but
never silently override user-selected critical categories. Official warnings and
community reports never share a badge or wording.

Edge cases: provider updates/cancels/replaces/duplicates; overlapping polygons /
differing severity vocabularies; stale device location (show timestamp, avoid false
precision); delayed/unavailable provider feeds (never synthesize an official warning
from community activity); cross-border users may get warnings from multiple
authorities.

## 12. Watch Zones and personalisation

Create zones by place search, map area, or administrative region. Each zone: name,
location, radius/region, event preferences, independent notification settings.
Suggested labels (Home, Family, Work, Farm, Holiday) but user-chosen. Zones influence
feed/globe/alerts/digests without hiding global exploration. Pause/mute/quiet-hours/
delete per zone. Never revealed publicly on profiles.

Edge cases: large zones → notification/query cost limits (explained); overlapping
zones → deduplicated notifications preserving match reason; cross-timezone travel;
deleted zone stops future notifications immediately.

## 13. Space weather section

Dedicated entry from Globe/Discover/top-level filter (doesn't displace the 5 main nav
items). Current conditions + notable events (flares, CMEs, geomagnetic activity,
aurora potential, radio blackouts, GPS impacts). Plain-language impact explanations,
clearly separating observed/forecast/model-estimate. Globe aurora/geomagnetic layers
only when data supports it, with timestamps. Watch Zone aurora/disruption alerts.
Source attribution; avoid sensational language about grids/satellites/comms.

Edge cases: uncertain arrival times/impacts (show ranges + confidence); differing
severity scales across agencies; aurora visibility ≠ geomagnetic activity guarantee;
preserve technical source wording alongside plain-language summary.

## 14. Profiles, reputation and social features

Profile: display name, weather-focused bio, optional approximate region, uploads,
saved collections, badges. Following aids discovery but doesn't dominate ranking over
relevance/freshness/verification. Transparent reputation signals (accurate location,
confirmed reports, constructive corrections, moderation history) — no opaque single
score. Badges (Verified Observer, Meteorologist, Emergency Service, Researcher, Storm
Chaser, Top Contributor) require manual verification + expiry/revalidation for
sensitive ones. Bounded-depth comments with report/moderation. Saved content private
by default. Blocking/muting/comment controls.

Edge cases: impersonation of agencies/professionals; misleading footage from popular
contributors; reputation recovers from corrected mistakes but responds to deliberate
deception; blocking must be consistent across comments/follows/mentions/notifications.

## 15. Moderation, verification and trust

Visible state vocabulary: **Official, Verified, Likely, Unconfirmed, Disputed, False/
Removed** — documented meanings. Automated systems suggest, never claim official
status. Confidence assessment combines metadata consistency, nearby reports, official
observations, media similarity, trusted-review signals — explainable. Trusted-user
confirmation without exposing hidden private metadata. In-context corrections for old
footage/wrong location/misleading captions. Specific report reasons. Audited,
role-based critical actions.

Edge cases: genuine footage reposted with wrong event/date; disclosed editing is
still valid; AI-detection is probabilistic, not proof; official sources can
correct/withdraw; high-volume events need risk/reach-prioritised queues.

## 16. Admin and operations

Separate protected admin app/route group, role-based access. Queues: reported media,
suspicious uploads, appeals, event merge/split suggestions, warning ingestion
failures, provider outages. Event editing with aliases/geometry/status/summary/
sources/merge/split/audit history. User & badge management with reason fields.
Operational dashboards (queue depth, ingestion freshness, notification delay, API
errors, storage growth). Tables/detail panels over consumer cards. Bulk actions
preview impact and require confirmation for destructive changes.

Edge cases: accidental merges of unrelated global events; provider replay of old
records after outage; high-risk actions may need a second reviewer; admin search must
be permission-scoped and logged.

## 17. Weather and geospatial data layer

Provider-neutral integration layer — no provider hard-wired throughout the UI. Every
integration defines source, licence, attribution, caching, freshness, coverage, rate
limits, failure behaviour, cost.

**Adapter contract:** current observations, forecasts, warnings, radar/satellite,
event identifiers, space weather — each with source metadata/timestamps/original
terminology preserved.

**Normalisation:** preserve raw payloads/references where licence permits; normalise
units while retaining originals; UTC storage + explicit local-tz display; never infer
official severity from community engagement; idempotent ingestion (no duplicate
warnings/events on reprocess); expose source freshness to monitoring + UI.

**Geospatial:** indexes for event geometry, warning areas, upload coordinates, Watch
Zones; bounded point-in-polygon/distance queries; public approximate coordinates for
community content, precise coordinates only when required/protected/retention-
governed; handle anti-meridian/poles/multi-polygons/invalid geometries; tile/
server-side aggregation for global scale; cache viewport queries by spatial key +
freshness.

## 18. Frontend architecture

Choose React+Vite or Next.js after auditing the existing codebase (N/A here —
greenfield choice to be made and recorded as an ADR when work begins). Either is
acceptable if documented and the interactive core stays fast.

**Boundaries:** consumer web app (globe/feed/upload/events/alerts/profiles/settings);
admin app/protected route bundle; shared design system (tokens/primitives/icons/
form/media/map-overlay controls); shared typed API client/schema; shared domain types
that don't leak DB details into UI.

**State/data:** server-state tooling for caching/retry/invalidation/cancellation;
transient UI state local unless it must survive navigation; persist only deliberate
preferences (mute, data saver, map mode, warning settings); URL state for shareable
filters/events/map views; avoid one giant global store.

**Components:** loading/empty/error/disabled/offline/permission-denied states
required; labelled/validated/recoverable forms; keyboard-accessible/screen-reader-
labelled media controls; touch-friendly map controls respecting safe areas; no local
one-off colours/spacing when a token exists.

**PWA:** installable/resilient nav where sensible; never cache live warnings/changing
weather data indefinitely; cache shell/preferences/static assets/recent content with
explicit expiry; mark stale data; queue offline uploads for resume, not silent
publish.

## 19. Backend, database and APIs

Modular backend, clear domain boundaries — a well-structured modular monolith
initially; no premature microservices; separate workers/media processing where
operational isolation helps.

**Core domains:** identity & access; media; content; events; weather; Watch Zones &
notifications; trust & safety; operations.

**Database principles:** stable opaque IDs (no harmful sequential enumeration);
consistent created/updated/deleted timestamps, soft-delete only where needed; FK/DB
constraints for critical integrity; geospatial types (not lat/lng strings);
partition/archive high-volume telemetry; encrypt sensitive values at rest, avoid
storing precise location unless required; forward-safe migrations with rollback
instructions; fictional, clearly-labelled, geographically varied seed data.

**API standards:** versioned/typed HTTP APIs (realtime complements, doesn't replace
durable reads); validate every request/response at the boundary; cursor pagination;
idempotency keys for finalisation/follows/saves/preference updates/high-risk admin
actions; machine-readable error codes + safe human messages; authorisation at every
protected boundary; published API schema; stable public event/media URLs.

**Representative data model:** User, Profile, Role, BadgeVerification, Follow, Block,
WatchZone, WarningPreference, NotificationEndpoint, MediaAsset, MediaVariant,
UploadSession, Post, CaptionTrack, Comment, Reaction, Save, WeatherEvent, EventAlias,
EventGeometry, EventUpdate, EventSource, PostEventLink, OfficialWarning,
WarningRevision, Provider, ProviderIngestionCursor, MapLayer, ModerationReport,
ModerationCase, VerificationAssertion, Appeal, AuditLog, BackgroundJobRecord.

## 20. Media processing and delivery

**Upload pipeline:** authenticated session (size/type/checksum) → chunked signed
uploads → persisted chunk completion (resumable across network sessions) →
idempotent finalisation → enqueue validation/inspection → container/codec/duration/
dimensions/frame-rate/audio/metadata/corruption checks → safe preview + moderation
proxy → transcode variants/posters/thumbnails → classification/transcription/
duplicate-detection/privacy-risk checks → publish only after required checks with
visible status → CDN delivery with signed/public URLs per content state.

**Derivatives:** adaptive streaming variants; progressive fallback; poster/preview/
moderation-proxy/social-share images; captions + translated tracks with provenance;
blurred/redacted derivatives for privacy correction without deletion; audio-
normalised variants only when not distorting evidence.

**Safety & rights:** strip unnecessary metadata from public derivatives; malware/
content-validation scanning; duration/resolution/file-size limits by account state;
copyright reporting/takedown workflow; documented retention policy (not forever by
default); never train models on user media without a separate explicit policy/
consent basis.

## 21. Realtime, notifications and background jobs

Realtime is selective (active events, warnings, upload progress, comments/moderation,
admin queues); durable state stays in the database; clients recover via cursor/
version refetch after disconnection, not an assumption nothing was missed.

**Notifications:** consent + channel-specific preferences; dedupe/group; clear match
reason (area, zone, followed event/contributor); quiet hours + timezone rules;
immediate unsubscribe for non-essential categories; minimal retained delivery data;
retry with expiry (no stale warning pushes after expiry).

**Jobs:** idempotent, versioned, retry-safe; dead-letter/failed-job review queues
with actionable context; concurrency/rate limits by provider/workload; warning
ingestion + visible upload completion prioritised over non-urgent analytics; exposed
queue depth/oldest-job-age/success-rate/retry-count; replay/backfill procedure for
provider outages.

## 22. Security, privacy and safety

Written threat model before production release, updated on architecture change.

**Security controls:** secure session cookies/tokens with rotation/expiry/revocation/
device-aware risk; rate limits on auth/uploads/comments/follows/search/reports/admin
actions; validate file content (not extension/MIME trust); signed, scoped, expiring
URLs for non-public content; CSP/secure headers/CSRF/strict CORS; separated secrets
per environment, never committed; least-privilege service accounts; security-relevant
logs without tokens/passwords/precise private locations/full sensitive payloads;
dependency/container/secret scanning in CI; stronger auth + short sessions for
admins.

**Location privacy:** no exact coordinates published by default (locality/grid/fuzz);
explain what's public and why location is needed; allow reduction/removal post-
publication where legal/integrity rules permit; no movement history or home/work
inference; Watch Zones private and excluded from public analytics exports; location
denial never blocks browsing.

**Safety design:** never encourage dangerous proximity for engagement; contextual
safety messaging without replacing official instructions; no competitive badges for
risky proximity/earliest-arrival/most-extreme footage; rapid removal/obfuscation of
accidental PII; clear reporting for threats/harassment/doxxing.

## 23. Accessibility, localisation and resilience

**Accessibility:** WCAG 2.2 AA for core journeys (document map-specific limits);
keyboard nav, visible focus, semantic headings, labelled controls, screen-reader
announcements; captions/transcripts for spoken media; list alternative to map-only
info; respect reduced motion/contrast/text-scaling/colour-vision; severity conveyed
by text+icon, not colour alone; mobile-appropriate touch targets.

**Localisation:** externalise all strings from the start; local date/time/number/
measurement preferences with a consistent internal unit system; preserve official
warning wording + labelled translated summaries; RTL-ready design system even if not
launched first release; reliable geocoding place names, preserving local names.

**Resilience/degraded modes:** map failure → list of active events/warnings;
realtime failure → periodic refresh; provider failure → show last successful update
time, never blend stale with current invisibly; delayed derivatives → poster +
processing state, not a broken player; analytics/error-reporting failure never blocks
core use; offline → cached content with explicit stale label, retained upload
drafts.

## 24. Testing and quality assurance

Requirements-to-tests matrix focused on user risk and system boundaries. Regression
tests before refactoring intentionally-preserved behaviour.

**Layers:** unit (normalisation, geospatial matching, warning lifecycle, privacy
transforms, ranking, permissions); component (feed/map/warning-banner/upload/forms/
a11y); integration (DB transactions, queues, storage, provider adapters,
notifications, auth); contract (recorded provider fixtures + schema checks); e2e
(browsing, sign-in, globe-to-video, upload, Watch Zones, warnings, comments,
reporting, admin review); visual regression (mobile/tablet/desktop); performance
(feed playback, clustering, viewport APIs, upload concurrency, warning ingestion);
security (authz, object access, injection, file validation, rate limits, admin
boundaries); recovery (provider outage, queue retry, duplicate jobs, interrupted
uploads, deployment rollback).

**Quality gate** (a checkpoint isn't complete unless): lint passes; typecheck passes;
unit+integration tests pass; required Playwright journeys pass; accessibility scan
has no unreviewed critical issues; performance budgets checked; migrations tested
from clean DB and representative prior state; screenshot/video evidence saved;
documentation + changelog updated.

## 25. Performance and cost control

Set budgets before optimising; measure on real devices/networks. Globe + vertical
feed are the biggest risk areas.

**Client:** minimise initial JS, defer admin/upload/advanced layers (but not the
default-route globe); virtualise feeds/lists, cap retained media elements; responsive
images/variants; no continuous animation when hidden/idle/reduced-motion; profile
memory after long sessions; no overlay downloads outside viewport/selected time.

**Server/cost:** cache provider results per licence/freshness rules; viewport/cluster
APIs instead of all global points; bounded, indexed geospatial searches; transcode
only likely-used variants; lifecycle rules for failed uploads/abandoned chunks/temp
derivatives/old logs; monitor CDN egress/storage growth/queue compute/geocoding/
provider API cost; feature flags for expensive new layers/ranking experiments.

Record baseline + post-change measurements (startup, globe interactivity, map pan,
feed video start, upload completion, viewport API latency, warning-ingestion delay)
in `docs/performance` with device/browser/network/dataset-size context.

## 26. Deployment, observability and operations

Local/staging/production with separate data & credentials, documented and
reproducible; avoid platform lock-in without clear benefit.

**Deployment:** immutable builds, versioned worker images; automated migrations with
pre-deploy checks + rollback; health/readiness/liveness checks; rolling/blue-green
for upload/realtime-handling services; staging credentials + synthetic fixtures (no
real warning notifications in testing); env-specific feature flags/notification
endpoints; tested backup/restore/DR; object storage lifecycle/replication/deletion
policy.

**Observability:** structured logs with correlation IDs; metrics for latency/error
rate/queue depth/ingestion freshness/notification delay/playback errors/upload
completion/storage growth; distributed traces where useful; client error reporting
without sensitive location/media data; alerts tied to user impact + runbooks;
operational status page for major incidents.

**Runbooks:** provider warning feed delayed/replaying; upload queue backed up; video
playback failure spike; push delivery delay; map tile/geocoding outage; DB migration
failure; account compromise/exposed credential; misinformation incident on highly
viewed content; object storage/CDN outage.

## 27. Delivery phases and checkpoints

Implement in usable vertical slices — no weeks of infra with no working user path.
Each phase ends with a demonstrable build, tests, documentation, and a written
comparison against acceptance criteria.

| Phase                                  | Required outcome                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Audit and baseline                 | Skills created; original app inspected/run; evidence captured; keep/refactor/replace matrix; reversible branch + environment   |
| 1 — Design system & nav shell          | Tokens, responsive shell, navigation, common states, Concept 3+6 visual foundation, existing routes preserved where possible   |
| 2 — Globe, map & event read experience | Globe, flat-map fallback, viewport API, clusters, event preview/page, official layer attribution (real or labelled dev data)   |
| 3 — Vertical feed & playback           | Virtualised feed, media variants, captions, controls, data saver, event/place scopes, trust labels                             |
| 4 — Auth, profiles & Watch Zones       | Accounts, profiles, follows, private zones, preferences, personalised globe/feed reasons                                       |
| 5 — Upload & media pipeline            | Resumable upload, metadata review, location privacy, transcoding, processing states, contributor rights controls               |
| 6 — Localised warnings                 | One reliable warning provider via adapter layer, matching, Alerts UI, map polygons, configurable pushes, expiry/cancellation   |
| 7 — Space weather                      | Sourced conditions/events/explanations, globe layers, zone preferences                                                         |
| 8 — Trust, moderation & admin          | Reports, confidence states, queues, corrections, event merge/split, badge verification, audit logs                             |
| 9 — Hardening & production launch      | Accessibility, security, performance, provider failure, backups, observability, runbooks, privacy review, production checklist |

**Checkpoint report** — `docs/checkpoints/PHASE-N.md`: scope completed; existing code
reused; code refactored/replaced and why; screens/routes delivered; DB/API changes;
test evidence; accessibility/performance results; known limitations; migration/
rollback instructions; next-phase recommendation.

## 28. Documentation and handover

Documentation lives close to the code, updated per phase — not one giant stale
README.

```
README.md
docs/SETUP.md
docs/PRODUCT.md
docs/DESIGN_SYSTEM.md
docs/ARCHITECTURE.md
docs/DATA_MODEL.md
docs/API.md
docs/WEATHER_PROVIDERS.md
docs/MEDIA_PIPELINE.md
docs/TRUST_AND_SAFETY.md
docs/SECURITY.md
docs/DEPLOYMENT.md
docs/RUNBOOKS/
docs/ADMIN_GUIDE.md
docs/USER_GUIDE.md
CHANGELOG.md
docs/decisions/  (ADRs)
```

Handover requirements: clean-machine setup via documented scripts; every external
account/key/provider/licence requirement listed without exposing secrets; migration
path and retained components documented; local demonstration runnable with seeded
data; production operations don't depend on undocumented knowledge held only in
Claude output.

## 29. Definition of done

- Original codebase audited, keep-refactor-replace record exists (N/A here — record
  says greenfield).
- Concept 3 + Concept 6 design direction implemented consistently.
- Globe/map provide a fast route to event and video content.
- Vertical feed is performant, accessible, context-rich.
- Uploads resumable, privacy-safe, documented media pipeline.
- Official warnings localised, no disaster mode.
- Space weather integrated as a sourced first-class section.
- Official/verified/unconfirmed/disputed content visually and semantically distinct.
- Watch Zones private and independently configurable.
- Moderators can review reports/corrections/event grouping/provider failures.
- Tests cover critical journeys, permissions, warning lifecycle, provider failures,
  migration.
- Security/privacy/accessibility/performance/operational reviews complete.
- Setup/deployment/rollback/backup/restore/incident procedures documented and
  tested.
- No placeholder screen, fabricated live feed, or hidden broken route in production.
- Repository has clean history, reproducible builds, passing quality gates, a clear
  next roadmap.

## 30. Final Claude Code execution block

> Authoritative short instruction — the full document governs on conflict.

You are redesigning and extending the existing El Nino web application in the
current repository. Do not start from scratch. Begin with the local skills and
Phase 0 audit. Run the existing application, capture its current state, identify
what can be retained, create the keep-refactor-replace matrix and establish a
reversible migration plan.

The product is a weather-only social platform with an immersive interactive globe, a
map-first discovery structure, a fast vertical video feed, community uploads,
official weather information, localised warnings, Watch Zones, event timelines and
space weather affecting Earth. There is no disaster mode. Official warnings must
appear only when relevant to the user's current approximate area or chosen Watch
Zones, and they must always remain visually separate from community reports.

Use a blend of the approved Concept 3 and Concept 6 aesthetics. Make the globe the
signature visual element. Keep the UI basic, mature and highly usable: dark charcoal
immersive surfaces, restrained blue and teal accents, native readable typography,
minimal chrome, modest radii, subtle motion and clear hierarchy. Do not use
glassmorphism, decorative gradients, floating-card overload, oversized icons, neon
styling or a generic AI dashboard look. Do not copy proprietary visual assets or code
from other products.

Create the project skills and setup scripts described in this document. Install only
the coherent tools needed after auditing the current stack. Use strict validation,
typed contracts, PostgreSQL geospatial support, a resilient media pipeline,
provider-neutral weather adapters, safe location handling, tests, observability and
full documentation. Prefer a modular monolith plus workers over premature
microservices.

Work in phases. At every checkpoint, leave a working build, run lint, typecheck,
tests, browser journeys, accessibility checks and performance checks, save evidence
and update documentation. Never hide errors or present demonstration data as live.
Preserve user data, stable links and proven existing functionality where practical.

Begin now with Phase 0. Do not implement product features until the audit, baseline,
skill files, setup verification and migration plan are complete.

---

## Appendix A — Initial route map

| Route                | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `/`                  | Globe home and active event discovery              |
| `/feed`              | Vertical weather-video feed                        |
| `/discover`          | Active events and curated discovery                |
| `/search`            | Places, events, weather types and users            |
| `/upload`            | Capture, selection and upload workflow             |
| `/events/:eventSlug` | Event summary, timeline, map, warnings and media   |
| `/places/:placeSlug` | Place-centred conditions, events and uploads       |
| `/alerts`            | Localised official warnings and history            |
| `/space-weather`     | Space-weather conditions and events                |
| `/watch-zones`       | Private followed locations and preferences         |
| `/users/:handle`     | Public profile                                     |
| `/settings`          | Account, playback, privacy, notifications and data |
| `/admin`             | Protected operations overview                      |
| `/admin/moderation`  | Reports and cases                                  |
| `/admin/events`      | Event management                                   |
| `/admin/providers`   | Provider health and ingestion                      |
| `/admin/users`       | Users, roles and badges                            |

## Appendix B — Initial environment variables

Names are illustrative; align with the actual project. Never commit real values.

```
APP_ENV=development
APP_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OBJECT_STORAGE_ENDPOINT=http://localhost:9000
OBJECT_STORAGE_BUCKET=el-nino-local
OBJECT_STORAGE_ACCESS_KEY=...
OBJECT_STORAGE_SECRET_KEY=...
AUTH_SECRET=...
WEATHER_PROVIDER_PRIMARY=...
WEATHER_PROVIDER_API_KEY=...
SPACE_WEATHER_PROVIDER=...
MAP_STYLE_URL=...
MAP_TILE_TOKEN=...
PUSH_PUBLIC_KEY=...
PUSH_PRIVATE_KEY=...
FCM_CREDENTIALS_PATH=...
SENTRY_DSN=...
POSTHOG_KEY=...
FEATURE_FLAGS_SOURCE=local
```

## Appendix C — Production checklist

- [ ] Existing-app audit approved and rollback tag tested.
- [ ] Production environment variables and secret rotation documented.
- [ ] Database migration rehearsed on a representative copy.
- [ ] Backups and restore tested.
- [ ] Warning provider ingestion, update, cancellation and expiry tested.
- [ ] Location privacy review completed.
- [ ] Media upload abuse and file validation tested.
- [ ] Provider attribution and licensing reviewed.
- [ ] Accessibility audit completed for critical journeys.
- [ ] Mobile performance tested on representative low and mid-range devices.
- [ ] Global map performance tested with realistic event volume.
- [ ] Push notification consent, quiet hours and unsubscribe tested.
- [ ] Moderator and admin permissions penetration-tested.
- [ ] Error monitoring, dashboards and alert runbooks active.
- [ ] No demo or fabricated data visible in production.
- [ ] Terms, privacy, community rules, rights and takedown pathways published.
- [ ] Incident contacts and release rollback owner assigned.
- [ ] Post-launch metrics and review schedule defined.

## Appendix D — Screen-by-screen build specification

Each screen inherits shared navigation/typography/colour/spacing/motion/accessibility
rules; these are minimum production behaviour, not permission for isolated custom
designs.

- **Globe home** — clean Earth view, small search control, standard nav, restrained
  event indication; no multi-floating-panel opening state; compact layer control;
  remembers last view. States: loading (shell + lightweight Earth placeholder before
  interactive map code is ready), empty (truthful no-match message), error (flat list
  fallback if WebGL/tiles fail), permission-denied (manual search), selected-event
  (one compact preview sheet).
- **Flat map / regional view** — detailed geographic work surface; clusters, warning
  polygons, current location, Watch Zones, time-stamped layers; server-side
  clustering/tiling (never send every global report to the browser). States: loading
  (base map first, then overlays), no-layer-data, overlapping-features
  (disambiguation list), offline (cached + labelled stale, only if licensing
  permits), low-power (reduced animation/resolution/density).
- **Feed** — one active clip, context visible without covering evidence; explainable
  recommendation source; ranking values freshness/relevance/importance/verification/
  preference, penalises duplicates/misleading context/unsafe behaviour. States:
  loading (poster/skeleton, never a fake moving preview), playback-failure (retry
  once, offer variant, allow skip), removed-media (public reason category), data-
  saver, unverified-content (visible label + path to source).
- **Event detail** — header (event, area, status, time range, confidence); concise
  summary with last-update time; official warnings in their own section; timeline
  (official changes + trusted reports + representative media); map; event-scoped feed
  entry; stable links after rename/merge/archive. States: developing, ended (archive
  banner), merged (redirect + audit link), conflicting-sources (no manufactured
  certainty), no-official-warning (don't show an empty card implying one should
  exist).
- **Place detail** — sourced conditions, active warnings, nearby events, recent
  community footage for a city/region/selected area; observation/forecast
  timestamps; add-as-Watch-Zone; safe-precision community location grouping. States:
  unknown-place, no-observations (don't fabricate a temperature), multi-timezone,
  provider-disagreement (primary source + optional comparison, no silent averaging),
  private/sensitive place (restrict precise markers).
- **Discover** — curated index (small number of active events, nearby developments,
  space weather, explainers, Watch Zone updates); same primitives as rest of app;
  "trending" = meaningful weather-only activity, not raw engagement. States:
  quiet-period, regional-availability, sensitive-events (no sensational
  thumbnails/language), repeated-visits (update without full rearrangement),
  anonymous-use.
- **Search** — accepts natural phrases; groups current events/places/media/people/
  archived events; current vs. historical unmistakably different; suggestions never
  expose private zones/unpublished uploads/precise contributor locations; clearable
  private query history. States: no-results, ambiguous-place, old-footage (archive
  date shown before misleading thumbnail/title), unsafe-query (no harassment/location
  targeting facilitation), offline (cached-only, labelled).
- **Upload capture and review** — select/capture → review (location/time/category/
  caption/event/privacy) → upload/process; weather-only rule + metadata-publication
  understanding upfront; visible progress across in-app navigation; drafts survive
  recoverable interruption. States: no-location, metadata-conflict (confirm, don't
  silently overwrite), large-file, backgrounded-app (session preserved/resumed),
  rejected-content (reason + appeal/edit path).
- **Alerts** — active warnings first (grouped by place/authority, issue/update time);
  recently-ended retained without active colour treatment; match reason shown +
  adjustable; community reports linked as nearby reports, never inside the official
  list; provider freshness + route to original authority. States: no-active-warnings
  (calm empty state), provider-delayed (no green all-clear implication),
  duplicate-authorities (grouped, sources preserved), notification-opened-after-
  expiry, location-stale (last-used timestamp shown).
- **Watch Zones** — list of private zones with independent settings (place, radius/
  region, categories, severity threshold, quiet hours, channels); place-search or
  map-drawing creation; pause/reorder/delete; overlap-suppression explained; no
  public display, no family/routine inference. States: zone-too-large (explained
  limit), overlapping-zones (shown + combination explained), deleted-zone (immediate
  stop), timezone-change, provider-coverage-gap (disclosed).
- **Space weather** — calm source-first design mirroring terrestrial weather; current
  geomagnetic conditions, recent solar activity, forecast products, aurora potential,
  possible Earth impacts; plain-language definitions alongside technical scales;
  globe impact/visibility regions with time+uncertainty when supported; no
  guaranteed-aurora or guaranteed-Earth-impact implication. States: uncertain-arrival
  (window + confidence), no-earth-directed-impact (stated clearly), cloudy-local-
  weather (aurora potential ≠ viewing conditions), technical-provider-text (source +
  plain-language summary), delayed-source (update time shown, no AI-filled gaps).
- **Profile** — weather-contribution and trust focus; uploads, event participation,
  optional bio, verified badges, following controls; exact locations/private zones/
  moderation details hidden; badges link to definitions/verification status;
  restrained statistics, no pressure tactics; clear editing/privacy/export/deletion
  access. States: suspended-account, badge-expired (revalidation path), blocked-user
  (enforced across follows/comments/mentions/notifications), deleted-media (removed
  from counts or neutral unavailable state), private-account-option (documented
  behaviour before enabling).
- **Comments and discussion** — concise, bounded-depth threads; composer reminds
  weather-only + no private info; moderator-highlighted corrections (popularity ≠
  authority); report/mute/block; slower-mode during high volume; cautious link
  handling; never used as official warning instructions. States: high-volume-event
  (pagination/rate-limits/slow-mode), correction (authoritative correction stays
  visible even if original removed), harassment (block/report without further
  interaction required), deleted-parent (placeholder preserves child context),
  unsupported-language (report + optional labelled auto-translation).
- **Settings and privacy** — account/playback/notifications/Watch Zones/location/
  privacy/accessibility/language/units/data controls, grouped simply; export/
  deletion accessible without hidden support steps; warning-delivery-affecting
  changes show practical consequence before confirmation. States: OS-level
  notification-permission-denied (restore instructions), account-deletion (pending
  upload/moderation/legal-retention disclosure), unit-change (consistent across all
  displays), analytics-opt-out (core features continue), shared-device (sign-out
  clears sensitive local state).
- **Admin moderation case** — content, public context, reports, automated signals,
  metadata consistency, related events, prior actions, policy references; sensitive
  exact location/private evidence permission-gated; reasoned outcome selection
  (label/limit/remove/request-correction/escalate); every action records actor/time/
  reason/affected objects; appeals as linked work, not overwrites; evidence-and-
  tables design over consumer styling. States: viral-item (prioritised, but no single
  reviewer makes irreversible high-impact decisions alone), conflicting-automated-
  signals (uncertainty + source versions shown), copyright-claim (routed to legal
  workflow), emergency-service-badge (not exempt from policy review), moderator-
  conflict (reassignment recorded).

## Appendix E — API and event contract outline

Exact routes may change after a real repository audit, but the capabilities and
authorisation boundaries below must exist. Generate and keep a typed API
specification in source control. Public reads must never leak precise private
locations, unpublished media, private zones, or internal moderation data.

```
GET    /v1/globe/activity                 viewport-bounded clusters/events/freshness
GET    /v1/events                         cursor-paginated events (geometry/date/type/status)
GET    /v1/events/{id}                    public event summary + geometry + aliases + sources + timeline cursor
GET    /v1/events/{id}/media               authorised event media, feed cursor, variants, verification labels
GET    /v1/places/search                   geocoding abstraction (locale/country/limits)
GET    /v1/places/{id}                     place metadata, sourced products, active warnings, related events
GET    /v1/feed                            cursor feed (global/nearby/following/place/event/zone) + reason codes
POST   /v1/uploads                         create resumable upload session
PUT    /v1/uploads/{id}/parts/{part}       record/sign a chunk
POST   /v1/uploads/{id}/complete           idempotent finalisation, enqueue processing
GET    /v1/uploads/{id}                    owner-only processing/moderation state
POST   /v1/posts                           create post from processed asset
PATCH  /v1/posts/{id}                      authorised correction (caption/event/location precision/metadata)
DELETE /v1/posts/{id}                      deletion request + retention/reference consequences
GET    /v1/warnings                        warnings matched to query geometry or authenticated zones
GET    /v1/warnings/{id}                   revisions, official source, geometry, lifecycle status
GET    /v1/watch-zones                     authenticated user's private zones only
POST   /v1/watch-zones                     create bounded zone
PATCH  /v1/watch-zones/{id}                update geometry/name/quiet-hours/severity/channels
DELETE /v1/watch-zones/{id}                delete + cancel pending non-delivered notifications
GET    /v1/space-weather                   current/recent sourced products, observation/forecast classification
GET    /v1/search                          grouped place/event/media/user results with archive labelling
GET    /v1/users/{handle}                  public profile (block/visibility rules apply)
POST   /v1/users/{id}/follow                idempotent follow (block/rate-limit checked)
POST   /v1/posts/{id}/comments             create weather-related comment (validated/screened)
GET    /v1/posts/{id}/comments             cursor-paginated bounded-depth thread
POST   /v1/reports                         create specific report, return reference (no queue-priority leak)
GET    /v1/notifications                   in-app notification history + delivery reasons
PATCH  /v1/notification-preferences        update channel/zone/category/severity/quiet-hours
GET    /v1/admin/cases                     role-protected moderation queue
POST   /v1/admin/cases/{id}/decision        audited decision, required reason
POST   /v1/admin/events/merge               merge with preview/redirect/audit record
POST   /v1/admin/events/{id}/split          split with rollback data
GET    /v1/admin/providers                  provider health/freshness/cursors/error summaries
POST   /v1/admin/providers/{id}/replay      bounded authorised replay/reconciliation job
```

**Realtime event names:** `event.updated`, `event.media_added`, `warning.issued`,
`warning.updated`, `warning.cancelled`, `warning.expired`, `upload.progress`
(owner-only), `upload.action_required` (owner-only), `comment.created`,
`content.corrected`, `notification.created`, `provider.status_changed` (admin-only),
`moderation.case_updated` (admin-only).

## Appendix F — Claude Code working rules

Operating requirements for a long implementation, not optional suggestions:

- Read the latest checkpoint, branch status, open decisions, failing tests at the
  start of every session before changing code.
- Identify current consumers of a subsystem before modifying it; add regression
  coverage for behaviour that must remain.
- Keep `docs/worklog` entries: date, branch, task, files changed, verification,
  unresolved issues.
- Never mark a placeholder/hard-coded demo/disabled validation as complete — use a
  visible development label when a real provider isn't connected yet.
- Don't use TODO comments as the only record of important unfinished work — create a
  tracked issue/checkpoint item.
- Record why a library is needed, alternatives considered, bundle/operational
  impact, maintenance signal, exit strategy when choosing a dependency.
- New external provider → fixtures, adapter tests, attribution, freshness handling,
  failure UI, provider runbook — same phase.
- New DB migration → test clean migration AND migration from last checkpoint schema;
  document backfill/rollback.
- Screen change → mobile+desktop evidence, relevant visual/accessibility checks.
- Media-processing change → test representative Android/iPhone footage, portrait/
  landscape, variable frame rate, HDR where supported, damaged files, interrupted
  uploads.
- Map-code change → test global view, anti-meridian, poles, dense urban clusters,
  large warning polygons, low-end device mode, layer failure.
- Warning-logic change → test issue/update/replacement/cancellation/expiry/
  overlapping zones/stale location/provider replay.
- Authorisation change → negative tests proving other users/unauthorised roles can't
  access the resource.
- Never expose private location/Watch Zone/unpublished asset URL/internal moderation
  reason/provider secret in client logs or analytics.
- Feature flags for incomplete production features; remove obsolete flags after
  stable release.
- Bounded, descriptive commits — don't combine unrelated dependency upgrades,
  redesign, and DB changes into one unreviewable commit.
- Prefer migration adapters/compatibility layers over sudden full replacement when
  existing routes/data are in use.
- A justified rewrite keeps the old subsystem behind a rollback flag until the new
  path passes production-like verification.
- Don't optimise ranking for maximum watch time — optimise for relevance, freshness,
  trust, event understanding, user-controlled preference.
- No dark patterns for notification/location permission, account creation, or data
  consent.
- AI-generated summaries must not remove source links, uncertainty, or the
  observation-vs-forecast distinction.
- Keep an AI feature out of publication-critical decisions if it can't explain its
  confidence or be reviewed.
- End each session buildable, or explicitly revert partial changes — never leave
  silent broken intermediate states on the main working branch.
- Before production release: final original-vs-redesign comparison (retained
  functionality, intentional removals, improvements, migration status).

## Appendix G — Final build evidence package

At the end of the master implementation, a single release evidence directory:

```
artifacts/release/01-original-app/        screenshots + audit summary of original impl
artifacts/release/02-redesigned-app/      current mobile/tablet/desktop captures
artifacts/release/03-user-journeys/       recordings/traces for key journeys
artifacts/release/04-tests/               summarised test/accessibility/security/performance reports
artifacts/release/05-data/                seed description, provider fixtures, migration verification (no secrets/prod data)
artifacts/release/06-operations/          deployment result, health checks, backup/restore evidence, runbook index
artifacts/release/07-differences.md       kept/refactored/replaced/removed/deferred
artifacts/release/08-known-limitations.md honest unresolved limitations, coverage gaps, planned follow-up
artifacts/release/09-production-checklist.md  signed/dated checklist with evidence links
```
