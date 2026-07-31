# Phase 3 — Vertical weather feed and playback

Status: complete for the scope defined below. 2026-07-31.

## 1. Scope completed

- **Globe visual correction (done first, per instruction):** increased the
  graticule grid's contrast so it's actually visible against the dark
  canvas, without making it bright/dominant/technical. Along the way,
  discovered and fixed a real bug: GeoJSON sources never finish loading in
  this project's Next.js/Turbopack bundler setup (the vector-tile worker
  never completes, silently — no thrown error, `source.loaded()` stays
  `false` forever, even for a trivial single-point source). The graticule is
  now a pre-rendered PNG (`public/map/graticule.png`,
  `scripts/generate-graticule-image.mjs`) loaded as an `image` source
  instead of a `geojson`/`line` source. Verified on both desktop and Pixel 7
  screenshots (Checkpoint A).
- Built the real vertical weather-video feed
  (`src/components/feed/FeedScreen.tsx`): CSS scroll-snap (not a carousel
  library), one report full-viewport at a time, `IntersectionObserver`-driven
  playback (only the visible video plays/decodes), keyboard
  `ArrowUp`/`ArrowDown` navigation, tap-to-pause with a visible play-icon
  overlay, a dedicated mute/unmute control.
- Six generated (ffmpeg, clearly labelled, not real footage) vertical video
  fixtures, one per weather category, actually playable — not blank panels.
- Feed reports are the _same_ seed events as the globe
  (`src/lib/feed/reports.ts` maps `SEED_EVENTS` 1:1), and "View on globe"
  closes the loop: navigating from a feed report to `/?event=<id>`
  auto-opens that exact event's preview on the globe.
- Overlay hierarchy exactly as specified: video → location + category
  (top) → verification badge (top-right) → contributor + caption + "View on
  globe" (bottom) → mute/globe-link controls (bottom-right). Restrained
  gradient scrims only, no floating glass cards, no decorative gradients.
- Desktop (1440×1000) and mobile (Pixel 7) layouts both implemented and
  tested — bottom nav / side rail continue to work correctly alongside the
  full-bleed feed.
- Three visual checkpoints (A/B/C) captured, inspected, and one real bug
  found and fixed per checkpoint before proceeding (see below).

## 2. Existing code reused

- `NavShell`, design tokens, `CATEGORY_META`, `SEED_EVENTS`, and the globe's
  overall architecture — unchanged, reused directly. The feed's category
  badges, colours, and verification-status vocabulary are the identical
  values the globe already uses.

## 3. Code refactored or replaced and why

- `src/app/feed/page.tsx`: `PlaceholderScreen` → `FeedScreen`.
- `src/lib/map/config.ts` / `src/components/map/GlobeMap.tsx`: graticule
  changed from a `geojson`/`line` layer to an `image`/`raster` layer (see
  Known limitations — this was a bug fix, not a style choice).
- `src/components/feed/FeedScreen.module.css`: `.bottomOverlay`'s gradient
  background widened from `right: 96px` to `right: 0` (with the _content_
  inset via `padding-right: 112px` instead) after visual inspection during
  Checkpoint B found a hard seam behind the side controls.
- `vitest.config.ts`: added a `resolve.alias` for `@/*` → `src/*` — the
  first test file to import via the `@/` alias (`reports.test.ts`) failed
  because Vitest doesn't read `tsconfig.json` path mappings automatically.

## 4. Screens and routes delivered

| Route   | Status                                                                                                     |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| `/feed` | Real vertical weather-video feed — six reports, full playback/nav/mute/pause, feed-to-globe links          |
| `/`     | Graticule contrast fixed; now also accepts `?event=<id>` to auto-open a preview (feed-to-globe continuity) |

## 5. Database and API changes

None. `src/lib/feed/reports.ts` derives feed reports from the existing
in-memory `SEED_EVENTS` — still no backend, still clearly labelled
demonstration data.

## 6. Test evidence

- `npm run lint` — 0 errors.
- `npm run typecheck` — 0 errors.
- `npx vitest run` — **8 test files, 35 tests, all passing** (30 from
  Phases 1–2 + 5 new in `src/lib/feed/reports.test.ts`).
- `npm run build` (`next build`) — succeeds; same 6 static routes.
- `npx playwright test` (desktop + mobile/Pixel 7) — **30/30 passing**:
  20 from Phase 2 (nav + map) + 10 new (`e2e/feed.spec.ts`: metadata
  hierarchy, keyboard navigation, mute-state toggle, pause-state toggle,
  feed-to-globe continuity — each run on both projects).
- Three visual checkpoints, each with real desktop + Pixel 7 screenshots,
  inspected directly (not just generated blind) before proceeding:
  - **Checkpoint A** — globe contrast fix + first complete feed report.
    Found: graticule fix didn't actually render (GeoJSON worker bug, not a
    colour problem) → root-caused and fixed with the `image`-source
    approach.
  - **Checkpoint B** — vertical nav, overlays, playback controls. Found:
    (1) a test-script bug (clicking a non-scoped locator caused an
    unwanted auto-scroll, initially misread as a feed bug — re-verified in
    isolation and confirmed the actual pause/play/mute logic was correct
    all along); (2) a real product bug — the bottom overlay's gradient
    scrim stopped short of the side controls, leaving a visible seam →
    fixed.
  - **Checkpoint C** — feed-to-globe navigation + responsive layout.
    Clean; also covered by an automated e2e test
    (`feed.spec.ts`: "View on globe navigates to the globe with that
    event's preview open"), not just a visual check.

## 7. Accessibility and performance results

- Feed container is `role="region" aria-label="Weather report feed"`,
  keyboard-navigable (`tabIndex=0`, `ArrowUp`/`ArrowDown`). Mute button has
  `aria-pressed`; play/pause is a real click target on the video itself
  with a visible (not just programmatic) state change. Verified via e2e
  tests, not just visual inspection.
- Only one video decodes/plays at a time (`IntersectionObserver`-gated),
  keeping the feed within the "one video active" performance principle the
  master prompt calls for. No formal performance baseline captured yet —
  still a Phase 2+ carried-forward gap (`docs/performance/` doesn't exist).
- No automated accessibility scanner (axe) wired in yet — carried forward
  from Phases 1–2.

## 8. Known limitations

- **Generated video, not real footage.** All six clips are ffmpeg-generated
  tinted noise/gradient textures, clearly labelled in the UI ("Generated
  media — not real footage") and in `public/media/README.md`. Must be
  replaced with real, clearly-licensed weather footage before any
  production use — flagged as a decision below.
- **GeoJSON sources are broken in this bundler setup**, not just for the
  graticule — this will affect any future feature needing vector data on
  the map (warning polygons, Watch Zone boundaries, event geometry
  overlays in later phases). The `image`-source workaround generalises to
  "pre-render as raster" but won't work for genuinely dynamic/interactive
  vector data (e.g. a user-drawn Watch Zone). This needs a real fix (or a
  MapLibre/Next.js version bump that resolves it) before Phase 6+ needs
  vector geometry on the map.
- **No native video scrubbing/progress bar** — deliberately, per "avoid
  oversized controls," but worth confirming that's still the right call
  once real (longer, more variable-length) footage exists.
- No accessibility scanner or performance baseline (carried forward).

## 9. Migration or rollback instructions

Additive plus the graticule rendering-mechanism swap (geojson → image
source, same visual intent) and one full replacement (Feed placeholder →
real feed). To roll back to the Phase 2 state, revert this phase's
commit(s). No data migration involved.

## 10. Next phase recommendation

Per the master prompt's phase table, Phase 4 (Authentication, profiles and
Watch Zones) is next. Before or alongside starting it:

- Decide on real video fixtures/licensing (see decision below) — the
  longer this stays generated placeholder content, the more surfaces end
  up depending on 6-second looping gradients.
- Budget investigation time for the GeoJSON-source bundler issue before
  Phase 6 needs vector warning polygons on the map.
- Add `axe-playwright` (or similar) now that two solid e2e suites exist to
  attach it to.

---

## Design decisions requiring approval

1. **Graticule now an `image` source, not `geojson`.** This was a bug fix
   (GeoJSON never rendered at all), not a preference, but it does mean any
   future _dynamic_ vector data on the map (drawn Watch Zones, live warning
   polygons) will hit the same underlying bundler issue and need its own
   solution — likely worth a deliberate investigation before Phase 6,
   rather than solving it ad hoc under a deadline then.
2. **Six generated video fixtures remain placeholder content.** They're
   honestly labelled, but I want to confirm: should Phase 4/5 continue
   using these, or is sourcing real (stock/licensed) weather footage a
   priority before then? This also affects the Phase 5 upload pipeline's
   test fixtures.
3. **No video progress/scrub bar.** Confirmed minimal per your instruction
   ("no oversized controls"), but flagging in case you want at least a thin
   progress indicator once real, variable-length footage exists.
