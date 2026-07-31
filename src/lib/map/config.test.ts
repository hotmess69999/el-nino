import { describe, expect, it } from "vitest";
import { MAP_CONFIG, buildMapStyle } from "./config";

describe("MAP_CONFIG", () => {
  it("has a min zoom below the initial zoom below the max zoom", () => {
    expect(MAP_CONFIG.minZoom).toBeLessThan(MAP_CONFIG.initialZoom);
    expect(MAP_CONFIG.initialZoom).toBeLessThan(MAP_CONFIG.maxZoom);
  });

  it("has a valid [longitude, latitude] initial center", () => {
    const [lon, lat] = MAP_CONFIG.initialCenter;
    expect(lon).toBeGreaterThanOrEqual(-180);
    expect(lon).toBeLessThanOrEqual(180);
    expect(lat).toBeGreaterThanOrEqual(-90);
    expect(lat).toBeLessThanOrEqual(90);
  });
});

describe("buildMapStyle", () => {
  it("does not reference any external tile source", () => {
    const style = buildMapStyle();
    for (const source of Object.values(style.sources)) {
      if ("tiles" in source && source.tiles) {
        for (const url of source.tiles) {
          expect(url.startsWith("http")).toBe(false);
        }
      }
      if ("url" in source && source.url) {
        expect(source.url.startsWith("http")).toBe(false);
      }
    }
  });

  it("includes a background layer so the canvas is never blank", () => {
    const style = buildMapStyle();
    expect(style.layers.some((layer) => layer.type === "background")).toBe(true);
  });
});
