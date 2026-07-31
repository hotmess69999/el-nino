import { EVENT_CATEGORIES, type EventCategory } from "@/lib/map/categories";

export const SEVERITY_LEVELS = ["advisory", "watch", "warning", "emergency"] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const MAX_RADIUS_KM = 500;
export const MIN_RADIUS_KM = 1;
export const MAX_LABEL_LENGTH = 60;

export interface WatchZoneInput {
  label: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  categories: string[];
  minSeverity: string;
  notificationsEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

export type ValidationResult =
  | { ok: true; value: WatchZoneInput }
  | { ok: false; errors: Record<string, string> };

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Hand-rolled rather than a schema-validation library — the shape is small
 * and stable, and this avoids adding a new direct dependency for it (zod is
 * already in the tree transitively via better-auth, but declaring it here
 * would be relying on an undeclared hoisting artifact).
 */
export function validateWatchZoneInput(input: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  const label = typeof input["label"] === "string" ? input["label"].trim() : "";
  if (!label) errors["label"] = "Name is required.";
  else if (label.length > MAX_LABEL_LENGTH) errors["label"] = `Name must be ${MAX_LABEL_LENGTH} characters or fewer.`;

  const latitude = Number(input["latitude"]);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors["latitude"] = "Latitude must be between -90 and 90.";
  }

  const longitude = Number(input["longitude"]);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors["longitude"] = "Longitude must be between -180 and 180.";
  }

  const radiusKm = Number(input["radiusKm"]);
  if (!Number.isFinite(radiusKm) || radiusKm < MIN_RADIUS_KM || radiusKm > MAX_RADIUS_KM) {
    errors["radiusKm"] = `Radius must be between ${MIN_RADIUS_KM} and ${MAX_RADIUS_KM} km.`;
  }

  const rawCategories = Array.isArray(input["categories"]) ? input["categories"] : [];
  const categories = rawCategories.filter(
    (c): c is EventCategory => typeof c === "string" && (EVENT_CATEGORIES as readonly string[]).includes(c),
  );
  if (categories.length === 0) errors["categories"] = "Select at least one category.";

  const minSeverity = typeof input["minSeverity"] === "string" ? input["minSeverity"] : "";
  if (!(SEVERITY_LEVELS as readonly string[]).includes(minSeverity)) {
    errors["minSeverity"] = "Choose a valid minimum severity.";
  }

  const notificationsEnabled = Boolean(input["notificationsEnabled"]);

  const quietHoursStart = input["quietHoursStart"];
  const quietHoursEnd = input["quietHoursEnd"];
  if (typeof quietHoursStart === "string" && quietHoursStart && !TIME_PATTERN.test(quietHoursStart)) {
    errors["quietHoursStart"] = "Use 24-hour HH:MM format.";
  }
  if (typeof quietHoursEnd === "string" && quietHoursEnd && !TIME_PATTERN.test(quietHoursEnd)) {
    errors["quietHoursEnd"] = "Use 24-hour HH:MM format.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      label,
      latitude,
      longitude,
      radiusKm,
      categories,
      minSeverity,
      notificationsEnabled,
      quietHoursStart: typeof quietHoursStart === "string" && quietHoursStart ? quietHoursStart : null,
      quietHoursEnd: typeof quietHoursEnd === "string" && quietHoursEnd ? quietHoursEnd : null,
    },
  };
}
