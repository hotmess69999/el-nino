# Phase 2 — Interactive globe and map foundation

Status: complete for the scope defined below. 2026-07-31.

## 1. Scope completed

- Audited the existing globe placeholder (`src/app/page.tsx` + `page.module.css`,
  a CSS-only rotating sphere) and the navigation shell before changing anything —
  the placeholder was purpose-built to be replaced in Phase 2 (documented as such
  in the Phase 1 checkpoint's design decisions); the nav shell required no changes,
  only correct interoperation with the new full-bleed map surface.
- Installed `maplibre-gl@6.1.0` through the allowlist-vetted dependency process
  (see `security/approved-packages.json` and `docs/dependency-security-log.md`).
  No Socket.io, BullMQ, auth, or media tooling added.
- Replaced the CSS placeholder globe with a functional, responsive
  `GlobeMap` component: real drag/zoom/keyboard/touch interaction via MapLibre,
  a self-contained dark style (no external tile provider or API key), globe
  projection, and six accessible seed-event markers.
- Typed abstractions: `src/lib/map/{config,categories,events,seedEvents,
graticule,toGeoJSON,webgl}.ts` — map configuration, event categories, the
  `WeatherEvent` interface (the shape a future provider-neutral data layer must
  satisfy), local seed data, a pure graticule generator, a GeoJSON transform
  utility for future canvas/clustering use, and a WebGL support probe.
- Loading, unsupported-browser, and map-initialisation-error states, all
  falling back to an accessible plain-text list of the same seed events so
  content is never unreachable.
- 6 event categories (severe storm, flood, cyclone, bushfire weather, snow,
  space weather), one realistic seed event each, styled from existing design
  tokens (no new one-off colours).
- Accessible markers: real DOM `<button>` elements (via `maplibregl.Marker`
  with a custom element) with descriptive `aria-label`s, not a canvas symbol
  layer — genuinely keyboard-focusable and screen-reader-reachable.
- Selecting a marker opens a single, restrained `EventPreview` panel: name,
  location, category, timestamp, verification status, summary, and an
  honestly-disabled "view full event page" affordance (the `/events/:eventSlug`
  route doesn't exist yet — no broken link).
- No clustering — six seed markers don't justify it (`toGeoJSON.ts` exists for
  when marker volume actually does).
- No live external weather API — everything comes from
  `src/lib/map/seedEvents.ts`, clearly labelled in the UI ("Seed data — not a
  live weather feed") and in code comments, behind the same typed
  `WeatherEvent` interface a real provider adapter will later satisfy.
- Unit tests for every marker-transformation/configuration utility (18 new
  tests across 5 files: `graticule`, `config`, `categories`, `seedEvents`,
  `toGeoJSON`).
- Installed the Playwright Chromium binary (already cached in this
  environment from before this session — no fresh download occurred) and ran
  the full e2e suite: `nav.spec.ts` (existing) plus new `map.spec.ts` (marker
  rendering, event-preview selection, keyboard activation, responsive nav
  layout), across both a desktop and a mobile (Pixel 7) project — 20/20
  passing.
- Ahead of this phase, installed `eslint-plugin-react-hooks@7.1.1` (per your
  instruction, before starting stateful components) — see its own entry in
  `docs/dependency-security-log.md`.

## 2. Existing code reused

- `NavShell`, the design-token system, and the overall layout shell from
  Phase 1 — unchanged, no modifications needed for the map to slot in.
- Removed: `src/app/page.module.css` (the CSS placeholder globe's styles,
  now dead code since `page.tsx` renders `<GlobeMap />` instead).

## 3. Code refactored or replaced and why

- `src/app/page.tsx`: replaced the CSS placeholder markup with
  `<GlobeMap />`. The placeholder's job (establish the visual identity before
  a real map existed) is done.
- `src/lib/map/config.ts`: the graticule GeoJSON source was **removed from
  the initial style object** and is now added via `map.addSource`/`addLayer`
  inside the `load` handler instead. This wasn't a style preference — a
  GeoJSON source declared upfront hung MapLibre's style loading indefinitely
  in this project's Next.js/Turbopack bundler setup (see "Known limitations"
  and the dependency security log for the full investigation). Adding it
  after `load` avoids the hang entirely with no visual difference.

## 4. Screens and routes delivered

| Route | Status                                                                                      |
| ----- | ------------------------------------------------------------------------------------------- |
| `/`   | Real interactive globe/map (MapLibre), 6 accessible seed-event markers, event preview panel |

No other routes changed this phase.

## 5. Database and API changes

None. All data is local, typed, in-memory seed data (`src/lib/map/seedEvents.ts`).

## 6. Test evidence

- `npm run lint` — 0 errors.
- `npm run typecheck` — 0 errors.
- `npx vitest run` — **7 test files, 30 tests, all passing** (12 from Phase 1
  - 18 new: `graticule.test.ts`, `config.test.ts`, `categories.test.ts`,
    `seedEvents.test.ts`, `toGeoJSON.test.ts`).
- `npm run build` (`next build`) — succeeds; same 6 static routes as Phase 1.
- `npx playwright test` (desktop + mobile/Pixel 7 projects) — **20/20
  passing**: 10 nav-shell tests (from Phase 1, now actually executed for the
  first time) + 10 new map tests (marker presence × mobile/desktop, event
  preview content × mobile/desktop, keyboard activation × mobile/desktop,
  responsive nav layout × mobile/desktop).
- Manual dev-server verification: standalone Playwright scripts used during
  debugging confirmed no console errors, no failed network requests, and
  (after the fix) `load`/`idle` firing with all 6 markers present in the DOM.

## 7. Accessibility and performance results

- Accessibility: markers are real focusable `<button>` elements with
  descriptive `aria-label`s (verified by an e2e test pressing Enter on a
  focused marker), the event preview is a `role="dialog"` with an accessible
  name, loading/error/unsupported states use `role="status"`/`role="alert"`,
  and the unsupported/error fallbacks present the same event data as an
  accessible list rather than losing content. Map controls (`NavigationControl`)
  are the only additional interactive elements, restyled to meet the same
  contrast bar as the rest of the UI. No automated accessibility scanner
  (axe) is wired in yet — still a known gap carried from Phase 1.
- Performance: no formal baseline captured yet (`docs/performance/` still
  doesn't exist — that's explicit Phase 2+ follow-up work per master prompt
  section 25, not done here). Qualitatively: the self-contained style (one
  background layer, one small graticule layer, six DOM markers) is
  lightweight — no tile fetching, no large datasets.

## 8. Known limitations

- **No live basemap.** The map is a dark background plus a lat/lon graticule
  — no coastlines, borders, or place labels. This is a deliberate Phase 2
  scope boundary (no external tile provider/API key yet), not an oversight —
  flagged as a design decision below.
- **The GeoJSON-source-in-initial-style bug** (see section 3) was worked
  around, not root-caused to a specific line in MapLibre/Turbopack/webworker
  interaction. If it resurfaces when a real tile-based basemap is added
  later (which will need vector/raster sources, possibly in the initial
  style), budget time to investigate further — the current workaround
  (add sources after `load`) should generalise, but hasn't been tested against
  a real external tile source.
- No automated accessibility scan or visual regression tooling yet (carried
  from Phase 1).
- No performance baseline captured yet.
- `eslint-plugin-react-hooks`'s new `set-state-in-effect` rule required a
  `queueMicrotask` workaround for one legitimate synchronous early-return
  (WebGL unsupported check) — documented inline in `GlobeMap.tsx`. Worth
  revisiting if the plugin's guidance on this pattern becomes clearer.

## 9. Migration or rollback instructions

Additive plus one full replacement (the Home screen's placeholder → real
map). To roll back to the Phase 1 placeholder, revert this phase's commit(s)
— `src/app/page.tsx` and `page.module.css` return to their prior state, and
`maplibre-gl` can be removed from `package.json`/the allowlist if desired
(nothing else depends on it). No data migration involved (no persistent
storage exists yet).

## 10. Next phase recommendation

Per the master prompt's phase table, Phase 3 (Vertical feed and playback) is
next. Before or alongside starting it:

- Decide on a real basemap/tile provider (or confirm staying graticule-only
  longer) — currently an open decision in `docs/ARCHITECTURE.md`.
- Add an automated accessibility scan (axe-playwright or similar) given a
  stable e2e suite now exists to attach it to.
- Capture a first performance baseline (`docs/performance/`) once there's a
  second heavy surface (the video feed) to compare the globe against.

---

## Visual decisions requiring approval

1. **Graticule-only basemap, no real geography.** The map currently shows
   background colour + a 30°-spaced lat/lon grid — no coastlines, borders, or
   labels, because no live tile provider/API key is integrated yet (per your
   instruction not to add one this phase). This is honest and functional but
   visually sparse compared to a "real" map. Confirm this is acceptable for
   now, or tell me which basemap/tile provider to evaluate next (this
   determines whether an API key/credential needs to be provisioned).
2. **Marker style: plain coloured dots, not category icons.** Each marker is
   a 16px circle coloured by category (critical/warning/teal/success tokens),
   not a distinct icon per category. Simpler, avoids expanding the hand-drawn
   icon set for six categories that may still change. If you want
   per-category icons instead of colour-only differentiation, say so and
   I'll design them within the existing icon style.
3. **No auto-rotating "cinematic" globe.** The Phase 1 placeholder had a
   decorative rotation; the real map deliberately does not auto-rotate —
   it only moves in response to user input, per the "avoid decorative
   animation" instruction. Confirm this restraint is what you want, versus a
   one-time intro animation on first load (which would need explicit
   `prefers-reduced-motion` handling if added).
