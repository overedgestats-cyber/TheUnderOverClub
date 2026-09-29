import type { Metadata } from "next";
import Link from "next/link";

import styles from "./About.module.css";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how The Under Over Club uses football data, model probabilities, market odds and transparent settled results to publish free and members-only picks.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About The Under Over Club",
    description:
      "A data-driven football picks platform focused on transparent statistics, published probabilities and real settled results.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>PLAYER PROFILE</span>
        <h1>ABOUT THE UNDER OVER CLUB</h1>
        <p>
          We built The Under Over Club around a simple idea: football picks
          should be driven by data, published transparently, and judged by
          real results.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">▥</span>
          <h2>DATA FIRST</h2>
          <p>
            Our analysis uses recent team performance, home and away form,
            goals data, model probabilities, bookmaker-implied probabilities
            and value edge.
          </p>
        </article>

        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">◎</span>
          <h2>TRANSPARENT RESULTS</h2>
          <p>
            Published picks are tracked after release and settled against the
            final match result. Win rate, units and ROI are calculated from
            the recorded results rather than edited retrospectively.
          </p>
        </article>

        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">◆</span>
          <h2>FREE + MEMBER PICKS</h2>
          <p>
            Free Picks focus on selected Over/Under 2.5 opportunities. The
            members board expands coverage across O/U 2.5, BTTS, Double Chance
            and 1X2 when a recommendation meets the model rules.
          </p>
        </article>

        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">★</span>
          <h2>BUILT FOR LONG-TERM TRACKING</h2>
          <p>
            We keep the focus on repeatable process and measurable performance.
            No fixed-match claims, no guaranteed wins, and no rewriting losing
            selections after publication.
          </p>
        </article>
      </section>

      <section className={styles.process}>
        <span className={styles.eyebrow}>HOW IT WORKS</span>
        <h2>FROM FIXTURE TO PUBLISHED PICK</h2>

        <ol>
          <li>
            <strong>01 — COLLECT</strong>
            <span>Fixtures, recent performance and market data are gathered.</span>
          </li>
          <li>
            <strong>02 — MODEL</strong>
            <span>Probabilities, confidence and data quality are calculated.</span>
          </li>
          <li>
            <strong>03 — COMPARE</strong>
            <span>Model probability is compared with the market-implied probability.</span>
          </li>
          <li>
            <strong>04 — PUBLISH</strong>
            <span>Qualifying recommendations are published and then kept immutable.</span>
          </li>
          <li>
            <strong>05 — SETTLE</strong>
            <span>Results are settled from final scores and added to the public statistics.</span>
          </li>
        </ol>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}>CHECK THE RECORD</span>
          <h2>SEE THE NUMBERS, NOT THE HYPE.</h2>
          <p>
            Review our tracked performance or open today&apos;s published picks.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/statistics">VIEW STATISTICS</Link>
          <Link href="/today">TODAY&apos;S FREE PICKS</Link>
        </div>
      </section>

      <p className={styles.responsible}>
        Football betting involves risk. Past performance does not guarantee
        future results. Bet responsibly and only with money you can afford to lose.
      </p>
    </main>
  );
}
