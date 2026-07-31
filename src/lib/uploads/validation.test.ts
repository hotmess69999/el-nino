import { describe, expect, it } from "vitest";
import { fuzzCoordinate, validateMediaFile, validateReportInput } from "./validation";

const VALID = {
  category: "severe-storm",
  caption: "Storm rolling in over the plains.",
  latitude: 32.776664,
  longitude: -96.796988,
  locationLabel: "Dallas, TX",
};

describe("validateReportInput", () => {
  it("accepts a well-formed report and fuzzes coordinates", () => {
    const result = validateReportInput(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.publicLatitude).toBe(32.78);
      expect(result.value.publicLongitude).toBe(-96.8);
    }
  });

  it("rejects an unknown category", () => {
    const result = validateReportInput({ ...VALID, category: "not-a-category" });
    expect(result.ok).toBe(false);
  });

  it("rejects an empty caption", () => {
    const result = validateReportInput({ ...VALID, caption: "  " });
    expect(result.ok).toBe(false);
  });

  it("rejects out-of-range latitude", () => {
    const result = validateReportInput({ ...VALID, latitude: 999 });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing location label", () => {
    const result = validateReportInput({ ...VALID, locationLabel: "" });
    expect(result.ok).toBe(false);
  });
});

describe("fuzzCoordinate", () => {
  it("rounds to two decimal places (~1.1km precision)", () => {
    expect(fuzzCoordinate(32.776664)).toBe(32.78);
  });
});

describe("validateMediaFile", () => {
  it("accepts a supported type within the size limit", () => {
    expect(validateMediaFile("video/mp4", 1024)).toBeNull();
  });

  it("rejects an unsupported mime type", () => {
    expect(validateMediaFile("image/png", 1024)).not.toBeNull();
  });

  it("rejects an oversized file", () => {
    expect(validateMediaFile("video/mp4", 200 * 1024 * 1024)).not.toBeNull();
  });

  it("rejects an empty file", () => {
    expect(validateMediaFile("video/mp4", 0)).not.toBeNull();
  });
});
