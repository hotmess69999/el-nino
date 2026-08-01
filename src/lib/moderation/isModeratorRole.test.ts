import { describe, expect, it } from "vitest";
import { isModeratorRole } from "./roles";

describe("isModeratorRole", () => {
  it("accepts moderator and admin", () => {
    expect(isModeratorRole("moderator")).toBe(true);
    expect(isModeratorRole("admin")).toBe(true);
  });

  it("rejects plain users, null, and undefined", () => {
    expect(isModeratorRole("user")).toBe(false);
    expect(isModeratorRole(null)).toBe(false);
    expect(isModeratorRole(undefined)).toBe(false);
  });
});
