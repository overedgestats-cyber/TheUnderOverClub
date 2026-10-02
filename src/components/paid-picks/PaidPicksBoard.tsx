"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import styles from "./PaidPicksBoard.module.css";

type PaidPick = {
  id: string;
  rank: number;
  competition: string;
  kickoffAt: string | null;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  market: string;
  selection: string;
  odds: number;
  modelProbabilityPct: number;
  fairBookmakerProbabilityPct: number | null;
  confidencePct: number;
  fairValueEdgePct: number | null;
  dataQualityPct: number | null;
  expectedGoalsTotal: number | null;
  analysisReasons: string[];
  resultStatus: string;
};

type Filter =
  | "all"
  | "ou25"
  | "btts"
  | "double_chance"
  | "one_x_two";

function kickoff(
  value: string | null,
) {
  if (!value) return "TBC";

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Europe/Sofia",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(new Date(value));
}

function marketKey(
  market: string,
): Exclude<Filter, "all"> {
  const normalized =
    market
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "_",
      );

  if (
    normalized.includes("btts") ||
    normalized.includes("both_teams")
  ) {
    return "btts";
  }

  if (
    normalized.includes("double") ||
    normalized.includes("chance")
  ) {
    return "double_chance";
  }

  if (
    normalized.includes("1x2") ||
    normalized.includes("one_x_two") ||
    normalized.includes("match_winner")
  ) {
    return "one_x_two";
  }

  return "ou25";
}

function marketLabel(
  market: string,
) {
  const key = marketKey(market);

  if (key === "btts") return "BTTS";
  if (key === "double_chance") return "DOUBLE CHANCE";
  if (key === "one_x_two") return "1X2";
  return "OVER / UNDER";
}

function quality(
  confidence: number,
) {
  if (confidence >= 90) return "ELITE";
  if (confidence >= 82) return "STRONG";
  return "GOOD";
}

function TeamBadge({
  name,
  logo,
}: {
  name: string;
  logo: string | null;
}) {
  return (
    <span className={styles.teamBadge}>
      {logo ? (
        <img
          src={logo}
          alt={`${name} badge`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}

export default function PaidPicksBoard({
  picks,
}: {
  picks: PaidPick[];
}) {
  const [
    filter,
    setFilter,
  ] = useState<Filter>(
    "all",
  );

  const filtered =
    useMemo(
      () =>
        filter === "all"
          ? picks
          : picks.filter(
              (pick) =>
                marketKey(
                  pick.market,
                ) === filter,
            ),
      [
        filter,
        picks,
      ],
    );

  const summary =
    useMemo(() => {
      const total =
        picks.length;

      const averageOdds =
        total > 0
          ? picks.reduce(
              (
                sum,
                pick,
              ) =>
                sum +
                pick.odds,
              0,
            ) / total
          : 0;

      const averageConfidence =
        total > 0
          ? picks.reduce(
              (
                sum,
                pick,
              ) =>
                sum +
                pick.confidencePct,
              0,
            ) / total
          : 0;

      const edges =
        picks
          .map(
            (pick) =>
              pick.fairValueEdgePct,
          )
          .filter(
            (
              value,
            ): value is number =>
              value !== null,
          );

      const averageEdge =
        edges.length > 0
          ? edges.reduce(
              (
                sum,
                value,
              ) =>
                sum +
                value,
              0,
            ) /
            edges.length
          : null;

      return {
        total,
        averageOdds,
        averageConfidence,
        averageEdge,
      };
    }, [picks]);

  const filters: {
    key: Filter;
    label: string;
  }[] = [
    {
      key: "all",
      label: "ALL MARKETS",
    },
    {
      key: "ou25",
      label: "OVER / UNDER",
    },
    {
      key: "btts",
      label: "BTTS",
    },
    {
      key: "double_chance",
      label: "DOUBLE CHANCE",
    },
    {
      key: "one_x_two",
      label: "1X2",
    },
  ];

  return (
    <div className={styles.boardLayout}>
      <section className={styles.board}>
        <div className={styles.filters}>
          {filters.map(
            (item) => (
              <button
                key={item.key}
                type="button"
                className={
                  filter ===
                  item.key
                    ? styles.filterActive
                    : styles.filter
                }
                onClick={() =>
                  setFilter(
                    item.key,
                  )
                }
              >
                {item.label}
              </button>
            ),
          )}
        </div>

        <div className={styles.boardTitle}>
          <div>
            <span>◆</span>
            <h2>
              TODAY&apos;S PAID PICKS
            </h2>
          </div>

          <strong>
            {filtered.length} SHOWN
          </strong>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            NO OFFICIAL PICKS IN THIS MARKET FILTER.
          </div>
        ) : (
          <div className={styles.rows}>
            {filtered.map(
              (pick) => {
                const key =
                  marketKey(
                    pick.market,
                  );

                return (
                  <article
                    key={pick.id}
                    className={`${styles.row} ${styles[key]}`}
                  >
                    <div className={styles.competition}>
                      <strong>
                        {pick.competition.toUpperCase()}
                      </strong>
                      <span>
                        {kickoff(
                          pick.kickoffAt,
                        )}{" "}
                        SOFIA
                      </span>
                    </div>

                    <div className={styles.fixture}>
                      <div>
                        <TeamBadge
                          name={pick.home}
                          logo={pick.homeLogo}
                        />
                        <strong>
                          {pick.home}
                        </strong>
                      </div>

                      <span>VS</span>

                      <div>
                        <TeamBadge
                          name={pick.away}
                          logo={pick.awayLogo}
                        />
                        <strong>
                          {pick.away}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.market}>
                      <span>
                        {marketLabel(
                          pick.market,
                        )}
                      </span>
                      <small>
                        MARKET
                      </small>
                    </div>

                    <div className={styles.selection}>
                      {pick.selection.toUpperCase()}
                    </div>

                    <div className={styles.odds}>
                      <span>
                        ODDS
                      </span>
                      <strong>
                        {pick.odds.toFixed(
                          2,
                        )}
                      </strong>
                    </div>

                    <div className={styles.confidence}>
                      <span>
                        CONFIDENCE
                      </span>
                      <strong>
                        {pick.confidencePct}%
                      </strong>

                      <div className={styles.progress}>
                        <i
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                pick.confidencePct,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className={styles.quality}>
                      <span>
                        {quality(
                          pick.confidencePct,
                        )}
                      </span>
                      <small>
                        EDGE{" "}
                        {pick.fairValueEdgePct ===
                        null
                          ? "—"
                          : `${pick.fairValueEdgePct >= 0 ? "+" : ""}${pick.fairValueEdgePct}%`}
                      </small>
                    </div>

                    <div className={styles.analysisPanel}>
                      <div className={styles.analysisMetrics}>
                        <div>
                          <span>
                            MODEL PROB.
                          </span>
                          <strong>
                            {pick.modelProbabilityPct}%
                          </strong>
                        </div>

                        <div>
                          <span>
                            FAIR MARKET
                          </span>
                          <strong>
                            {pick.fairBookmakerProbabilityPct ===
                            null
                              ? "—"
                              : `${pick.fairBookmakerProbabilityPct}%`}
                          </strong>
                        </div>

                        <div>
                          <span>
                            VALUE EDGE
                          </span>
                          <strong>
                            {pick.fairValueEdgePct ===
                            null
                              ? "—"
                              : `${pick.fairValueEdgePct >= 0 ? "+" : ""}${pick.fairValueEdgePct}pp`}
                          </strong>
                        </div>

                        <div>
                          <span>
                            DATA QUALITY
                          </span>
                          <strong>
                            {pick.dataQualityPct ===
                            null
                              ? "—"
                              : `${pick.dataQualityPct}%`}
                          </strong>
                        </div>
                      </div>

                      <div className={styles.analysisCopy}>
                        <div className={styles.analysisHeading}>
                          <strong>
                            WHY THIS PICK?
                          </strong>
                          <span>
                            FROZEN PUBLICATION ANALYSIS
                          </span>
                        </div>

                        <ul>
                          {pick.analysisReasons.map(
                            (
                              reason,
                            ) => (
                              <li
                                key={
                                  reason
                                }
                              >
                                {
                                  reason
                                }
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}

        <div className={styles.boardFooter}>
          <span>
            ● ALL PICKS ARE OFFICIAL PUBLISHED RECOMMENDATIONS.
          </span>
          <Link href="/statistics">
            VIEW HISTORY ▶
          </Link>
        </div>
      </section>

      <aside className={styles.side}>
        <article className={styles.sideCard}>
          <span>
            TODAY&apos;S BOARD
          </span>

          <div className={styles.summaryList}>
            <div>
              <p>
                TOTAL PICKS
              </p>
              <strong>
                {summary.total}
              </strong>
            </div>

            <div>
              <p>AVG ODDS</p>
              <strong>
                {summary.total >
                0
                  ? summary.averageOdds.toFixed(
                      2,
                    )
                  : "—"}
              </strong>
            </div>

            <div>
              <p>AVG CONF.</p>
              <strong>
                {summary.total >
                0
                  ? `${summary.averageConfidence.toFixed(
                      1,
                    )}%`
                  : "—"}
              </strong>
            </div>
          </div>

          <div className={styles.edgeBox}>
            <span>
              AVG VALUE EDGE
            </span>
            <strong>
              {summary.averageEdge ===
              null
                ? "—"
                : `+${summary.averageEdge.toFixed(
                    1,
                  )}%`}
            </strong>
          </div>
        </article>

        <article className={styles.sideCard}>
          <span className={styles.goldTitle}>
            BOARD RULES
          </span>

          <ul>
            <li>
              Maximum 3 official recommendations per fixture.
            </li>
            <li>
              Model probability and confidence are separate metrics.
            </li>
            <li>
              Opening the page never recalculates the model.
            </li>
          </ul>
        </article>
      </aside>
    </div>
  );
}
