import { describe, expect, it } from "vitest";
import { CATEGORY_META, EVENT_CATEGORIES, isEventCategory } from "./categories";

describe("CATEGORY_META", () => {
  it("has an entry for every declared category", () => {
    for (const category of EVENT_CATEGORIES) {
      expect(CATEGORY_META[category]).toBeDefined();
      expect(CATEGORY_META[category].label.length).toBeGreaterThan(0);
      expect(CATEGORY_META[category].color.length).toBeGreaterThan(0);
    }
  });
});

describe("isEventCategory", () => {
  it("accepts every declared category", () => {
    for (const category of EVENT_CATEGORIES) {
      expect(isEventCategory(category)).toBe(true);
    }
  });

  it("rejects an unknown string", () => {
    expect(isEventCategory("hurricane-of-mystery")).toBe(false);
  });
});
