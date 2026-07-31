import type { WeatherEvent } from "@/lib/map/events";
import { SEED_EVENTS } from "@/lib/map/seedEvents";

export interface FeedReport {
  readonly event: WeatherEvent;
  /** Local generated video fixture — see public/media/README.md. Not real footage. */
  readonly videoSrc: string;
  readonly contributorHandle: string;
  readonly caption: string;
}

const CONTRIBUTOR_BY_EVENT_ID: Record<string, string> = {
  "seed-severe-storm-1": "@dfw_stormwatch",
  "seed-flood-1": "@dhaka_river_watch",
  "seed-cyclone-1": "@beira_coastal_obs",
  "seed-bushfire-1": "@adelaide_hills_fire_watch",
  "seed-snow-1": "@sapporo_snow_reports",
  "seed-space-weather-1": "@tromso_aurora_chaser",
};

/**
 * Feed reports are the same seed events shown on the globe, paired with a
 * generated local video fixture per category (public/media/<category>.mp4)
 * and a caption derived from the event summary. This is what makes the
 * feed and globe "the same data" rather than two disconnected demos.
 */
export const FEED_REPORTS: readonly FeedReport[] = SEED_EVENTS.map((event) => ({
  event,
  videoSrc: `/media/${event.category}.mp4`,
  contributorHandle: CONTRIBUTOR_BY_EVENT_ID[event.id] ?? "@weather_observer",
  caption: event.summary,
}));

export function findReportByEventId(eventId: string): FeedReport | undefined {
  return FEED_REPORTS.find((report) => report.event.id === eventId);
}
