/**
 * Programmatic mirror of the CSS custom properties in src/styles/tokens.css.
 * Keep values in sync by hand — there is no build-time codegen for this yet.
 * Use these constants (not new literals) whenever JS/TS needs a token value,
 * e.g. matchMedia breakpoint checks or z-index comparisons in portals.
 */

export const breakpoints = {
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const zIndex = {
  base: 0,
  nav: 100,
  overlay: 200,
  modal: 300,
  toast: 400,
} as const;

export const motion = {
  instant: 0,
  fast: 120,
  standard: 220,
  map: 500,
} as const;

/**
 * True when `width` is at or above the given breakpoint's minimum width.
 * Matches the mobile-first `min-width` convention used in CSS media queries.
 */
export function isAtLeastBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= breakpoints[breakpoint];
}
