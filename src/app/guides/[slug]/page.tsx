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
        <span>/</span>
        <Link href="/guides">GUIDES</Link>
        <span>/</span>
        <strong>{article.category}</strong>
      </nav>

      <header className={styles.hero}>
        <span>{article.eyebrow}</span>
        <h1>{article.title}</h1>
        <p>{article.intro}</p>
      </header>

      <div className={styles.layout}>
        <article className={styles.article}>
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>

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
            <h2>Responsible betting</h2>
            <p>
              Football probabilities are estimates, not guarantees. Past
              results do not ensure future performance. Never stake money you
              cannot afford to lose and use licensed operators where gambling
              is legal for you.
            </p>
            <Link href="/responsible-play">
              READ RESPONSIBLE PLAY GUIDANCE →
            </Link>
          </section>
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.sideBox}>
            <span>SEE THE MODEL IN ACTION</span>
            <h2>TODAY&apos;S FREE PICKS</h2>
            <p>
              View the public O/U 2.5 selections currently published by The
              Under Over Club.
            </p>
            <Link href="/today">OPEN FREE PICKS</Link>
          </div>

          <div className={styles.sideBox}>
            <span>TRANSPARENT RECORD</span>
            <h2>TRACK THE ROI</h2>
            <p>
              Review settled free and paid selections, profit/loss and ROI.
            </p>
            <Link href="/statistics">VIEW STATISTICS</Link>
          </div>
        </aside>
      </div>

      <section className={styles.related}>
        <div className={styles.relatedTitle}>
          <span>◆</span>
          <h2>RELATED GUIDES</h2>
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

      <section className={styles.endCta}>
        <div>
          <span>STATS. GOALS. PROFIT.</span>
          <h2>KEEP LEARNING OR CHECK TODAY&apos;S BOARD</h2>
        </div>
        <div>
          <Link href="/guides">ALL GUIDES</Link>
          <Link href="/today">FREE PICKS</Link>
          <Link href="/subscription">MEMBERSHIP</Link>
        </div>
      </section>
    </main>
  );
}
