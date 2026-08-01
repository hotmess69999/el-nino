import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { listActiveWarnings, listWarningsForWatchZones } from "@/lib/warnings/service";
import styles from "@/components/alerts/Alerts.module.css";

/**
 * Section 23: if the weather/warning provider fails, the base product must
 * stay usable rather than crash — never blend stale/missing data invisibly.
 * A DB-connection failure surfaces here as an honest "unavailable" state,
 * not an unhandled server error that takes down the whole route.
 */
export default async function AlertsPage() {
  const session = await getCurrentSession();

  let active: Awaited<ReturnType<typeof listActiveWarnings>> = [];
  let zoneReasonByWarningId = new Map<string, string[]>();
  let providerUnavailable = false;

  try {
    const [warnings, zoneMatches] = await Promise.all([
      listActiveWarnings(),
      session ? listWarningsForWatchZones(session.user.id) : Promise.resolve([]),
    ]);
    active = warnings;
    zoneReasonByWarningId = new Map(zoneMatches.map((m) => [m.warning.id, m.matchedZoneLabels]));
  } catch {
    providerUnavailable = true;
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Alerts</h1>
      <Link href="/space-weather">Space weather conditions →</Link>

      {providerUnavailable && (
        <p className={styles.emptyState} role="alert">
          Official warning data is temporarily unavailable. This is never blended with stale data —
          try again shortly.
        </p>
      )}

      {!providerUnavailable && active.length === 0 && (
        <p className={styles.emptyState}>No active official warnings right now.</p>
      )}

      <ul className={styles.list}>
        {active.map((warning) => {
          const zoneLabels = zoneReasonByWarningId.get(warning.id);
          return (
            <li key={warning.id} className={styles.card}>
              <span className={styles.officialBadge}>Official — {warning.severity}</span>
              <p className={styles.headline}>{warning.headline}</p>
              <p className={styles.description}>{warning.description}</p>
              {warning.instructions && <p className={styles.description}>{warning.instructions}</p>}
              <p className={styles.meta}>
                {warning.issuingAuthority} — issued {new Date(warning.issuedAt).toISOString()} — expires{" "}
                {new Date(warning.expiresAt).toISOString()}
                {warning.sourceUrl && (
                  <>
                    {" — "}
                    <a href={warning.sourceUrl}>source</a>
                  </>
                )}
              </p>
              {zoneLabels && zoneLabels.length > 0 && (
                <p className={styles.zoneReason}>Matches your Watch Zone: {zoneLabels.join(", ")}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
