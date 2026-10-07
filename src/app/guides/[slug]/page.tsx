import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  guideArticles,
  guideBySlug,
} from "@/lib/guides/articles";
import { SITE_URL } from "@/lib/seo/metadata";

import styles from "./page.module.css";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guideArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = guideBySlug.get(slug);

  if (!article) {
    return {};
  }

  const path = `/guides/${article.slug}`;

  return {
    title: article.seoTitle,
    description: article.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      locale: "en_GB",
      siteName: "The Under Over Club",
      title: article.seoTitle,
      description: article.description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.description,
    },
  };
}

export default async function GuideArticlePage({
  params,
}: Props) {
  const { slug } = await params;
  const article = guideBySlug.get(slug);

  if (!article) {
    notFound();
  }

  const related = article.related
    .map((relatedSlug) => guideBySlug.get(relatedSlug))
    .filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: `${SITE_URL}/guides/${article.slug}`,
    url: `${SITE_URL}/guides/${article.slug}`,
    author: {
      "@type": "Organization",
      name: "The Under Over Club",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "The Under Over Club",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/under-over-club-logo.png`,
      },
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: "Football Betting Guides",
      url: `${SITE_URL}/guides`,
    },
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/guides/${article.slug}`,
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c"),
        }}
      />

      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">HOME</Link>
        <span>▶</span>
        <Link href="/guides">GUIDES</Link>
        <span>▶</span>
        <strong>{article.category}</strong>
      </nav>

      <section className={styles.titlePanel}>
        <div className={styles.titleBar}>
          <div>
            <span>★</span>
            <strong>{article.eyebrow}</strong>
          </div>
          <small>{article.category}</small>
        </div>

        <div className={styles.titleContent}>
          <h1>{article.title}</h1>
          <p>{article.intro}</p>
        </div>
      </section>

      <div className={styles.layout}>
        <article className={styles.article}>
          {article.slug === "best-leagues-over-2-5-goals" ? (
            <section>
              <div className={styles.sectionTitle}>
                <span>LIVE</span>
                <h2>See the current-season league rankings</h2>
              </div>
              <p>
                We now maintain a live table ranking tracked European leagues
                by Over 2.5 percentage, average goals, BTTS rate and home/away
                goal averages using completed matches in the live database.
              </p>
              <Link href="/stats/over-2-5-leagues">
                OPEN LIVE OVER 2.5 LEAGUE STATS ▶
              </Link>
            </section>
          ) : null}

          {article.sections.map((section, index) => (
            <section key={section.heading}>
              <div className={styles.sectionTitle}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.heading}</h2>
              </div>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className={styles.responsible}>
            <div className={styles.sectionTitle}>
              <span>!</span>
              <h2>Responsible betting</h2>
            </div>
            <p>
              Football probabilities are estimates, not guarantees. Past
              results do not ensure future performance. Never stake money you
              cannot afford to lose and use licensed operators where gambling
              is legal for you.
            </p>
            <Link href="/responsible-play">
              READ RESPONSIBLE PLAY GUIDANCE ▶
            </Link>
          </section>
        </article>

        <aside className={styles.sidebar}>
          {article.slug === "best-leagues-over-2-5-goals" ? (
            <div className={styles.sideBox}>
              <div className={styles.sideTitle}>
                <span>▲</span>
                <strong>LIVE LEAGUE STATS</strong>
              </div>
              <p>
                See which tracked leagues currently have the highest Over 2.5
                rates this season.
              </p>
              <Link href="/stats/over-2-5-leagues">
                OPEN LIVE RANKING
              </Link>
            </div>
          ) : null}

          <div className={styles.sideBox}>
            <div className={styles.sideTitle}>
              <span>●</span>
              <strong>FREE PICKS</strong>
            </div>
            <p>
              View the public O/U 2.5 selections currently published by The
              Under Over Club.
            </p>
            <Link href="/today">OPEN FREE PICKS</Link>
          </div>

          <div className={styles.sideBox}>
            <div className={styles.sideTitle}>
              <span>▥</span>
              <strong>ROI TRACKER</strong>
            </div>
            <p>
              Review settled free and paid selections, profit/loss and ROI.
            </p>
            <Link href="/statistics">VIEW STATISTICS</Link>
          </div>

          <div className={styles.sideBox}>
            <div className={styles.sideTitle}>
              <span>◆</span>
              <strong>ALL GUIDES</strong>
            </div>
            <p>
              Continue learning about markets, odds, probability and value.
            </p>
            <Link href="/guides">BACK TO GUIDES</Link>
          </div>
        </aside>
      </div>

      <section className={styles.related}>
        <div className={styles.relatedTitle}>
          <div>
            <span>◆</span>
            <h2>RELATED GUIDES</h2>
          </div>
          <strong>KEEP LEARNING</strong>
        </div>

        <div className={styles.relatedGrid}>
          {related.map((item) =>
            item ? (
              <Link href={`/guides/${item.slug}`} key={item.slug}>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <span>READ GUIDE ▶</span>
              </Link>
            ) : null,
          )}
        </div>
      </section>
    </main>
  );
}
