import { describe, expect, it } from "vitest";
import { isEventCategory } from "./categories";
import { SEED_EVENTS } from "./seedEvents";

describe("SEED_EVENTS", () => {
  it("has a unique id per event", () => {
    const ids = SEED_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every declared category at least once", () => {
    const categories = new Set(SEED_EVENTS.map((e) => e.category));
    expect(categories.size).toBe(6);
  });

  it("has valid coordinates and a known category for every event", () => {
    for (const event of SEED_EVENTS) {
      expect(event.longitude).toBeGreaterThanOrEqual(-180);
      expect(event.longitude).toBeLessThanOrEqual(180);
      expect(event.latitude).toBeGreaterThanOrEqual(-90);
      expect(event.latitude).toBeLessThanOrEqual(90);
      expect(isEventCategory(event.category)).toBe(true);
    }
  });
});
