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

/**
 * A self-contained MapLibre style: no external tile provider or API key.
 * Phase 2 deliberately does not integrate a live basemap/tile vendor (see
 * the Phase 2 checkpoint) — just a restrained dark background here. The
 * lat/lon graticule is added programmatically after `load` instead of in
 * this initial style object (see GlobeMap.tsx) — a GeoJSON source declared
 * in the initial style hung MapLibre's style-loading step in this project's
 * bundler/worker setup; adding it after load avoids that entirely.
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
