import styles from "./PlaceholderScreen.module.css";

interface PlaceholderScreenProps {
  title: string;
  description: string;
  phase: string;
}

/**
 * Honest "not built yet" surface for routes whose real implementation is a
 * later phase. Deliberately not a populated mock dashboard — per the master
 * prompt, a route must never present demonstration data as live, and an
 * unfinished feature should say so plainly rather than fake completeness.
 */
export function PlaceholderScreen({ title, description, phase }: PlaceholderScreenProps) {
  return (
    <div className={styles.wrap}>
      <span className={styles.tag}>Development — not yet built</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{description}</p>
      <p className={styles.body}>Planned for {phase} of the build.</p>
    </div>
  );
}
