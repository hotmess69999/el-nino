# Phase 1 — Design system and navigation shell

Status: complete for the scope defined below. 2026-07-31.

## 1. Scope completed

- Audited the current UI before changing anything (`src/` before this phase
  contained only the Phase 0 `src/lib/placeholder.ts` — nothing else existed to
  preserve; see "Existing code reused" below).
- Implemented the Concept 3 (map-first) + Concept 6 (immersive globe) visual
  direction at the foundation level: dark canvas/surface tokens, restrained
  blue/teal accents, a CSS-only placeholder globe as the Home screen's signature
  visual (see "Design decisions requiring approval" — the real MapLibre globe is
  explicitly Phase 2, not built here).
- Full design-token system: colour, typography, spacing, radius, elevation,
  motion (with `prefers-reduced-motion` handling), breakpoints, z-index —
  `src/styles/tokens.css` (CSS custom properties) + `src/lib/tokens.ts` (JS/TS
  mirror + `isAtLeastBreakpoint` utility).
- Responsive navigation shell (`src/components/nav/NavShell.tsx`): one
  `<nav aria-label="Primary">` landmark, CSS-only responsive behaviour — bottom
  bar on mobile, left side rail from 1024px up. Five destinations (Globe, Feed,
  Upload, Alerts, Profile) sourced from `src/lib/navigation.ts`, the single
  source of truth shared by both the component and its tests.
- Five routes: `/` (Globe home, real placeholder visual), `/feed`, `/upload`,
  `/alerts`, `/profile` (honest "not built yet" placeholders via
  `PlaceholderScreen`, each naming its actual planned phase — no fake
  dashboards, no fabricated data).
- Accessibility: skip-to-main-content link, `<main id="main-content">` landmark,
  `aria-current="page"` on the active nav item, global and nav-specific
  `:focus-visible` styles, all motion gated behind `prefers-reduced-motion`,
  manually-checked WCAG 2.2 AA contrast (documented in
  `docs/DESIGN_SYSTEM.md`).
- Unit tests for the navigation and token utilities (12 tests, both files
  covered — see "Test evidence").
- Playwright spec written for the navigation shell's stable flow
  (`e2e/nav.spec.ts`) — **not run**, per instruction, since browser binaries are
  not yet installed (deliberate, documented in
  `docs/dependency-security-log.md`).
- Stopped before adding MapLibre, Socket.io, BullMQ, media tooling, or auth —
  none were required by this phase's actual scope.

## 2. Existing code reused

None — Phase 0's audit (recorded in `docs/audit/` N/A notes and
`docs/MIGRATION_STRATEGY.md`) already established this project is greenfield.
The only pre-existing file under `src/` was the Phase 0 TypeScript
toolchain-verification placeholder (`src/lib/placeholder.ts`), which this phase
deleted now that real source exists to verify the toolchain against.

## 3. Code refactored or replaced and why

- N/A (nothing existed to refactor).

## 4. Screens and routes delivered

| Route      | Status                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| `/`        | Globe home — placeholder visual (signature surface foundation; real globe is Phase 2) |
| `/feed`    | Honest placeholder, labeled Phase 3                                                   |
| `/upload`  | Honest placeholder, labeled Phase 5                                                   |
| `/alerts`  | Honest placeholder, labeled Phase 6                                                   |
| `/profile` | Honest placeholder, labeled Phase 4                                                   |

## 5. Database and API changes

None. Phase 1 is frontend-only per its stated scope.

## 6. Test evidence

- `npm run lint` — 0 errors.
- `npm run typecheck` — 0 errors.
- `npx vitest run` — **2 test files, 12 tests, all passing**
  (`src/lib/navigation.test.ts`, `src/lib/tokens.test.ts`).
- `npm run build` (`next build`) — succeeds; all 6 routes prerendered as static
  content (`/`, `/_not-found`, `/alerts`, `/feed`, `/profile`, `/upload`).
- Manual dev-server smoke test: started `next dev`, curled `/`, `/feed`,
  `/alerts` — all returned `200`; confirmed the rendered HTML contains the page
  title, the skip link, the `aria-label="Primary"` nav landmark, and the globe
  placeholder's `role="img"`. Server stopped after the check.
- `e2e/nav.spec.ts` — written, not executed (browser binaries intentionally not
  installed yet).

## 7. Accessibility and performance results

- Accessibility: see `docs/DESIGN_SYSTEM.md` "Accessibility baseline
  established in Phase 1" — skip link, semantic landmarks, `aria-current`,
  focus-visible styles, reduced-motion handling, and a manual WCAG 2.2 AA
  contrast check (muted text ~7.7:1, action blue ~7.4:1 against canvas, both
  clear the 4.5:1 threshold). No automated accessibility scanner (e.g. axe) is
  wired in yet — that belongs with `test-quality-engineer` once Playwright is
  actually running.
- Performance: no baseline captured yet — `docs/performance/` doesn't exist.
  There isn't yet a meaningful interactive surface (map, video) to benchmark;
  the first real performance budget applies from Phase 2 (globe interactivity)
  onward, per master prompt section 25.

## 8. Known limitations

- The Home screen's globe is a CSS placeholder, not an interactive map — see
  design decision below.
- No automated accessibility scan or visual regression tooling yet.
- `e2e/nav.spec.ts` exists but has never actually been run.
- No ESLint React-specific plugin (`eslint-plugin-react-hooks`, etc.) is
  installed — the current flat config lints via `@eslint/js` +
  `typescript-eslint` only. Not a defect for this phase's scope (no hooks/effects
  were written), but should be added before Phase 2 introduces stateful
  client components (map view-state, layer toggles).
- Turbopack's workspace-root inference required an explicit `turbopack.root`
  pin in `next.config.mjs` because this checkout is a nested git worktree with
  a sibling `package-lock.json` in the parent checkout — documented inline in
  the config; not an issue for a non-worktree checkout, but worth knowing if it
  resurfaces.

## 9. Migration or rollback instructions

Purely additive — no existing behavior, data, or routes were changed or
removed (none existed). To roll back, revert the commit(s) for this phase;
nothing else depends on it yet.

## 10. Next phase recommendation

Phase 2 (Globe, map and event read experience) is next per the master prompt's
phase table. Before starting it:

- Resolve the design decision below (MapLibre choice / globe library).
- Add `eslint-plugin-react-hooks` (or equivalent) since Phase 2 introduces
  stateful client components.
- Only then install MapLibre (and, if a 3D globe library is chosen separately
  from flat-map MapLibre, that library too) through the same allowlist-vetted
  process used for every other dependency so far.

---

## Design decisions requiring approval

1. **Globe placeholder vs. pulling MapLibre in now.** Your Phase 1 instructions
   explicitly said "stop before adding MapLibre... unless the current Phase 1
   work genuinely requires them" — I read that as: build the token/nav
   foundation now, defer the actual map engine to Phase 2 as the master
   prompt's own phase table specifies. What ships today is a CSS-only rotating
   sphere with two static markers, clearly labeled as a placeholder. If you'd
   rather I pull MapLibre in now so the Home screen is real from the start,
   say so and I'll treat that as Phase 1 scope after all.
2. **No icon library.** I hand-authored 5 small outlined SVG icons instead of
   adding a dependency (lucide-react, etc.), to keep this phase's dependency
   footprint at zero. Fine for 5 nav icons; if you'd prefer a proper icon
   library before more icons are needed elsewhere in the product, let me know
   and I'll add one through the same vetting process.
3. **CSS Modules, not Tailwind or a component library.** Matches "restrained,
   non-dashboard" styling with zero new dependencies. If you want Tailwind (or
   shadcn/ui, etc.) instead, this is the moment to switch before more screens
   are built on top of the current approach.
