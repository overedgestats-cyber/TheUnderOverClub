import Link from "next/link";

import RetroHero from "@/components/retro/RetroHero";
import { pageMetadata, SITE_URL } from "@/lib/seo/metadata";

import styles from "./page.module.css";

export const metadata = pageMetadata(
  "About Us — Our Football Picks & Method",
  "Learn how The Under Over Club analyses football, identifies value picks and tracks published results and ROI transparently.",
  "/about",
);

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About The Under Over Club",
  url: `${SITE_URL}/about`,
  mainEntity: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "The Under Over Club",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/under-over-club-logo.png`,
    email: "theunderoverclub@gmail.com",
    slogan: "Stats. Goals. Profit. In that order.",
  },
};

const principles = [
  {
    icon: "▥",
    label: "DATA FIRST",
    title: "Football first. Data behind every pick.",
    text:
      "Our analysis considers recent team form, home and away performance, scoring patterns and the requirements of each market. We compare model estimates with bookmaker odds to assess potential value.",
    accent: "green",
  },
  {
    icon: "●",
    label: "PUBLIC + PREMIUM",
    title: "Free picks and the members' board.",
    text:
      "Free selections focus on Over/Under 2.5 goals. The members' board also covers BTTS, 1X2 and Double Chance. A listed fixture does not automatically mean there is a recommended bet.",
    accent: "gold",
  },
  {
    icon: "◎",
    label: "TRANSPARENT TRACKING",
    title: "The record includes the losses.",
    text:
      "Published selections and odds are fixed. After a match finishes, the result settles the selection. Wins, losses, voids and pending picks remain part of the record, with ROI calculated from settled priced picks.",
    accent: "blue",
  },
  {
    icon: "◇",
    label: "RESPONSIBLE PLAY",
    title: "Analysis, never guarantees.",
    text:
      "Probabilities express uncertainty. Even a carefully researched selection can lose, and past results do not guarantee future performance. Never stake money you cannot afford to lose.",
    accent: "purple",
  },
] as const;

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <RetroHero
        eyebrow="THE STORY BEHIND THE PICKS"
        title={<>ABOUT THE UNDER OVER CLUB</>}
        subtitle="DATA-LED FOOTBALL ANALYSIS. TRANSPARENT RESULTS. VALUE BEFORE HYPE."
        badge="ABOUT THE CLUB"
        variant="green"
      />

      <section className={styles.statusStrip}>
        <div>
          <span className={styles.green}>▥</span>
          <p>
            <small>OUR METHOD</small>
            <strong>DATA-LED</strong>
          </p>
        </div>

        <div>
          <span className={styles.gold}>●</span>
          <p>
            <small>OUR FOCUS</small>
            <strong>VALUE</strong>
          </p>
        </div>

        <div>
          <span className={styles.blue}>◎</span>
          <p>
            <small>OUR SCOREBOARD</small>
            <strong>ROI</strong>
          </p>
        </div>

        <div>
          <span className={styles.purple}>◇</span>
          <p>
            <small>OUR RULE</small>
            <strong>NO GUARANTEES</strong>
          </p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <span>★</span>
            <h2>WHO WE ARE</h2>
          </div>
          <strong>STATS. GOALS. PROFIT.</strong>
        </div>

        <div className={styles.intro}>
          <div className={styles.introBadge}>TUOC</div>
          <div>
            <h1>BUILT FOR FOOTBALL PEOPLE WHO WANT THE NUMBERS.</h1>
            <p>
              The Under Over Club analyses European football and selected
              international competitions to identify situations where our
              estimated probability is higher than the probability implied by
              the available odds.
            </p>
            <p>
              The objective is not to predict every match correctly. It is to
              make disciplined, trackable decisions and judge performance by
              the quality of the price and the long-run return.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <span>◆</span>
            <h2>THE CLUB CODE</h2>
          </div>
          <strong>4 CORE PRINCIPLES</strong>
        </div>

        <div className={styles.grid}>
          {principles.map((item) => (
            <article
              key={item.label}
              className={`${styles.card} ${styles[item.accent]}`}
            >
              <div className={styles.cardHeader}>
                <span>{item.icon}</span>
                <small>{item.label}</small>
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              {item.label === "TRANSPARENT TRACKING" ? (
                <Link href="/statistics">VIEW STATISTICS ▶</Link>
              ) : null}

              {item.label === "RESPONSIBLE PLAY" ? (
                <Link href="/responsible-play">RESPONSIBLE PLAY ▶</Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contactPanel}>
        <div>
          <span>CONTACT TERMINAL</span>
          <h2>QUESTIONS ABOUT THE CLUB?</h2>
          <p>
            Membership, results, methodology or anything else — send us a
            message.
          </p>
          <a href="mailto:theunderoverclub@gmail.com">
            theunderoverclub@gmail.com
          </a>
        </div>

        <div className={styles.actions}>
          <Link href="/today">FREE PICKS</Link>
          <Link href="/guides">GUIDES</Link>
          <Link href="/subscription">MEMBERSHIP</Link>
        </div>
      </section>
    </main>
  );
}
