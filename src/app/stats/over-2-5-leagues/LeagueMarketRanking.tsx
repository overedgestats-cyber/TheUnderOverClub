"use client";

import { useMemo, useState } from "react";

import type { Over25LeagueStat } from "@/lib/seo-stats/over25-leagues";

import styles from "./page.module.css";

type Market = "over25" | "under25" | "btts";

type Props = {
  rankings: Over25LeagueStat[];
};

const MARKET_LABELS: Record<Market, string> = {
  over25: "OVER 2.5",
  under25: "UNDER 2.5",
  btts: "BTTS",
};

function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

function decimal(value: number) {
  return value.toFixed(2);
}

function marketValue(
  league: Over25LeagueStat,
  market: Market,
) {
  if (market === "under25") {
    return league.under25Pct;
  }

  if (market === "btts") {
    return league.bttsPct;
  }

  return league.over25Pct;
}

function sortRankings(
  rankings: Over25LeagueStat[],
  market: Market,
) {
  return [...rankings]
    .sort(
      (a, b) =>
        marketValue(b, market) - marketValue(a, market) ||
        b.avgGoals - a.avgGoals ||
        b.matches - a.matches,
    )
    .map((league, index) => ({
      ...league,
      rank: index + 1,
    }));
}

export default function LeagueMarketRanking({
  rankings,
}: Props) {
  const [market, setMarket] =
    useState<Market>("over25");

  const sorted = useMemo(
    () => sortRankings(rankings, market),
    [rankings, market],
  );

  const topThree = sorted.slice(0, 3);

  return (
    <>
      <section className={styles.marketSwitcher}>
        <div>
          <span>RANK LEAGUES BY</span>
          <strong>{MARKET_LABELS[market]}</strong>
        </div>

        <div
          className={styles.marketButtons}
          role="group"
          aria-label="League ranking market"
        >
          {(
            [
              ["over25", "OVER 2.5"],
              ["under25", "UNDER 2.5"],
              ["btts", "BTTS"],
            ] as const
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={
                market === key
                  ? styles.marketButtonActive
                  : styles.marketButton
              }
              onClick={() => setMarket(key)}
              aria-pressed={market === key}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {topThree.length > 0 ? (
        <section className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <span>★</span>
              <h2>
                TOP 3 FOR {MARKET_LABELS[market]}
              </h2>
            </div>
            <strong>FULL CURRENT SEASON</strong>
          </div>

          <div className={styles.podium}>
            {topThree.map((league) => {
              const selectedValue =
                marketValue(league, market);

              return (
                <article
                  className={styles.podiumCard}
                  key={league.key}
                >
                  <span className={styles.rank}>
                    #{league.rank}
                  </span>

                  <small>{league.country}</small>
                  <h3>{league.league}</h3>

                  <div className={styles.primaryMarket}>
                    <strong
                      className={
                        market === "over25"
                          ? styles.overBig
                          : market === "under25"
                            ? styles.underBig
                            : styles.bttsBig
                      }
                    >
                      {pct(selectedValue)}
                    </strong>
                    <span>
                      {MARKET_LABELS[market]}
                    </span>
                  </div>

                  <div className={styles.secondaryRates}>
                    <div>
                      <small>OVER 2.5</small>
                      <strong>
                        {pct(league.over25Pct)}
                      </strong>
                    </div>

                    <div>
                      <small>UNDER 2.5</small>
                      <strong>
                        {pct(league.under25Pct)}
                      </strong>
                    </div>

                    <div>
                      <small>BTTS</small>
                      <strong>
                        {pct(league.bttsPct)}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.miniMetrics}>
                    <div>
                      <small>AVG GOALS</small>
                      <strong>
                        {decimal(league.avgGoals)}
                      </strong>
                    </div>
                    <div>
                      <small>MATCHES</small>
                      <strong>
                        {league.matches}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <span>▥</span>
            <h2>10-LEAGUE RANKING</h2>
          </div>
          <strong>
            RANKED BY {MARKET_LABELS[market]}
          </strong>
        </div>

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

          {sorted.map((league) => (
            <div
              className={styles.tableRow}
              key={league.key}
            >
              <strong className={styles.tableRank}>
                {league.rank}
              </strong>

              <div className={styles.leagueCell}>
                <strong>{league.league}</strong>
                <small>{league.country}</small>
              </div>

              <span>{league.matches}</span>

              <strong
                className={
                  market === "over25"
                    ? styles.selectedOver
                    : styles.overPct
                }
              >
                {pct(league.over25Pct)}
              </strong>

              <strong
                className={
                  market === "under25"
                    ? styles.selectedUnder
                    : styles.underPct
                }
              >
                {pct(league.under25Pct)}
              </strong>

              <strong
                className={
                  market === "btts"
                    ? styles.selectedBtts
                    : styles.bttsPct
                }
              >
                {pct(league.bttsPct)}
              </strong>

              <span>
                {decimal(league.avgGoals)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
