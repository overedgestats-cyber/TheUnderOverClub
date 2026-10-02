import styles from "./RetroHero.module.css";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  badge?: React.ReactNode;
  variant?: "green" | "gold" | "blue" | "purple";
};

export default function RetroHero({
  eyebrow,
  title,
  subtitle,
  badge,
  variant = "green",
}: Props) {
  return (
    <section className={`${styles.hero} ${styles[variant]}`}>
      <div className={styles.stars} />
      <div className={styles.floodlightLeft} />
      <div className={styles.floodlightRight} />

      <div className={styles.copy}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        {badge ? <div className={styles.badge}>{badge}</div> : null}
      </div>

      <div className={styles.standBack} />
      <div className={styles.standFront} />

      <div className={styles.pitch}>
        <span className={styles.midline} />
        <span className={styles.centerCircle} />
        <span className={styles.goal} />
      </div>
    </section>
  );
}
