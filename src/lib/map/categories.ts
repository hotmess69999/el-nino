/**
 * The initial weather-event categories for the globe/map. Keep this list
 * small and deliberate — add a category only when a real product need
 * exists, per the weather-only product boundary (master prompt section 3).
 */
export const EVENT_CATEGORIES = [
  "severe-storm",
  "flood",
  "cyclone",
  "bushfire-weather",
  "snow",
  "space-weather",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CategoryMeta {
  readonly label: string;
  /** CSS colour value — must be one of the design tokens, not a one-off hex. */
  readonly color: string;
}

/**
 * Marker styling per category. Colours reference the same accent tokens used
 * elsewhere (src/styles/tokens.css) rather than introducing new one-off
 * values — severe/critical-leaning categories use the critical/warning
 * tokens, calmer ones use action/teal/success.
 */
export const CATEGORY_META: Readonly<Record<EventCategory, CategoryMeta>> = {
  "severe-storm": { label: "Severe storm", color: "var(--color-critical)" },
  flood: { label: "Flood", color: "var(--color-action)" },
  cyclone: { label: "Cyclone", color: "var(--color-critical)" },
  "bushfire-weather": { label: "Bushfire weather", color: "var(--color-warning)" },
  snow: { label: "Snow", color: "var(--color-teal)" },
  "space-weather": { label: "Space weather", color: "var(--color-success)" },
};

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}
