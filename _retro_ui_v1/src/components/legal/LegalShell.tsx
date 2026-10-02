import Image from "next/image";
import Link from "next/link";

import styles from "./LegalShell.module.css";

type LegalShellProps = {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
};

export default function LegalShell({
  eyebrow,
  title,
  updated,
  children,
}: LegalShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/brand/under-over-club-logo.png"
              width={88}
              height={88}
              alt=""
            />
            <span>THE UNDER OVER CLUB</span>
          </Link>

          <nav>
            <Link href="/today">FREE PICKS</Link>
            <Link href="/statistics">STATS</Link>
            <Link href="/subscription">MEMBERSHIP</Link>
          </nav>
        </header>

        <section className={styles.hero}>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>LAST UPDATED: {updated.toUpperCase()}</p>
        </section>

        <article className={styles.content}>{children}</article>

        <footer className={styles.footer}>
          <strong>STATS. GOALS. PROFIT.</strong>

          <nav>
            <Link href="/terms">TERMS</Link>
            <Link href="/privacy">PRIVACY</Link>
            <Link href="/responsible-play">RESPONSIBLE PLAY</Link>
            <Link href="/contact">CONTACT</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
