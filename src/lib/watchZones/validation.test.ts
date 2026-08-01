import { describe, expect, it } from "vitest";
import { validateWatchZoneInput } from "./validation";

const VALID = {
  label: "Home",
  latitude: 32.7767,
  longitude: -96.797,
  radiusKm: 25,
  categories: ["severe-storm"],
  minSeverity: "watch",
  notificationsEnabled: true,
};

describe("validateWatchZoneInput", () => {
  it("accepts a well-formed input", () => {
    const result = validateWatchZoneInput(VALID);
    expect(result.ok).toBe(true);
  });

  it("rejects an empty label", () => {
    const result = validateWatchZoneInput({ ...VALID, label: "  " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["label"]).toBeDefined();
  });

  it("rejects out-of-range latitude", () => {
    const result = validateWatchZoneInput({ ...VALID, latitude: 200 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["latitude"]).toBeDefined();
  });

  it("rejects out-of-range longitude", () => {
    const result = validateWatchZoneInput({ ...VALID, longitude: -200 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["longitude"]).toBeDefined();
  });

  it("rejects a radius outside the allowed range", () => {
    const result = validateWatchZoneInput({ ...VALID, radiusKm: 5000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["radiusKm"]).toBeDefined();
  });

  it("rejects no categories selected", () => {
    const result = validateWatchZoneInput({ ...VALID, categories: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["categories"]).toBeDefined();
  });

  it("drops unknown category values rather than accepting them", () => {
    const result = validateWatchZoneInput({ ...VALID, categories: ["not-a-real-category"] });
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid minSeverity", () => {
    const result = validateWatchZoneInput({ ...VALID, minSeverity: "catastrophic" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["minSeverity"]).toBeDefined();
  });

  it("rejects malformed quiet-hours times", () => {
    const result = validateWatchZoneInput({ ...VALID, quietHoursStart: "25:99" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["quietHoursStart"]).toBeDefined();
  });

  it("accepts well-formed quiet-hours times", () => {
    const result = validateWatchZoneInput({ ...VALID, quietHoursStart: "22:00", quietHoursEnd: "07:00" });
    expect(result.ok).toBe(true);
  });
});
