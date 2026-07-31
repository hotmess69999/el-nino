"use client";

import { Map as MaplibreMap, Marker, NavigationControl } from "maplibre-gl";
import type { ErrorEvent, Map as MaplibreMapType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_META } from "@/lib/map/categories";
import {
  GRATICULE_IMAGE_COORDINATES,
  GRATICULE_IMAGE_URL,
  GRATICULE_LAYER_ID,
  GRATICULE_SOURCE_ID,
  MAP_CONFIG,
  buildMapStyle,
} from "@/lib/map/config";
import type { WeatherEvent } from "@/lib/map/events";
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
export interface GlobeWatchZone {
  readonly id: string;
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
}

interface GlobeMapProps {
  /** The signed-in user's own Watch Zones, rendered as plain point markers
   * (never a drawn radius — see GlobeMap.module.css .watchZoneMarker).
   * Omitted entirely for signed-out visitors. */
  watchZones?: readonly GlobeWatchZone[];
}

export function GlobeMap({ watchZones = [] }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMapType | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  // Feed-to-globe continuity: /?event=<id> (from a feed report's "View on
  // globe" link) auto-opens that event's preview once markers exist.
  // Captured once at mount into a ref so it doesn't force the map-creation
  // effect below to re-run if the URL changes later.
  const searchParams = useSearchParams();
  const initialEventIdRef = useRef(searchParams.get("event"));
  const watchZonesRef = useRef(watchZones);

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

      // Pre-rendered raster texture, not a GeoJSON source — GeoJSON
      // sources never finish loading in this project's Next.js/Turbopack
      // bundler setup (confirmed with a trivial single-point source; the
      // vector-tile worker never completes). An `image` source decodes on
      // the main thread and sidesteps that entirely. See
      // src/lib/map/config.ts and docs/dependency-security-log.md.
      map.addSource(GRATICULE_SOURCE_ID, {
        type: "image",
        url: GRATICULE_IMAGE_URL,
        coordinates: GRATICULE_IMAGE_COORDINATES,
      });
      map.addLayer({
        id: GRATICULE_LAYER_ID,
        type: "raster",
        source: GRATICULE_SOURCE_ID,
        paint: { "raster-opacity": 0.85 },
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

      const initialEventId = initialEventIdRef.current;
      if (initialEventId) {
        const matched = SEED_EVENTS.find((event) => event.id === initialEventId);
        if (matched) setSelectedEvent(matched);
      }

      for (const zone of watchZonesRef.current) {
        const el = document.createElement("span");
        el.className = styles.watchZoneMarker ?? "";
        el.setAttribute("role", "img");
        el.setAttribute("aria-label", `Watch zone: ${zone.label}`);
        new Marker({ element: el }).setLngLat([zone.longitude, zone.latitude]).addTo(map);
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
