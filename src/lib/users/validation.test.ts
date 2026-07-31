import { describe, expect, it } from "vitest";
import { isValidUsername, normalizeUsername, validateProfileEdit } from "./validation";

describe("normalizeUsername", () => {
  it("lowercases and trims", () => {
    expect(normalizeUsername("  DFW_StormWatch  ")).toBe("dfw_stormwatch");
  });
});

describe("isValidUsername", () => {
  it("accepts a valid username", () => {
    expect(isValidUsername("dfw_stormwatch")).toBe(true);
  });

  it("rejects usernames that are too short", () => {
    expect(isValidUsername("ab")).toBe(false);
  });

  it("rejects usernames with disallowed characters", () => {
    expect(isValidUsername("dfw storm watch!")).toBe(false);
    expect(isValidUsername("DFW_Storm")).toBe(false);
  });
});

describe("validateProfileEdit", () => {
  it("accepts a well-formed edit", () => {
    const result = validateProfileEdit({ displayName: "DFW Storm Watch", bio: "Amateur storm chaser." });
    expect(result.ok).toBe(true);
  });

  it("rejects an empty display name", () => {
    const result = validateProfileEdit({ displayName: "  ", bio: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["displayName"]).toBeDefined();
  });

  it("rejects an overlong bio", () => {
    const result = validateProfileEdit({ displayName: "Name", bio: "x".repeat(300) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["bio"]).toBeDefined();
  });
});
