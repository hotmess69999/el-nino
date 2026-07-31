import { listSpaceWeatherItems } from "@/lib/spaceWeather/service";
import styles from "@/components/spaceWeather/SpaceWeather.module.css";

export default function SpaceWeatherPage() {
  const items = listSpaceWeatherItems();

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Space weather</h1>
      <p className={styles.intro}>
        Solar and geomagnetic conditions that can affect Earth — aurora potential, radio and GPS
        impact. Aurora visibility depends on darkness and local sky conditions; geomagnetic activity
        alone is not a viewing guarantee.
      </p>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.card}>
            <span className={styles.kindBadge}>{item.kind.replace("-", " ")}</span>
            <p className={styles.itemTitle}>{item.title}</p>
            <p className={styles.summary}>{item.plainLanguageSummary}</p>
            <p className={styles.technical}>
              {item.technicalSummary} — {item.scale}
            </p>
            <p className={styles.meta}>
              Window: {item.windowStart.toISOString()} – {item.windowEnd.toISOString()} — confidence:{" "}
              {item.confidence} — <a href={item.sourceUrl}>source</a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
