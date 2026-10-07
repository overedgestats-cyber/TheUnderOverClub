import Image from "next/image";

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
}: Props) {
  return (
    <section className={styles.hero}>
      <Image
        className={styles.heroImage}
        src="/brand/euro-arcade-bowl.jpg"
        alt="Retro pixel-art European football stadium at night with arcade scoreboards and The Under Over Club slogan"
        width={1536}
        height={1024}
        priority
        sizes="(max-width: 900px) 100vw, calc(100vw - 280px)"
      />

      <div className={styles.seoCopy}>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {badge ? <div>{badge}</div> : null}
      </div>
    </section>
  );
}
