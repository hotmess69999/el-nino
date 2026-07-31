/**
 * One controlled provider adapter — a deterministic local fixture, not a
 * live external feed (no real provider credentials exist in this
 * environment; see docs/checkpoints/PHASE-5-6.md). Shaped exactly like a
 * real adapter's output (section 17's provider contract) so swapping in a
 * real provider later only means writing a new adapter behind the same
 * `WarningRecord` type, not touching matching/UI code.
 */
export interface WarningRecord {
  providerId: string;
  providerWarningId: string;
  issuingAuthority: string;
  category: string;
  severity: "advisory" | "watch" | "warning" | "emergency";
  certainty: string;
  urgency: string;
  headline: string;
  description: string;
  instructions?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  issuedAt: Date;
  effectiveAt: Date;
  expiresAt: Date;
  sourceUrl?: string;
}

/** Fixed reference time so seeded fixtures stay reproducible across runs. */
const REFERENCE = new Date("2026-07-31T12:00:00Z");
const hoursFromReference = (h: number) => new Date(REFERENCE.getTime() + h * 60 * 60 * 1000);

export function fetchLocalWarnings(): WarningRecord[] {
  return [
    {
      providerId: "el-nino-local-fixture",
      providerWarningId: "DFW-SEVERE-STORM-0001",
      issuingAuthority: "National Weather Service (fixture)",
      category: "severe-storm",
      severity: "warning",
      certainty: "observed",
      urgency: "expected",
      headline: "Severe Thunderstorm Warning for Dallas–Fort Worth",
      description: "Fixture warning for local development and testing — not a real alert.",
      instructions: "Move to an interior room away from windows.",
      latitude: 32.7767,
      longitude: -96.797,
      radiusKm: 40,
      issuedAt: hoursFromReference(-1),
      effectiveAt: hoursFromReference(-1),
      expiresAt: hoursFromReference(5),
      sourceUrl: "https://www.weather.gov/",
    },
    {
      providerId: "el-nino-local-fixture",
      providerWarningId: "TROMSO-GEOMAGNETIC-0001",
      issuingAuthority: "Space Weather Prediction Center (fixture)",
      category: "space-weather",
      severity: "watch",
      certainty: "likely",
      urgency: "future",
      headline: "Geomagnetic Storm Watch — Aurora Potential",
      description: "Fixture space-weather watch for local development and testing — not a real alert.",
      latitude: 69.6492,
      longitude: 18.9553,
      radiusKm: 200,
      issuedAt: hoursFromReference(-2),
      effectiveAt: hoursFromReference(6),
      expiresAt: hoursFromReference(30),
      sourceUrl: "https://www.swpc.noaa.gov/",
    },
  ];
}
