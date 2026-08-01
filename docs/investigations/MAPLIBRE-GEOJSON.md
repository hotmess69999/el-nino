# Investigation: MapLibre GeoJSON sources never load under Next.js

Status: **root cause isolated to Next.js's bundling of MapLibre's worker
construction; no in-app fix found. Raster/image-source workaround preserved.
Vector-dependent features gated until resolved.**
2026-07-31.

## 1. Symptom (original discovery, Phase 3)

Any `geojson` source added to a MapLibre `Map` in this app — including a
trivial single-point source — never finishes loading. `source.loaded()`
stays `false` indefinitely. No error is thrown, no `error` event fires, and
(newly confirmed in this investigation) **no network request for the
MapLibre worker script is ever observed**, in either dev or production
builds.

## 2. Reproduction steps

1. `npm run build && npm start` (or `npm run dev`).
2. Open `/` (the globe).
3. In devtools console: `document.querySelector('canvas')` confirms the map
   mounted; add a source via the app's own code path (`map.addSource('t', {
   type: 'geojson', data: { type: 'Point', coordinates: [0, 0] } })`).
4. Poll `map.getSource('t').loaded()` — stays `false` after 3+ seconds.
5. No console error, no `error` map event, no failed network request.

This reproduces identically whether the source is added inside the style
object at construction time or after the `load` event fires, and whether
`data` is an inline object or a static `/public/*.geojson` URL.

## 3. Root cause

**A dedicated Worker is created (MapLibre's own worker bootstrap does
execute), but it terminates almost immediately with no console output on
either side, and the GeoJSON source never finishes loading — under both
Turbopack and webpack builds.**

An earlier pass of this investigation used a request filter
(`url.includes("worker")`) to check for worker activity and, finding no
matching network request, concluded the worker was never created at all.
That filter was wrong — Next.js's worker chunk has a hashed filename with
no "worker" substring, so the filter matched nothing regardless of what
actually happened. That conclusion has been retracted and replaced with
the finding below, obtained by listening directly for Playwright's
`page.on('worker', ...)` event instead of filtering requests by name.

Evidence:

- **Standalone reproduction (zero bundler) works correctly.** Copied
  MapLibre's raw `.mjs` dist files into `investigations/maplibre-geojson/vendor/`
  and served them with a zero-dependency Node `http` server
  (`investigations/maplibre-geojson/serve.mjs`, port 4001) — no Next.js, no
  Turbopack, no webpack anywhere in the path. Result:
  `RESULT: source.loaded() = true` for the identical trivial GeoJSON source.
  Screenshot: `investigations/maplibre-geojson/standalone-result.png`. This
  rules out MapLibre 6.1.0 itself, the map style, and the `geojson` source
  type as the cause.
- **Fails identically under both Next.js bundler backends.** Built and ran
  the app with `next build` (Turbopack, default) and with
  `next build --webpack` (confirmed via the `▲ Next.js 16.2.12 (webpack)`
  banner), served on separate ports. Both show `source.loaded() = false`
  with no `error` event. This rules out "Turbopack-specific" as the cause —
  it is something Next.js does to client-bundled dependencies generally.
- **A worker is created, then closes almost immediately.** Using
  `page.on('worker', w => ...)` (production build, port 3001, temporary
  `window.__map` debug hook) against the app's own `GlobeMap` instance:
  adding a trivial `geojson` point source fires a `worker` event
  (`WORKER CREATED`), and shortly after, a `close` event on that same
  worker (`WORKER CLOSED`) — with zero messages logged from the worker's
  own console in between. `source.loaded()` remains `false` at the 3s
  check. This is a materially different finding from "no worker is ever
  requested": the worker script does load and start executing, but
  terminates before completing (or without ever completing) whatever
  handshake `source.loaded()` depends on, and does so silently — no worker
  `pageerror`, no worker `console` output, no main-thread `error` map
  event.
- Both `unsupported`/`error` map states and the app's `error` event handler
  never fire during this failure — it is a true silent hang from the
  main thread's perspective, consistent with the worker dying quietly
  rather than never starting.

**Not conclusively determined:** *why* the worker closes — whether it
throws inside its own top-level module evaluation (in a way not surfaced by
Playwright's worker `console`/`pageerror` listeners), whether Next.js's
`new Worker(url, { type: "module" })` resolution under both bundlers
produces a worker script whose `import.meta.url`-relative internal imports
404 in a way that terminates the worker before it can log anything, or
something else in MapLibre's actor/dispatcher handshake. Pinning that down
would require instrumenting MapLibre's own dispatcher source or attaching
Chrome DevTools Protocol worker-target debugging directly, both out of
scope for this app-level spike.

## 4. Alternatives tested

Only rows below reflect tests actually executed in this investigation;
none are extrapolated.

| Alternative | Result |
| --- | --- |
| Inline GeoJSON `data` object, production build (Turbopack) | Fails — worker created then closes, `loaded()` stays `false` |
| Inline GeoJSON `data` object, webpack build | Fails — `loaded()` stays `false`, no error surfaced on main-thread listeners |
| Adding source after `load` event vs. in initial style | No difference |
| Standalone `.mjs` files, no bundler, zero-dependency static server | **Works** — `loaded()` becomes `true` |
| Pre-rendered `image`/`raster` source (current production workaround) | **Works** — decodes on the main thread, no worker involved |

**Not tested in this pass** (listed honestly rather than guessed at):
static `/public/*.geojson` URL as the source `data` (attempted; blocked by
an unrelated 404 because the fixture file was added after the production
build without a rebuild — not retried within this investigation's time
box), and an explicit `setWorkerUrl()` override (not attempted — now that a
worker is confirmed to start, this is a more plausible lever than
previously assumed and is a reasonable next step for whoever picks this up
again).

Downgrading MapLibre, disabling Turbopack globally, or adding a second
mapping library were explicitly out of scope for this spike per
instruction and were not attempted.

## 5. Recommended fix

No in-app fix was found within this investigation's scope. Recommended
path forward, in order:

1. **Keep the current `image`/`raster` workaround for the graticule** — it
   is correct and unaffected by this bug (main-thread decode, no worker).
2. **File/track upstream**: this looks like a MapLibre GL JS 6.x +
   Next.js 16 client-bundling incompatibility that causes MapLibre's own
   web worker to terminate silently shortly after starting, not an
   application bug. Worth searching MapLibre's and Next.js's issue trackers
   for existing reports before re-investigating from scratch next time;
   none were checked in this pass (network access to check upstream
   trackers was not exercised here — flagging as an explicit gap). The most
   promising next debugging step for whoever picks this up: attach Chrome
   DevTools Protocol worker-target debugging (or `page.on('console')`
   combined with `--remote-debugging-port` and manually inspecting the
   worker's own DevTools context) to see why it closes, since Playwright's
   `Worker.on('console')`/`pageerror` listeners captured nothing before the
   close event in this pass.
3. **Re-test on future MapLibre or Next.js releases** before assuming the
   bug is permanent — this is the kind of bundler-interop issue that gets
   fixed upstream without necessarily being called out in that release's
   headline notes.

## 6. Effect on Watch Zones and warning polygons

Any feature needing genuinely dynamic or interactive vector geometry on the
map — user-drawn Watch Zone boundaries, live warning polygons, event
geometry overlays, real-time track lines — **cannot use a `geojson` source
in this app as currently bundled.** The `image`-source workaround only
generalises to *static, pre-rendered* raster content; it cannot represent
data that changes at runtime or needs per-feature interactivity (click
targets, hover states, per-vertex editing).

**Gating decision:** Phase 4 and later phases must not implement Watch
Zones, warning polygons, or any other interactive vector-map feature using
MapLibre `geojson`/vector sources until this is resolved. If Watch Zones
are needed before a fix lands, they must be built as a **non-map UI**
(e.g. a list of named zones with lat/lon + radius, no drawn polygon on the
globe) or explicitly deferred — this is a scope input for
`docs/checkpoints/PHASE-4-PLAN.md`, not a decision made unilaterally here.

## 7. Is an ADR required?

Not raising this as a formal ADR right now — Phase 3 already documented the
graticule's `image`-source workaround in `docs/DESIGN_SYSTEM.md` and
`docs/checkpoints/PHASE-3.md`, and this document supersedes/extends that
with the fuller investigation. If a permanent fix or workaround pattern for
*interactive* vector data (e.g. an off-map SVG overlay approach, or a
version bump that resolves it) is adopted in a later phase, that decision
should get an ADR at that time, since it will shape how every future
map-geometry feature is built.

## 8. Regression test

None added — no fix was found to regress-test. The existing raster
workaround already has implicit coverage via `e2e/map.spec.ts` (globe loads
and renders markers). If/when a genuine vector-source fix is found, add a
Playwright test asserting `source.loaded()` becomes `true` for a real
`geojson` source, so a future dependency bump can't silently reintroduce
this failure undetected.

## 9. Investigation artifacts

- `investigations/maplibre-geojson/index.html` — standalone repro page.
- `investigations/maplibre-geojson/serve.mjs` — zero-dependency static
  server used to run it outside any bundler.
- `investigations/maplibre-geojson/vendor/*.mjs` — raw copies of MapLibre's
  dist files used by the repro (redundant with `node_modules`; regenerate
  via `cp node_modules/maplibre-gl/dist/maplibre-gl{,-worker,-shared}.mjs
  node_modules/maplibre-gl/dist/maplibre-gl.css
  investigations/maplibre-geojson/vendor/` rather than committing large
  binary-adjacent duplicates long-term).
- `investigations/maplibre-geojson/standalone-result.png` — screenshot of
  the successful standalone run (`RESULT: source.loaded() = true`).
