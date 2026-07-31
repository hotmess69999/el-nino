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
