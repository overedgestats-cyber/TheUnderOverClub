import type { Metadata } from "next";
import Link from "next/link";

import {
  guideArticles,
  guideCategories,
} from "@/lib/guides/articles";
import { SITE_URL } from "@/lib/seo/metadata";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Football Betting Guides & Analysis",
  description:
    "Learn Over/Under 2.5 goals, BTTS, football betting odds, implied probability, value betting, Double Chance, 1X2 and betting ROI with practical data-led guides.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "The Under Over Club",
    title: "Football Betting Guides & Analysis",
    description:
      "Practical football betting guides built around goals, probability, odds, value and ROI.",
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

      <header className={styles.hero}>
        <span className={styles.kicker}>THE UNDER OVER CLUB ACADEMY</span>
        <h1>FOOTBALL BETTING GUIDES</h1>
        <p>
          Learn the markets, understand the numbers and see how odds,
          probability, value and ROI fit together.
        </p>
        <div className={styles.heroLinks}>
          <Link href="/today">TODAY&apos;S FREE PICKS</Link>
          <Link href="/statistics">VIEW STATISTICS</Link>
        </div>
      </header>

      <section className={styles.intro}>
        <strong>STATS. GOALS. PROFIT. IN THAT ORDER.</strong>
        <p>
          These guides are educational. They explain the football markets and
          statistical concepts used throughout the site. Probabilities are
          estimates, not guarantees, and betting always involves risk.
        </p>
      </section>

      {guideCategories.map((category) => {
        const articles = guideArticles.filter(
          (article) => article.category === category,
        );

        return (
          <section className={styles.category} key={category}>
            <div className={styles.categoryHeading}>
              <span>◆</span>
              <h2>{category}</h2>
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
          <span>READY TO SEE THE DATA IN ACTION?</span>
          <h2>FROM LEARNING TO LIVE PICKS</h2>
          <p>
            Explore today&apos;s free O/U 2.5 selections, the historical
            statistics page and the members&apos; board.
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
