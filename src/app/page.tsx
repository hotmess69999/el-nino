import styles from "./page.module.css";

export default function GlobeHomePage() {
  return (
    <div className={styles.screen}>
      <span className={styles.tag}>Development — placeholder visual</span>
      <div className={styles.globe} role="img" aria-label="Placeholder Earth globe">
        <div className={styles.globeGrid} />
        <span className={`${styles.marker} ${styles.markerOne}`} />
        <span className={`${styles.marker} ${styles.markerTwo}`} />
      </div>
      <div className={styles.copy}>
        <h1 className={styles.title}>El Niño</h1>
        <p className={styles.body}>
          This is a Phase 1 placeholder for the signature interactive globe. The real
          MapLibre-powered globe, live event clusters, and layer controls arrive in Phase 2 (Globe,
          map and event read experience).
        </p>
      </div>
    </div>
  );
}
