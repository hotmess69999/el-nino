import type { EventCategory } from "./categories";

export type VerificationStatus = "official" | "verified" | "unconfirmed";

/**
 * A single weather (or space-weather) event marker. This shape is the typed
 * interface a future provider-neutral data layer must satisfy — see
 * specs/El_Nino_FULL_MASTER_Production_Prompt.md section 17. Phase 2 only
 * populates it from local seed data (src/lib/map/seedEvents.ts); no live
 * provider is wired in yet.
 */
export interface WeatherEvent {
  readonly id: string;
  readonly name: string;
  readonly category: EventCategory;
  readonly locationLabel: string;
  readonly latitude: number;
  readonly longitude: number;
  /** ISO 8601 timestamp, always UTC in storage per section 17's normalisation rules. */
  readonly timestamp: string;
  readonly verificationStatus: VerificationStatus;
  readonly summary: string;
}
