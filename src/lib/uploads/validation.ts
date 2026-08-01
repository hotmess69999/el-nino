import { EVENT_CATEGORIES } from "@/lib/map/categories";

export const MAX_CAPTION_LENGTH = 220;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB
export const ALLOWED_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export interface ReportInput {
  category: string;
  caption: string;
  publicLatitude: number;
  publicLongitude: number;
  locationLabel: string;
}

export type ReportValidationResult =
  | { ok: true; value: ReportInput }
  | { ok: false; errors: Record<string, string> };

/** Reduces public location precision to ~11km — never publish the exact submitted point. */
export function fuzzCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateReportInput(input: Record<string, unknown>): ReportValidationResult {
  const errors: Record<string, string> = {};

  const category = typeof input["category"] === "string" ? input["category"] : "";
  if (!(EVENT_CATEGORIES as readonly string[]).includes(category)) {
    errors["category"] = "Choose a weather category.";
  }

  const caption = typeof input["caption"] === "string" ? input["caption"].trim() : "";
  if (!caption) errors["caption"] = "Caption is required.";
  else if (caption.length > MAX_CAPTION_LENGTH) {
    errors["caption"] = `Caption must be ${MAX_CAPTION_LENGTH} characters or fewer.`;
  }

  const latitude = fuzzCoordinate(Number(input["latitude"]));
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors["latitude"] = "Latitude must be between -90 and 90.";
  }

  const longitude = fuzzCoordinate(Number(input["longitude"]));
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors["longitude"] = "Longitude must be between -180 and 180.";
  }

  const locationLabel = typeof input["locationLabel"] === "string" ? input["locationLabel"].trim() : "";
  if (!locationLabel) errors["locationLabel"] = "Location label is required.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { category, caption, publicLatitude: latitude, publicLongitude: longitude, locationLabel },
  };
}

export function validateMediaFile(mimeType: string, byteSize: number): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return "Unsupported video format.";
  if (byteSize > MAX_UPLOAD_BYTES) return "File is larger than the 100MB limit.";
  if (byteSize === 0) return "File is empty.";
  return null;
}
