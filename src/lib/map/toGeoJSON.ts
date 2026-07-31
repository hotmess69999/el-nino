import type { Feature, FeatureCollection, Point } from "geojson";
import type { WeatherEvent } from "./events";

export interface WeatherEventProperties {
  id: string;
  name: string;
  category: string;
  locationLabel: string;
  timestamp: string;
  verificationStatus: string;
}

/**
 * Converts typed WeatherEvent records into a GeoJSON FeatureCollection.
 * Not used for rendering yet (Phase 2 renders accessible DOM markers
 * directly from WeatherEvent[] — see src/components/map/GlobeMap.tsx), but
 * this is the reusable abstraction a future canvas/clustering layer (once
 * marker volume justifies it) will need, per master prompt section 17.
 */
export function eventsToFeatureCollection(
  events: readonly WeatherEvent[],
): FeatureCollection<Point, WeatherEventProperties> {
  return {
    type: "FeatureCollection",
    features: events.map(eventToFeature),
  };
}

export function eventToFeature(event: WeatherEvent): Feature<Point, WeatherEventProperties> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [event.longitude, event.latitude],
    },
    properties: {
      id: event.id,
      name: event.name,
      category: event.category,
      locationLabel: event.locationLabel,
      timestamp: event.timestamp,
      verificationStatus: event.verificationStatus,
    },
  };
}
