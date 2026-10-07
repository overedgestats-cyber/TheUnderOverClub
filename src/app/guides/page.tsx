import type { Metadata } from "next";
import Link from "next/link";

import RetroHero from "@/components/retro/RetroHero";
import {
  guideArticles,
  guideCategories,
} from "@/lib/guides/articles";
import { SITE_URL } from "@/lib/seo/metadata";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Football Betting Guides & Analysis",
  description:
    "Football betting guides covering Over/Under goals, BTTS, xG, odds, implied probability, fair odds, value betting, bankroll management and ROI.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "The Under Over Club",
    title: "Football Betting Guides & Analysis",
    description:
      "Practical football betting guides built around goals, statistics, probability, odds, value and ROI.",
    url: "/guides",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Football Betting Guides",
  description:
    "Educational football betting guides from The Under Over Club.",
  url: `${SITE_URL}/guides`,
  isPartOf: {
    "@type": "WebSite",
    name: "The Under Over Club",
    url: SITE_URL,
  },
  hasPart: guideArticles.map((article) => ({
    "@type": "Article",
    headline: article.title,
    url: `${SITE_URL}/guides/${article.slug}`,
  })),
};

export default function GuidesPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <RetroHero
        eyebrow="THE UNDER OVER CLUB ACADEMY"
        title={<>FOOTBALL BETTING GUIDES</>}
        subtitle="LEARN THE MARKETS. UNDERSTAND THE NUMBERS. FIND THE VALUE."
        badge={`${guideArticles.length} GUIDES ONLINE`}
        variant="gold"
      />

      <section className={styles.statusStrip}>
        {guideCategories.map((category, index) => {
          const count = guideArticles.filter(
            (article) => article.category === category,
          ).length;

          const icon = index === 0 ? "▥" : index === 1 ? "◆" : "◎";
          const tone =
            index === 0
              ? styles.green
              : index === 1
                ? styles.gold
                : styles.purple;

          return (
            <div key={category}>
              <span className={tone}>{icon}</span>
              <p>
                <small>{category}</small>
                <strong>{count} GUIDES</strong>
              </p>
            </div>
          );
        })}

        <div>
          <span className={styles.blue}>▶</span>
          <p>
            <small>NEXT STEP</small>
            <strong>CHECK THE DATA</strong>
          </p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <span>★</span>
            <h2>THE ACADEMY</h2>
          </div>
          <strong>EDUCATION BEFORE ACTION</strong>
        </div>

        <div className={styles.intro}>
          <strong>STATS. GOALS. PROFIT. IN THAT ORDER.</strong>
          <p>
            These guides explain the football markets and statistical concepts
            used throughout the site. Probabilities are estimates, not
            guarantees, and betting always involves risk.
          </p>
          <div>
            <Link href="/today">FREE PICKS</Link>
            <Link href="/statistics">STATISTICS</Link>
          </div>
        </div>
      </section>

      {guideCategories.map((category) => {
        const articles = guideArticles.filter(
          (article) => article.category === category,
        );

        return (
          <section className={styles.panel} key={category}>
            <div className={styles.panelTitle}>
              <div>
                <span>◆</span>
                <h2>{category}</h2>
              </div>
              <strong>{articles.length} GUIDES</strong>
            </div>

            <div className={styles.grid}>
              {articles.map((article, index) => (
                <article className={styles.card} key={article.slug}>
                  <div className={styles.cardTop}>
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <small>{article.eyebrow}</small>
                  </div>

                  <h3>{article.title}</h3>
                  <p>{article.description}</p>

                  <Link href={`/guides/${article.slug}`}>
                    READ GUIDE <span aria-hidden="true">▶</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className={styles.cta}>
        <div>
          <span>READY TO USE THE KNOWLEDGE?</span>
          <h2>FROM LEARNING TO LIVE FOOTBALL DATA</h2>
          <p>
            Explore today&apos;s free selections, the historical ROI record and
            the members&apos; board.
          </p>
        </div>

        <div className={styles.ctaLinks}>
          <Link href="/today">FREE PICKS</Link>
          <Link href="/statistics">STATISTICS</Link>
          <Link href="/subscription">MEMBERSHIP</Link>
        </div>
      </section>
    </main>
  );
}
