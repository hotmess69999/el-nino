import type { WeatherEvent } from "./events";

/**
 * Local seed data only — clearly labelled, not a live provider. Per the
 * master prompt ("do not present mock data as live"), every consumer of
 * this data must present it as demonstration content until a real
 * provider-neutral weather-data-integrator adapter replaces it (Phase 6+).
 * Names are fictional/generic rather than referencing real historical
 * disasters, so this can never be mistaken for a real past or current event.
 */
export const SEED_EVENTS: readonly WeatherEvent[] = [
  {
    id: "seed-severe-storm-1",
    name: "Severe thunderstorm warning",
    category: "severe-storm",
    locationLabel: "Dallas–Fort Worth, Texas, US",
    latitude: 32.78,
    longitude: -96.8,
    timestamp: "2026-07-31T09:00:00Z",
    verificationStatus: "official",
    summary: "Damaging wind gusts and large hail reported with a fast-moving storm cell.",
  },
  {
    id: "seed-flood-1",
    name: "River flood watch",
    category: "flood",
    locationLabel: "Dhaka, Bangladesh",
    latitude: 23.81,
    longitude: 90.41,
    timestamp: "2026-07-31T06:30:00Z",
    verificationStatus: "official",
    summary: "Sustained monsoon rainfall has pushed river levels toward flood stage.",
  },
  {
    id: "seed-cyclone-1",
    name: "Tropical Cyclone Mirabel (demonstration)",
    category: "cyclone",
    locationLabel: "Beira, Mozambique",
    latitude: -19.84,
    longitude: 34.84,
    timestamp: "2026-07-30T18:00:00Z",
    verificationStatus: "verified",
    summary: "Fictional demonstration cyclone tracking toward the coast — seed data only.",
  },
  {
    id: "seed-bushfire-1",
    name: "Extreme bushfire danger",
    category: "bushfire-weather",
    locationLabel: "Adelaide Hills, South Australia",
    latitude: -34.97,
    longitude: 138.71,
    timestamp: "2026-07-31T02:00:00Z",
    verificationStatus: "official",
    summary: "Hot, dry, and windy conditions have pushed fire danger to extreme.",
  },
  {
    id: "seed-snow-1",
    name: "Heavy snowfall advisory",
    category: "snow",
    locationLabel: "Sapporo, Japan",
    latitude: 43.06,
    longitude: 141.35,
    timestamp: "2026-07-31T00:00:00Z",
    verificationStatus: "unconfirmed",
    summary: "Community reports of heavy snow accumulation; official confirmation pending.",
  },
  {
    id: "seed-space-weather-1",
    name: "G2 geomagnetic storm — aurora visible",
    category: "space-weather",
    locationLabel: "Tromsø, Norway",
    latitude: 69.65,
    longitude: 18.96,
    timestamp: "2026-07-30T22:00:00Z",
    verificationStatus: "verified",
    summary: "Moderate geomagnetic storm; aurora may be visible at high latitudes overnight.",
  },
] as const;
