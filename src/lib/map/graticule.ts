import type { Feature, FeatureCollection, LineString } from "geojson";

/**
 * Generates a simple latitude/longitude grid as GeoJSON LineStrings. Pure
 * function, no network access, deterministic for a given step.
 *
 * NOT currently wired into the running map — GeoJSON sources never finish
 * loading in this project's Next.js/Turbopack bundler setup (the
 * vector-tile worker never completes; confirmed Phase 3). The actual
 * on-map graticule is a pre-rendered PNG (public/map/graticule.png, built
 * by scripts/generate-graticule-image.mjs) added as an `image` source instead — see
 * src/lib/map/config.ts. Kept here since it's a correct, tested, reusable
 * utility for if/when the GeoJSON worker issue is resolved (e.g. a MapLibre
 * upgrade, or a Turbopack worker-bundling fix).
 */
export function buildGraticule(stepDegrees = 30): FeatureCollection<LineString> {
  if (stepDegrees <= 0 || stepDegrees > 90) {
    throw new RangeError("stepDegrees must be greater than 0 and at most 90");
  }

  const features: Feature<LineString>[] = [];

  for (let lon = -180; lon <= 180; lon += stepDegrees) {
    const coordinates: [number, number][] = [];
    for (let lat = -85; lat <= 85; lat += 5) {
      coordinates.push([lon, lat]);
    }
    features.push({
      type: "Feature",
      properties: { kind: "meridian", longitude: lon },
      geometry: { type: "LineString", coordinates },
    });
  }

  for (let lat = -60; lat <= 60; lat += stepDegrees) {
    features.push({
      type: "Feature",
      properties: { kind: "parallel", latitude: lat },
      geometry: {
        type: "LineString",
        coordinates: [
          [-180, lat],
          [180, lat],
        ],
      },
    });
  }

  return { type: "FeatureCollection", features };
}
