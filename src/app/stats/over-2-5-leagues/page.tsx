import type { Metadata } from "next";
import Link from "next/link";

import RetroHero from "@/components/retro/RetroHero";
import {
  getCurrentEuropeanSeasonStartYear,
  getOver25LeagueRankings,
} from "@/lib/seo-stats/over25-leagues";
import { SITE_URL } from "@/lib/seo/metadata";

import LeagueMarketRanking from "./LeagueMarketRanking";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function currentSeasonLabel() {
  const start = getCurrentEuropeanSeasonStartYear();
  return `${start}/${String(start + 1).slice(-2)}`;
}

export function generateMetadata(): Metadata {
  const season = currentSeasonLabel();

  return {
    title: `Over 2.5, Under 2.5 & BTTS League Stats ${season}`,
    description:
      `Live ${season} football league rankings for Over 2.5, Under 2.5, BTTS and average goals across 10 major European leagues.`,
    alternates: {
      canonical: "/stats/over-2-5-leagues",
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: "The Under Over Club",
      title: `Over 2.5, Under 2.5 & BTTS League Stats ${season}`,
      description:
        "Interactive full-season ranking of 10 major European football leagues by Over 2.5, Under 2.5 or BTTS percentage.",
      url: "/stats/over-2-5-leagues",
    },
  };
}

function formattedUpdatedAt(value: string | null) {
  if (!value) {
    return "LIVE DATABASE";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default async function Over25LeagueStatsPage() {
  const seasonStartYear =
    getCurrentEuropeanSeasonStartYear();

  let data:
    | Awaited<
        ReturnType<
          typeof getOver25LeagueRankings
        >
      >
    | null = null;

  let errorMessage = "";

  try {
    data =
      await getOver25LeagueRankings(
        seasonStartYear,
      );
  } catch (error) {
    console.error(
      "[SEO stats] Could not load league rankings:",
      error,
    );

    errorMessage =
      "Live full-season league data is temporarily unavailable. Please check again later.";
  }

  const rankings = data?.rankings ?? [];

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `European Over 2.5, Under 2.5 and BTTS League Statistics ${
      data?.seasonLabel ??
      currentSeasonLabel()
    }`,
    description:
      "Completed current-season fixtures across 10 major European domestic leagues with Over 2.5, Under 2.5, BTTS and average goals statistics.",
    url: `${SITE_URL}/stats/over-2-5-leagues`,
    creator: {
      "@type": "Organization",
      name: "The Under Over Club",
      url: SITE_URL,
    },
    dateModified:
      data?.updatedAt ?? undefined,
    variableMeasured: [
      "Over 2.5 goals percentage",
      "Under 2.5 goals percentage",
      "BTTS percentage",
      "Average total goals",
      "Completed matches analysed",
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datasetSchema,
          ).replace(/</g, "\\u003c"),
        }}
      />

      <RetroHero
        eyebrow="LIVE FULL-SEASON FOOTBALL STATISTICS"
        title={
          <>
            OVER / UNDER 2.5 + BTTS
            LEAGUE STATS
          </>
        }
        subtitle={`${
          data?.seasonLabel ??
          currentSeasonLabel()
        } · 10 EUROPEAN LEAGUES · COMPLETED MATCHES`}
        badge="UPDATED EVERY 12 HOURS"
        variant="green"
      />

      <section
        className={styles.summaryStrip}
      >
        <div>
          <span>▥</span>
          <p>
            <small>SEASON</small>
            <strong>
              {data?.seasonLabel ??
                currentSeasonLabel()}
            </strong>
          </p>
        </div>

        <div>
          <span>●</span>
          <p>
            <small>LEAGUES</small>
            <strong>
              {data?.leaguesAnalysed ??
                "—"}{" "}
              / 10
            </strong>
          </p>
        </div>

        <div>
          <span>◎</span>
          <p>
            <small>
              FULL-SEASON MATCHES
            </small>
            <strong>
              {data?.matchesAnalysed ??
                "—"}
            </strong>
          </p>
        </div>

        <div>
          <span>↻</span>
          <p>
            <small>LAST REFRESH</small>
            <strong>
              {formattedUpdatedAt(
                data?.updatedAt ?? null,
              )}
            </strong>
          </p>
        </div>
      </section>

      {errorMessage ? (
        <section
          className={styles.errorPanel}
        >
          <strong>
            LIVE DATA TEMPORARILY
            UNAVAILABLE
          </strong>
          <p>{errorMessage}</p>
        </section>
      ) : null}

      {rankings.length > 0 ? (
        <LeagueMarketRanking
          rankings={rankings}
        />
      ) : null}

      <section
        className={styles.infoGrid}
      >
        <article
          className={styles.infoCard}
        >
          <span>01</span>
          <h2>
            Switch the ranking by market
          </h2>
          <p>
            Use the Over 2.5, Under 2.5
            and BTTS buttons to rank the
            same 10 leagues by the market
            you want to analyse.
          </p>
        </article>

        <article
          className={styles.infoCard}
        >
          <span>02</span>
          <h2>
            Over and Under add to 100%
          </h2>
          <p>
            With the 2.5-goal line there
            is no push. If 62% of matches
            finish Over 2.5, the remaining
            38% finish Under 2.5.
          </p>
        </article>

        <article
          className={styles.infoCard}
        >
          <span>03</span>
          <h2>
            BTTS is a different market
          </h2>
          <p>
            BTTS measures how often both
            teams score. A 3-0 match is
            Over 2.5 but BTTS No, while
            1-1 is Under 2.5 but BTTS Yes.
          </p>
        </article>
      </section>

      <section className={styles.cta}>
        <div>
          <span>
            LEAGUE DATA IS CONTEXT
          </span>
          <h2>
            THE INDIVIDUAL MATCH STILL
            NEEDS A PRICE AND A PROBABILITY
          </h2>
          <p>
            Use the league table to
            understand the scoring
            environment, then move to
            match-level analysis and
            today&apos;s selections.
          </p>
        </div>

        <div
          className={styles.ctaLinks}
        >
          <Link href="/guides/how-to-predict-over-2-5-goals">
            O2.5 ANALYSIS GUIDE
          </Link>
          <Link href="/guides/under-2-5-goals">
            UNDER 2.5 GUIDE
          </Link>
          <Link href="/guides/btts-strategy">
            BTTS GUIDE
          </Link>
          <Link href="/today">
            FREE PICKS
          </Link>
          <Link href="/statistics">
            ROI STATS
          </Link>
        </div>
      </section>
    </main>
  );
}
