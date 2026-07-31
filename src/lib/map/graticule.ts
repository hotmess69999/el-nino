import type { Feature, FeatureCollection, LineString } from "geojson";

/**
 * Generates a simple latitude/longitude grid as GeoJSON LineStrings, used as
 * the map's restrained dark basemap in place of a live tile provider (Phase
 * 2 does not integrate a hosted style — see docs/decisions for when one is
 * chosen). Pure function, no network access, deterministic for a given step.
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
