import { describe, expect, it } from "vitest";
import { SEED_EVENTS } from "@/lib/map/seedEvents";
import { FEED_REPORTS, findReportByEventId } from "./reports";

describe("FEED_REPORTS", () => {
  it("has exactly one report per seed event", () => {
    expect(FEED_REPORTS).toHaveLength(SEED_EVENTS.length);
    expect(FEED_REPORTS.map((r) => r.event.id)).toEqual(SEED_EVENTS.map((e) => e.id));
  });

  it("points each report's video at its own category's fixture", () => {
    for (const report of FEED_REPORTS) {
      expect(report.videoSrc).toBe(`/media/${report.event.category}.mp4`);
    }
  });

  it("gives every report a non-empty contributor handle and caption", () => {
    for (const report of FEED_REPORTS) {
      expect(report.contributorHandle.startsWith("@")).toBe(true);
      expect(report.caption.length).toBeGreaterThan(0);
    }
  });
});

describe("findReportByEventId", () => {
  it("finds a report by its event id", () => {
    const first = SEED_EVENTS[0]!;
    expect(findReportByEventId(first.id)?.event.id).toBe(first.id);
  });

  it("returns undefined for an unknown id", () => {
    expect(findReportByEventId("not-a-real-id")).toBeUndefined();
  });
});
