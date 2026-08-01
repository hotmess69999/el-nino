/**
 * One controlled provider adapter — a deterministic local fixture, same
 * posture as src/lib/warnings/localAdapter.ts (no real provider credentials
 * exist in this environment). Distinguishes observed/forecast/model-estimate
 * per section 13, and never claims aurora visibility as guaranteed.
 */
export type SpaceWeatherKind = "observed" | "forecast" | "model-estimate";

export interface SpaceWeatherItem {
  id: string;
  title: string;
  kind: SpaceWeatherKind;
  plainLanguageSummary: string;
  technicalSummary: string;
  scale: string;
  windowStart: Date;
  windowEnd: Date;
  confidence: "low" | "moderate" | "high";
  sourceUrl: string;
}

/** Relative to real current time, not a fixed past date — see the same fix
 * and rationale in src/lib/warnings/localAdapter.ts. */
const REFERENCE = () => new Date();
const hoursFromReference = (h: number) => new Date(REFERENCE().getTime() + h * 60 * 60 * 1000);

export function fetchLocalSpaceWeather(): SpaceWeatherItem[] {
  return [
    {
      id: "swpc-fixture-geomagnetic-storm",
      title: "G2 (Moderate) Geomagnetic Storm",
      kind: "observed",
      plainLanguageSummary:
        "Earth's magnetic field is currently disturbed at a moderate level. Aurora may be visible " +
        "farther from the poles than usual after dark, if skies are clear.",
      technicalSummary: "Kp index reached 6 (G2) — fixture data for local development and testing.",
      scale: "NOAA G-scale: G2",
      windowStart: hoursFromReference(-3),
      windowEnd: hoursFromReference(3),
      confidence: "high",
      sourceUrl: "https://www.swpc.noaa.gov/noaa-scales-explanation",
    },
    {
      id: "swpc-fixture-cme-arrival",
      title: "Coronal Mass Ejection — Possible Arrival Window",
      kind: "forecast",
      plainLanguageSummary:
        "A solar eruption detected two days ago may reach Earth's magnetic field within the stated " +
        "window. Effects, if any, are uncertain until closer to arrival.",
      technicalSummary:
        "CME first detected via coronagraph; arrival time carries a ±7 hour uncertainty — fixture data.",
      scale: "Estimated G1-G2 on arrival",
      windowStart: hoursFromReference(18),
      windowEnd: hoursFromReference(32),
      confidence: "moderate",
      sourceUrl: "https://www.swpc.noaa.gov/",
    },
  ];
}
