import type { StyleSpecification } from "maplibre-gl";

/**
 * Initial camera and interaction bounds for the globe/map. Kept in one place
 * so the component doesn't scatter magic numbers.
 */
export const MAP_CONFIG = {
  initialCenter: [10, 15] as [number, number],
  initialZoom: 1.3,
  minZoom: 0.8,
  maxZoom: 10,
} as const;

export const GRATICULE_SOURCE_ID = "graticule";
export const GRATICULE_LAYER_ID = "graticule-lines";
export const GRATICULE_IMAGE_URL = "/map/graticule.png";
// Near-full-world coverage. Clamped to +/-85 degrees, not the poles — an
// `image` source's coordinates go through Web Mercator internally, which
// is mathematically undefined at exactly +/-90 (MapLibre throws "y=Infinity
// outside of bounds").
export const GRATICULE_IMAGE_COORDINATES: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
  [-180, 85],
  [180, 85],
  [180, -85],
  [-180, -85],
];

/**
 * A self-contained MapLibre style: no external tile provider or API key.
 * Phase 2 deliberately does not integrate a live basemap/tile vendor (see
 * the Phase 2 checkpoint) — just a restrained dark background here. The
 * lat/lon graticule is added programmatically after `load` (see
 * GlobeMap.tsx) as an `image` source, not a `geojson` source — GeoJSON
 * sources never finish loading in this project's Next.js/Turbopack bundler
 * setup (confirmed with a trivial single-point source; the underlying
 * worker never completes), so a pre-rendered raster texture
 * (public/map/graticule.png, generate via scripts/generate-graticule-image.mjs)
 * decoded on the main thread is used instead. See
 * docs/dependency-security-log.md and the Phase 3 checkpoint for the full
 * investigation.
 */
export function buildMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#0a0d12" },
      },
    ],
  };
}
