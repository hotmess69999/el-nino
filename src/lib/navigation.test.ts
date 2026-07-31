import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isActiveNavItem } from "./navigation";

describe("NAV_ITEMS", () => {
  it("has the five primary destinations in the spec-required order", () => {
    expect(NAV_ITEMS.map((item) => item.key)).toEqual([
      "globe",
      "feed",
      "upload",
      "alerts",
      "profile",
    ]);
  });

  it("has a unique href per item", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("isActiveNavItem", () => {
  const globe = NAV_ITEMS[0]!;
  const feed = NAV_ITEMS[1]!;

  it("matches the globe item only on the exact root path", () => {
    expect(isActiveNavItem(globe, "/")).toBe(true);
    expect(isActiveNavItem(globe, "/feed")).toBe(false);
  });

  it("does not let the root item match every route", () => {
    expect(isActiveNavItem(globe, "/anything")).toBe(false);
  });

  it("matches a non-root item on its exact path", () => {
    expect(isActiveNavItem(feed, "/feed")).toBe(true);
  });

  it("matches a non-root item on a nested sub-route", () => {
    expect(isActiveNavItem(feed, "/feed/nearby")).toBe(true);
  });

  it("does not match a different top-level route", () => {
    expect(isActiveNavItem(feed, "/alerts")).toBe(false);
  });

  it("does not match a route that merely shares a prefix", () => {
    // "/feed-archive" starts with "/feed" as a string but is not under it.
    expect(isActiveNavItem(feed, "/feed-archive")).toBe(false);
  });
});
