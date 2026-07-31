# Design system

Tokens live in [`src/styles/tokens.css`](../src/styles/tokens.css) (CSS custom
properties, the source of truth for styling) and are mirrored for JS/TS use in
[`src/lib/tokens.ts`](../src/lib/tokens.ts) (breakpoints, z-index, spacing, radius,
motion — keep these two files in sync by hand). Components use CSS Modules and
reference tokens via `var(--token-name)`; no plain-CSS component should introduce a
one-off colour, spacing, or radius value when a token already covers the case.

## Token groups

| Group                   | Values                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Colour (surfaces)       | `--color-canvas`, `--color-surface`, `--color-raised`, `--color-divider`                                                                                                                                                 |
| Colour (text)           | `--color-text`, `--color-text-muted`, `--color-text-disabled`                                                                                                                                                            |
| Colour (accents)        | `--color-action`, `--color-action-hover`, `--color-teal`, `--color-warning`, `--color-critical`, `--color-success`                                                                                                       |
| Colour (map overlays)   | `--color-overlay-scrim`, `--color-overlay-panel`                                                                                                                                                                         |
| Colour (light surfaces) | `--color-canvas-light`, `--color-surface-light`, `--color-text-light`, `--color-text-light-muted`, `--color-divider-light` — for settings/admin/long-text screens per spec section 5, not yet used by any Phase 1 screen |
| Typography              | `display`, `title`, `heading`, `body`, `label`, `caption` — each a `-size`/`-weight`/`-line` triplet                                                                                                                     |
| Spacing                 | `--space-1` (4px) through `--space-12` (48px)                                                                                                                                                                            |
| Radius                  | `--radius-0`, `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (16px), `--radius-pill` — pill reserved for tags/compact controls only                                                                            |
| Elevation               | `--elevation-flat`, `--elevation-overlay`, `--elevation-modal` — contrast/border first, shadow subtle                                                                                                                    |
| Motion                  | `--motion-instant/fast/standard/map`, zeroed under `prefers-reduced-motion: reduce`                                                                                                                                      |
| Breakpoints             | tablet 768px, desktop 1024px (mirrored in `src/lib/tokens.ts`)                                                                                                                                                           |
| Z-index                 | `--z-base`, `--z-nav`, `--z-overlay`, `--z-modal`, `--z-toast`                                                                                                                                                           |

## Visual rules (do not violate)

- Dark charcoal/near-black surfaces by default (`canvas`/`surface`/`raised`); the
  `-light` token set is reserved for settings/admin/long-text contexts, not the
  immersive globe/feed surfaces.
- Restrained accents only — blue (`action`) and teal are the primary weather
  accents; amber/red/green are reserved for warning/critical/success states, not
  decoration.
- Moderate radii only where a container needs definition. No blanket "everything is
  a rounded card" pattern.
- One icon family (see `src/components/nav/icons.tsx` — hand-authored, outlined,
  24×24, `stroke=currentColor`). Never mix icon styles.
- No glassmorphism, decorative gradients used purely for effect, neon glow, oversized
  hero headings, or dense dashboard-style control panels.
- Motion explains state/hierarchy (nav active state, skip-link reveal); never
  ornamental. Everything animated respects `prefers-reduced-motion`.

## Navigation shell

`src/components/nav/NavShell.tsx` renders a single `<nav aria-label="Primary">`
landmark shared between mobile and desktop — responsive behaviour (bottom bar vs.
left side rail) is CSS-only (`NavShell.module.css`, breakpoint at 1024px), not
duplicated markup or JS breakpoint state. Destinations are the five items from
`src/lib/navigation.ts`: Globe, Feed, Upload, Alerts, Profile — order and labels
must stay identical between mobile and desktop per the master prompt.

## Component states

Every screen must account for loading/empty/error/permission-denied states once it
has real data (master prompt section 18). Phase 1's placeholder routes
(`src/components/shared/PlaceholderScreen.tsx`) are not real screens yet, so this
doesn't apply to them — but any component built from Phase 2 onward must implement
the relevant states before it's considered done.

## Globe/map (Phase 2)

`src/components/map/GlobeMap.tsx` renders the signature globe surface,
replacing Phase 1's CSS placeholder. Key rules established here:

- **No live tile provider or API key.** `src/lib/map/config.ts` builds a
  self-contained MapLibre style: a `--color-canvas`-coloured background layer
  plus a lat/lon graticule (`src/lib/map/graticule.ts`, pure/deterministic,
  no network access), added via `map.addSource`/`addLayer` after `load`
  rather than in the initial style object (a GeoJSON source in the initial
  style hung MapLibre's style loading in this project's bundler setup — see
  `docs/dependency-security-log.md`). When a real basemap/tile vendor is
  chosen, it replaces this function's contents; nothing else should need to
  change.
- **Markers are real DOM `<button>` elements** (via `maplibregl.Marker`
  with a custom HTML element), not a canvas-rendered symbol layer — this is
  what makes them keyboard-focusable and screen-reader-accessible with a
  single `aria-label`. Only reach for a canvas/clustering layer
  (`src/lib/map/toGeoJSON.ts` exists for exactly that future case) once
  marker volume genuinely justifies it — six seed markers do not.
- **Marker colour comes from `CATEGORY_META`** (`src/lib/map/categories.ts`),
  which maps each event category to an existing design token
  (`--color-critical`, `--color-warning`, `--color-teal`, etc.) — never a
  new one-off hex value.
- **Controls stay minimal**: only `NavigationControl` with the compass
  hidden (zoom in/out only), restyled in `GlobeMap.module.css` via `:global()`
  selectors to match the dark surface instead of MapLibre's default light
  theme. No attribution control (nothing external to attribute yet).
- **The event preview is one panel**, not a floating-card stack — see
  `src/components/map/EventPreview.tsx`. Its "view full event page" action
  is honestly disabled (dashed border, `aria-disabled`), since the
  `/events/:eventSlug` route doesn't exist yet — never link to a route that
  404s.
- **Required states**: `loading` (before `load` fires), `unsupported`
  (WebGL probe fails — `src/lib/map/webgl.ts`), `error` (MapLibre's `error`
  event fires). Both `unsupported` and `error` fall back to a plain
  accessible list of the same seed events, so the content never becomes
  unreachable if the map itself can't render.
- **No decorative animation.** Unlike the Phase 1 CSS placeholder's
  auto-rotating globe, the real map only moves in response to user
  interaction (drag/zoom/keyboard) — nothing to gate behind
  `prefers-reduced-motion` because there's no ambient motion to begin with.

## Accessibility baseline established in Phase 1

- Skip-to-main-content link, visually hidden until focused (`layout.module.css`).
- `<main id="main-content" tabIndex={-1}>` as the primary landmark.
- One `<nav aria-label="Primary">` landmark, not duplicated per breakpoint.
- `aria-current="page"` on the active nav item.
- Global `:focus-visible` outline plus a stronger nav-link-specific one.
- All motion (globe placeholder rotation, skip-link reveal) disabled under
  `prefers-reduced-motion: reduce`.
- Colour contrast manually checked against WCAG 2.2 AA: muted text
  (`--color-text-muted` `#9aa4b2`) on canvas (`--color-canvas` `#0a0d12`) is
  ~7.7:1; action blue (`--color-action` `#4da3ff`) on canvas is ~7.4:1. Both clear
  the 4.5:1 AA threshold for normal text with margin. Re-check whenever a token
  colour value changes.
