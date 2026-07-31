import { describe, expect, it } from "vitest";
import { breakpoints, isAtLeastBreakpoint } from "./tokens";

describe("isAtLeastBreakpoint", () => {
  it("is false below the breakpoint", () => {
    expect(isAtLeastBreakpoint(breakpoints.desktop - 1, "desktop")).toBe(false);
  });

  it("is true exactly at the breakpoint", () => {
    expect(isAtLeastBreakpoint(breakpoints.desktop, "desktop")).toBe(true);
  });

  it("is true above the breakpoint", () => {
    expect(isAtLeastBreakpoint(breakpoints.desktop + 200, "desktop")).toBe(true);
  });

  it("evaluates tablet and desktop independently", () => {
    const tabletWidth = breakpoints.tablet;
    expect(isAtLeastBreakpoint(tabletWidth, "tablet")).toBe(true);
    expect(isAtLeastBreakpoint(tabletWidth, "desktop")).toBe(false);
  });
});
