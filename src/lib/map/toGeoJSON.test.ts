import { describe, expect, it } from "vitest";
import { SEED_EVENTS } from "./seedEvents";
import { eventToFeature, eventsToFeatureCollection } from "./toGeoJSON";

describe("eventToFeature", () => {
  const event = SEED_EVENTS[0]!;

  it("uses [longitude, latitude] point order per the GeoJSON spec", () => {
    const feature = eventToFeature(event);
    expect(feature.geometry.coordinates).toEqual([event.longitude, event.latitude]);
  });

  it("carries the event id and category into properties", () => {
    const feature = eventToFeature(event);
    expect(feature.properties.id).toBe(event.id);
    expect(feature.properties.category).toBe(event.category);
  });
});

describe("eventsToFeatureCollection", () => {
  it("produces one feature per event, in order", () => {
    const collection = eventsToFeatureCollection(SEED_EVENTS);
    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features).toHaveLength(SEED_EVENTS.length);
    expect(collection.features.map((f) => f.properties.id)).toEqual(SEED_EVENTS.map((e) => e.id));
  });

  it("returns an empty feature collection for no events", () => {
    expect(eventsToFeatureCollection([])).toEqual({
      type: "FeatureCollection",
      features: [],
    });
  });
});
