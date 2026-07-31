"use client";

import { Map as MaplibreMap, Marker, NavigationControl } from "maplibre-gl";
import type { ErrorEvent, Map as MaplibreMapType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_META } from "@/lib/map/categories";
import {
  GRATICULE_LAYER_ID,
  GRATICULE_SOURCE_ID,
  MAP_CONFIG,
  buildMapStyle,
} from "@/lib/map/config";
import type { WeatherEvent } from "@/lib/map/events";
import { buildGraticule } from "@/lib/map/graticule";
import { SEED_EVENTS } from "@/lib/map/seedEvents";
import { isWebglSupported } from "@/lib/map/webgl";
import { EventPreview } from "./EventPreview";
import styles from "./GlobeMap.module.css";

type Status = "loading" | "ready" | "error" | "unsupported";

/**
 * The signature globe/map surface. Renders a self-contained MapLibre style
 * (no external tile provider — see src/lib/map/config.ts) with accessible
 * DOM markers for the seeded weather events. Replaces the Phase 1 CSS
 * placeholder globe.
 */
export function GlobeMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMapType | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!isWebglSupported()) {
      // Deferred so this early bail-out doesn't set state synchronously
      // within the effect body itself (react-hooks/set-state-in-effect).
      queueMicrotask(() => setStatus("unsupported"));
      return;
    }

    const map = new MaplibreMap({
      container: containerRef.current,
      style: buildMapStyle(),
      center: MAP_CONFIG.initialCenter,
      zoom: MAP_CONFIG.initialZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      // No external tile source is used yet (src/lib/map/config.ts), so
      // there is nothing to attribute — keep controls minimal.
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Must be called after the style has finished loading, not
      // immediately after construction — MapLibre throws otherwise.
      map.setProjection({ type: "globe" });

      // Added after load, not in the initial style object — a GeoJSON
      // source declared upfront hung MapLibre's style-loading step in this
      // project's bundler/worker setup (see src/lib/map/config.ts).
      map.addSource(GRATICULE_SOURCE_ID, { type: "geojson", data: buildGraticule(30) });
      map.addLayer({
        id: GRATICULE_LAYER_ID,
        type: "line",
        source: GRATICULE_SOURCE_ID,
        paint: { "line-color": "#262c37", "line-width": 1, "line-opacity": 0.6 },
      });

      setStatus("ready");

      for (const event of SEED_EVENTS) {
        const category = CATEGORY_META[event.category];
        const el = document.createElement("button");
        el.type = "button";
        el.className = styles.marker ?? "";
        el.style.background = category.color;
        el.setAttribute("aria-label", `${event.name} — ${category.label} — ${event.locationLabel}`);
        el.addEventListener("click", () => setSelectedEvent(event));

        new Marker({ element: el }).setLngLat([event.longitude, event.latitude]).addTo(map);
      }
    });

    map.on("error", (event: ErrorEvent) => {
      console.error("Map error", event.error);
      setStatus("error");
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <span className={styles.tag}>Seed data — not a live weather feed</span>
      <div ref={containerRef} className={styles.canvasContainer} />

      {status === "loading" && (
        <div className={styles.overlay} role="status">
          <p className={styles.overlayBody}>Loading globe…</p>
        </div>
      )}

      {status === "unsupported" && (
        <div className={styles.overlay} role="alert">
          <h2 className={styles.overlayTitle}>Interactive globe unavailable</h2>
          <p className={styles.overlayBody}>
            Your browser doesn&apos;t support WebGL, which the interactive globe requires. Here are
            the current seeded events instead:
          </p>
          <FallbackEventList />
        </div>
      )}

      {status === "error" && (
        <div className={styles.overlay} role="alert">
          <h2 className={styles.overlayTitle}>Globe failed to load</h2>
          <p className={styles.overlayBody}>
            Something went wrong initialising the map. Here are the current seeded events instead:
          </p>
          <FallbackEventList />
        </div>
      )}

      {selectedEvent && (
        <EventPreview event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function FallbackEventList() {
  return (
    <ul className={styles.fallbackList}>
      {SEED_EVENTS.map((event) => (
        <li key={event.id} className={styles.fallbackItem}>
          {event.name} — {event.locationLabel}
        </li>
      ))}
    </ul>
  );
}
