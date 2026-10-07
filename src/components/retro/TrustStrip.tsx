import styles from "./TrustStrip.module.css";

const items = [
  { icon: "●", label: "LIVE RESULTS" },
  { icon: "▥", label: "ROI TRACKED" },
  { icon: "◆", label: "EVERY PICK RECORDED" },
  { icon: "■", label: "NO DELETED LOSSES" },
] as const;

export default function TrustStrip() {
  return (
    <section
      className={styles.strip}
      aria-label="Transparency standards"
    >
      {items.map((item) => (
        <div className={styles.item} key={item.label}>
          <span aria-hidden="true">{item.icon}</span>
          <strong>{item.label}</strong>
        </div>
      ))}
    </section>
  );
}
