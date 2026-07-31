import { describe, expect, it } from "vitest";
import { buildGraticule } from "./graticule";

describe("buildGraticule", () => {
  it("rejects a non-positive step", () => {
    expect(() => buildGraticule(0)).toThrow(RangeError);
    expect(() => buildGraticule(-10)).toThrow(RangeError);
  });

  it("rejects a step larger than 90 degrees", () => {
    expect(() => buildGraticule(91)).toThrow(RangeError);
  });

  it("produces only LineString features", () => {
    const graticule = buildGraticule(30);
    expect(graticule.type).toBe("FeatureCollection");
    for (const feature of graticule.features) {
      expect(feature.geometry.type).toBe("LineString");
    }
  });

  it("produces more meridians with a smaller step", () => {
    const coarse = buildGraticule(90);
    const fine = buildGraticule(30);
    const countMeridians = (fc: ReturnType<typeof buildGraticule>) =>
      fc.features.filter((f) => f.properties?.kind === "meridian").length;
    expect(countMeridians(fine)).toBeGreaterThan(countMeridians(coarse));
  });
});
