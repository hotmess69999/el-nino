import { CATEGORY_META } from "@/lib/map/categories";
import type { WeatherEvent } from "@/lib/map/events";
import styles from "./EventPreview.module.css";

interface EventPreviewProps {
  event: WeatherEvent;
  onClose: () => void;
}

const VERIFICATION_LABEL: Record<WeatherEvent["verificationStatus"], string> = {
  official: "Official",
  verified: "Verified",
  unconfirmed: "Unconfirmed",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Minimal preview panel for a selected marker. Deliberately not a floating
 * card stack — one panel, restrained content, no decoration. The event-page
 * route (Appendix A: /events/:eventSlug) doesn't exist yet, so the "view
 * full event" affordance is honestly disabled rather than a broken link.
 */
export function EventPreview({ event, onClose }: EventPreviewProps) {
  const category = CATEGORY_META[event.category];

  return (
    <div className={styles.panel} role="dialog" aria-label={`${event.name} preview`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{event.name}</h2>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
      <div className={styles.meta}>
        <span className={styles.badge} style={{ color: category.color }}>
          <span className={styles.dot} />
          {category.label}
        </span>
        <span className={styles.badge}>{VERIFICATION_LABEL[event.verificationStatus]}</span>
        <span className={styles.badge}>{event.locationLabel}</span>
        <span className={styles.badge}>{formatTimestamp(event.timestamp)}</span>
      </div>
      <p className={styles.summary}>{event.summary}</p>
      <span className={styles.futureAction} aria-disabled="true">
        Full event page — coming in a later phase
      </span>
    </div>
  );
}
