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
    title: `Best Leagues for Over 2.5 Goals ${season} | Live Stats`,
    description:
      `Live ${season} Over 2.5 goals league rankings with matches analysed, goal averages, BTTS rates and home/away scoring data.`,
    alternates: {
      canonical: "/stats/over-2-5-leagues",
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: "The Under Over Club",
      title: `Best Leagues for Over 2.5 Goals ${season}`,
      description:
        "Live European football league rankings by Over 2.5 goals rate, average goals and BTTS.",
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
    console.error("[SEO stats] Could not load Over 2.5 league rankings:", error);
    errorMessage =
      "Live league data is temporarily unavailable. Please check again later.";
  }

  const rankings = data?.rankings ?? [];
  const topThree = rankings.slice(0, 3);

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Best Leagues for Over 2.5 Goals ${data?.seasonLabel ?? currentSeasonLabel()}`,
    description:
      "European football leagues ranked by the percentage of completed matches finishing with at least three total goals.",
    url: `${SITE_URL}/stats/over-2-5-leagues`,
    creator: {
      "@type": "Organization",
      name: "The Under Over Club",
      url: SITE_URL,
    },
    temporalCoverage: data
      ? `${data.seasonStartYear}-07-01/..`
      : undefined,
    dateModified: data?.updatedAt ?? undefined,
    variableMeasured: [
      "Over 2.5 goals percentage",
      "Average total goals",
      "BTTS percentage",
      "Average home goals",
      "Average away goals",
      "Completed matches analysed",
    ],
  };

  const rankingSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Over 2.5 Goals League Rankings ${data?.seasonLabel ?? currentSeasonLabel()}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: rankings.length,
    itemListElement: rankings.map((league) => ({
      "@type": "ListItem",
      position: league.rank,
      name: `${league.league} — ${pct(league.over25Pct)} Over 2.5`,
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
        eyebrow="LIVE FOOTBALL STATISTICS"
        title={<>BEST LEAGUES FOR OVER 2.5 GOALS</>}
        subtitle={`${data?.seasonLabel ?? currentSeasonLabel()} SEASON · COMPLETED MATCHES · LIVE DATABASE`}
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
            <strong>{data?.leaguesAnalysed ?? "—"}</strong>
          </p>
        </div>
        <div>
          <span>◎</span>
          <p>
            <small>MATCHES ANALYSED</small>
            <strong>{data?.matchesAnalysed ?? "—"}</strong>
          </p>
        </div>
        <div>
          <span>↻</span>
          <p>
            <small>LAST UPDATED</small>
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
              <h2>TOP OVER 2.5 LEAGUES</h2>
            </div>
            <strong>CURRENT SEASON</strong>
          </div>

          <div className={styles.podium}>
            {topThree.map((league) => (
              <article className={styles.podiumCard} key={league.key}>
                <span className={styles.rank}>#{league.rank}</span>
                <small>{league.country}</small>
                <h3>{league.league}</h3>
                <strong className={styles.bigPct}>
                  {pct(league.over25Pct)}
                </strong>
                <span className={styles.bigLabel}>OVER 2.5</span>

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
            <h2>FULL LEAGUE RANKING</h2>
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
              <span>AVG GOALS</span>
              <span>BTTS</span>
              <span>HOME AVG</span>
              <span>AWAY AVG</span>
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
                <span>{decimal(league.avgGoals)}</span>
                <span>{pct(league.bttsPct)}</span>
                <span>{decimal(league.avgHomeGoals)}</span>
                <span>{decimal(league.avgAwayGoals)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <strong>WAITING FOR ENOUGH COMPLETED MATCHES</strong>
            <p>
              A league appears after at least five completed matches are
              available in the live database.
            </p>
          </div>
        )}
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <span>01</span>
          <h2>How the ranking is calculated</h2>
          <p>
            We use completed current-season matches stored in The Under Over
            Club database. A match counts as Over 2.5 when the final total is
            three goals or more. The percentage is Over 2.5 matches divided by
            completed matches analysed.
          </p>
        </article>

        <article className={styles.infoCard}>
          <span>02</span>
          <h2>Does a high percentage mean every match is a bet?</h2>
          <p>
            No. League statistics describe the scoring environment. Individual
            fixtures still need team-level analysis, home and away context,
            probability estimates and a price that offers sufficient value.
          </p>
        </article>

        <article className={styles.infoCard}>
          <span>03</span>
          <h2>Why the rankings change</h2>
          <p>
            This is a live current-season table. As more matches finish, each
            league's Over 2.5 rate, goal average and BTTS rate can rise or fall.
            The cached ranking refreshes every 12 hours.
          </p>
        </article>
      </section>

      <section className={styles.cta}>
        <div>
          <span>FROM LEAGUE DATA TO MATCH ANALYSIS</span>
          <h2>LEAGUE TRENDS ARE CONTEXT — VALUE IS MATCH-SPECIFIC</h2>
          <p>
            Learn how to analyse Over 2.5 properly, then check today's public
            selections and the transparent ROI record.
          </p>
        </div>

        <div className={styles.ctaLinks}>
          <Link href="/guides/best-leagues-over-2-5-goals">
            READ THE GUIDE
          </Link>
          <Link href="/guides/how-to-predict-over-2-5-goals">
            PREDICTION METHOD
          </Link>
          <Link href="/today">FREE PICKS</Link>
          <Link href="/statistics">ROI STATS</Link>
        </div>
      </section>
    </main>
  );
}
