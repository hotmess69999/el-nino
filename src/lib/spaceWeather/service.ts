import { fetchLocalSpaceWeather, type SpaceWeatherItem } from "./localAdapter";

/**
 * No DB persistence yet — space-weather items are read-through from the
 * adapter each request, same as how OfficialWarning ingestion could be
 * called without persisting if a future adapter is cheap to re-fetch. Kept
 * this simple deliberately: Phase 7's minimum viable slice doesn't need a
 * table until Watch Zone aurora-alert matching (deferred) needs to query it
 * relationally.
 */
export function listSpaceWeatherItems(): SpaceWeatherItem[] {
  return fetchLocalSpaceWeather();
}
