import { describe, expect, it } from "vitest";
import { warningMatchesPoint } from "./matching";

describe("warningMatchesPoint", () => {
  const warning = { latitude: 32.7767, longitude: -96.797, radiusKm: 40 };

  it("matches a point well inside the warning radius", () => {
    expect(warningMatchesPoint(warning, { latitude: 32.78, longitude: -96.8 })).toBe(true);
  });

  it("does not match a point far outside the warning radius", () => {
    expect(warningMatchesPoint(warning, { latitude: 51.5072, longitude: -0.1276 })).toBe(false);
  });

  it("accounts for the matching point's own radius", () => {
    // ~350km away — outside the 40km warning radius alone, but within reach
    // once the Watch Zone's own 350km radius is added.
    const farPoint = { latitude: 35.4676, longitude: -97.5164 };
    expect(warningMatchesPoint(warning, farPoint)).toBe(false);
    expect(warningMatchesPoint(warning, { ...farPoint, radiusKm: 350 })).toBe(true);
  });
});
