import type { Metadata } from "next";
import Link from "next/link";

import RetroHero from "@/components/retro/RetroHero";
import {
  getCurrentEuropeanSeasonStartYear,
  getOver25LeagueRankings,
} from "@/lib/seo-stats/over25-leagues";
import { SITE_URL } from "@/lib/seo/metadata";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function currentSeasonLabel() {
  const start = getCurrentEuropeanSeasonStartYear();
  return `${start}/${String(start + 1).slice(-2)}`;
}

export function generateMetadata(): Metadata {
  const season = currentSeasonLabel();

  return {
    title: `Best Leagues for Over & Under 2.5 Goals ${season} | Live Stats`,
    description:
      `Live ${season} football league stats for Over 2.5, Under 2.5, BTTS and average goals across 10 major European leagues.`,
    alternates: {
      canonical: "/stats/over-2-5-leagues",
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: "The Under Over Club",
      title: `Best Leagues for Over & Under 2.5 Goals ${season}`,
      description:
        "Live full-season Over 2.5, Under 2.5, BTTS and goals statistics for 10 major European football leagues.",
      url: "/stats/over-2-5-leagues",
    },
  };
}

function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

function decimal(value: number) {
  return value.toFixed(2);
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
  const seasonStartYear = getCurrentEuropeanSeasonStartYear();

  let data:
    | Awaited<ReturnType<typeof getOver25LeagueRankings>>
    | null = null;

  let errorMessage = "";

  try {
    data = await getOver25LeagueRankings(seasonStartYear);
  } catch (error) {
    console.error("[SEO stats] Could not load league rankings:", error);
    errorMessage =
      "Live full-season league data is temporarily unavailable. Please check again later.";
  }

  const rankings = data?.rankings ?? [];
  const topThree = rankings.slice(0, 3);

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `European Over and Under 2.5 League Statistics ${
      data?.seasonLabel ?? currentSeasonLabel()
    }`,
    description:
      "Completed current-season fixtures across 10 major European domestic leagues, ranked by Over 2.5 goals percentage and including Under 2.5 and BTTS rates.",
    url: `${SITE_URL}/stats/over-2-5-leagues`,
    creator: {
      "@type": "Organization",
      name: "The Under Over Club",
      url: SITE_URL,
    },
    dateModified: data?.updatedAt ?? undefined,
    variableMeasured: [
      "Over 2.5 goals percentage",
      "Under 2.5 goals percentage",
      "BTTS percentage",
      "Average total goals",
      "Completed matches analysed",
    ],
  };

  const rankingSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Over 2.5 Goals League Rankings ${
      data?.seasonLabel ?? currentSeasonLabel()
    }`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: rankings.length,
    itemListElement: rankings.map((league) => ({
      "@type": "ListItem",
      position: league.rank,
      name: `${league.league} — ${pct(
        league.over25Pct,
      )} Over 2.5 / ${pct(league.under25Pct)} Under 2.5`,
    })),
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datasetSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(rankingSchema).replace(/</g, "\\u003c"),
        }}
      />

      <RetroHero
        eyebrow="LIVE FULL-SEASON FOOTBALL STATISTICS"
        title={<>OVER / UNDER 2.5 LEAGUE STATS</>}
        subtitle={`${
          data?.seasonLabel ?? currentSeasonLabel()
        } · 10 EUROPEAN LEAGUES · COMPLETED MATCHES`}
        badge="UPDATED EVERY 12 HOURS"
        variant="green"
      />

      <section className={styles.summaryStrip}>
        <div>
          <span>▥</span>
          <p>
            <small>SEASON</small>
            <strong>{data?.seasonLabel ?? currentSeasonLabel()}</strong>
          </p>
        </div>
        <div>
          <span>●</span>
          <p>
            <small>LEAGUES</small>
            <strong>{data?.leaguesAnalysed ?? "—"} / 10</strong>
          </p>
        </div>
        <div>
          <span>◎</span>
          <p>
            <small>FULL-SEASON MATCHES</small>
            <strong>{data?.matchesAnalysed ?? "—"}</strong>
          </p>
        </div>
        <div>
          <span>↻</span>
          <p>
            <small>LAST REFRESH</small>
            <strong>{formattedUpdatedAt(data?.updatedAt ?? null)}</strong>
          </p>
        </div>
      </section>

      {errorMessage ? (
        <section className={styles.errorPanel}>
          <strong>LIVE DATA TEMPORARILY UNAVAILABLE</strong>
          <p>{errorMessage}</p>
        </section>
      ) : null}

      {topThree.length > 0 ? (
        <section className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <span>★</span>
              <h2>TOP 3 FOR OVER 2.5</h2>
            </div>
            <strong>FULL CURRENT SEASON</strong>
          </div>

          <div className={styles.podium}>
            {topThree.map((league) => (
              <article className={styles.podiumCard} key={league.key}>
                <span className={styles.rank}>#{league.rank}</span>
                <small>{league.country}</small>
                <h3>{league.league}</h3>

                <div className={styles.mainRates}>
                  <div>
                    <strong className={styles.overBig}>
                      {pct(league.over25Pct)}
                    </strong>
                    <span>OVER 2.5</span>
                  </div>

                  <div>
                    <strong className={styles.underBig}>
                      {pct(league.under25Pct)}
                    </strong>
                    <span>UNDER 2.5</span>
                  </div>
                </div>

                <div className={styles.miniMetrics}>
                  <div>
                    <small>AVG GOALS</small>
                    <strong>{decimal(league.avgGoals)}</strong>
                  </div>
                  <div>
                    <small>BTTS</small>
                    <strong>{pct(league.bttsPct)}</strong>
                  </div>
                  <div>
                    <small>MATCHES</small>
                    <strong>{league.matches}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <span>▥</span>
            <h2>10-LEAGUE RANKING</h2>
          </div>
          <strong>RANKED BY OVER 2.5 %</strong>
        </div>

        {rankings.length > 0 ? (
          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <span>#</span>
              <span>LEAGUE</span>
              <span>MATCHES</span>
              <span>OVER 2.5</span>
              <span>UNDER 2.5</span>
              <span>BTTS</span>
              <span>AVG GOALS</span>
            </div>

            {rankings.map((league) => (
              <div className={styles.tableRow} key={league.key}>
                <strong className={styles.tableRank}>{league.rank}</strong>

                <div className={styles.leagueCell}>
                  <strong>{league.league}</strong>
                  <small>{league.country}</small>
                </div>

                <span>{league.matches}</span>
                <strong className={styles.overPct}>
                  {pct(league.over25Pct)}
                </strong>
                <strong className={styles.underPct}>
                  {pct(league.under25Pct)}
                </strong>
                <span>{pct(league.bttsPct)}</span>
                <span>{decimal(league.avgGoals)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <strong>WAITING FOR FULL-SEASON DATA</strong>
            <p>
              The ranking will appear when API-Football returns completed
              current-season fixtures.
            </p>
          </div>
        )}
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <span>01</span>
          <h2>What does “matches” mean now?</h2>
          <p>
            It is the number of completed current-season fixtures returned by
            API-Football for that league — not just the dates previously
            imported by The Under Over Club.
          </p>
        </article>

        <article className={styles.infoCard}>
          <span>02</span>
          <h2>Over and Under are complementary</h2>
          <p>
            With the 2.5 line there is no push. If 62% of completed matches
            finish Over 2.5, the remaining 38% finish Under 2.5.
          </p>
        </article>

        <article className={styles.infoCard}>
          <span>03</span>
          <h2>What does BTTS show?</h2>
          <p>
            BTTS is the percentage of completed matches in which both teams
            scored at least once. It is related to goal totals, but it is a
            different market.
          </p>
        </article>
      </section>

      <section className={styles.cta}>
        <div>
          <span>LEAGUE DATA IS CONTEXT</span>
          <h2>THE INDIVIDUAL MATCH STILL NEEDS A PRICE AND A PROBABILITY</h2>
          <p>
            Use the league table to understand the scoring environment, then
            move to match-level analysis and today's selections.
          </p>
        </div>

        <div className={styles.ctaLinks}>
          <Link href="/guides/how-to-predict-over-2-5-goals">
            O2.5 ANALYSIS GUIDE
          </Link>
          <Link href="/guides/under-2-5-goals">
            UNDER 2.5 GUIDE
          </Link>
          <Link href="/today">FREE PICKS</Link>
          <Link href="/statistics">ROI STATS</Link>
        </div>
      </section>
    </main>
  );
}
