"use client";

import Link from "next/link";
import { useState } from "react";

import RetroHero from "@/components/retro/RetroHero";

import styles from "./StatisticsDashboard.module.css";

type Streak = {
  result: "won" | "lost" | null;
  count: number;
};

type PerformanceSummary = {
  totalPicks: number;
  settledPicks: number;
  resolvedPicks: number;
  pendingPicks: number;
  won: number;
  lost: number;
  void: number;
  unitsProfit: number;
  roiPct: number;
  averageOdds: number | null;
  currentStreak: Streak;
};

type MarketSummary = PerformanceSummary & {
  market: string;
};

type MonthSummary = PerformanceSummary & {
  month: string;
};

type StatisticsPayload = {
  overall: PerformanceSummary;
  byMarket?: MarketSummary[];
  byMonth?: MonthSummary[];
};

type Props = {
  free: StatisticsPayload;
  paid: StatisticsPayload;
  overview?: unknown;
};

type Tone =
  | "green"
  | "gold"
  | "blue"
  | "purple"
  | "orange"
  | "neutral";

const MARKET_LABELS: Record<string, string> = {
  ou25: "O/U 2.5",
  btts: "BTTS",
  one_x_two: "1X2",
  double_chance: "DOUBLE CHANCE",
};

function signed(value: number, suffix = "") {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}${suffix}`;
}

function streakLabel(streak: Streak) {
  if (!streak.result || streak.count === 0) {
    return "—";
  }

  return `${streak.result === "won" ? "W" : "L"}${streak.count}`;
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  tone: Tone;
}) {
  return (
    <div className={`${styles.metricCard} ${styles[tone]}`}>
      <span className={styles.metricIcon}>{icon}</span>
      <div>
        <span className={styles.metricLabel}>{label}</span>
        <strong className={styles.metricValue}>{value}</strong>
        {sub ? <small>{sub}</small> : null}
      </div>
    </div>
  );
}

function PerformanceSection({
  title,
  eyebrow,
  summary,
  markets,
  months,
}: {
  title: string;
  eyebrow: string;
  summary: PerformanceSummary;
  markets?: MarketSummary[];
  months?: MonthSummary[];
}) {
  const hasSettledPicks = summary.settledPicks > 0;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2>{title}</h2>
        </div>

        <div className={styles.recordBadge}>
          {summary.settledPicks} SETTLED · {summary.pendingPicks} PENDING
        </div>
      </div>

      <div className={styles.metricGrid}>
        <MetricCard
          icon="▥"
          label="ROI"
          value={signed(summary.roiPct, "%")}
          sub="Settled priced picks"
          tone="purple"
        />

        <MetricCard
          icon="●"
          label="UNITS PROFIT"
          value={signed(summary.unitsProfit)}
          sub="1 unit per pick"
          tone="gold"
        />

        <MetricCard
          icon="◎"
          label="TOTAL PICKS"
          value={String(summary.totalPicks)}
          sub={`${summary.pendingPicks} pending`}
          tone="blue"
        />

        <MetricCard
          icon="▲"
          label="SETTLED PICKS"
          value={String(summary.settledPicks)}
          sub={`${summary.won}W · ${summary.lost}L${
            summary.void > 0 ? ` · ${summary.void}V` : ""
          }`}
          tone="green"
        />

        <MetricCard
          icon="◆"
          label="AVG ODDS"
          value={
            summary.averageOdds === null
              ? "—"
              : summary.averageOdds.toFixed(2)
          }
          sub="Published odds"
          tone="orange"
        />

        <MetricCard
          icon="■"
          label="CURRENT STREAK"
          value={streakLabel(summary.currentStreak)}
          sub="Resolved picks only"
          tone="neutral"
        />
      </div>

      {hasSettledPicks ? null : (
        <div className={styles.emptyState}>
          <span>▦</span>
          <div>
            <strong>NO SETTLED PICKS YET</strong>
            <p>
              Performance will appear automatically after genuine published
              picks settle.
            </p>
          </div>
        </div>
      )}

      {markets ? (
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>★</span>
            <h3>PERFORMANCE BY MARKET</h3>
          </div>

          <div className={styles.marketTable}>
            <div className={styles.tableHeader}>
              <span>MARKET</span>
              <span>PICKS</span>
              <span>SETTLED</span>
              <span>UNITS</span>
              <span>ROI</span>
            </div>

            {markets.map((row) => (
              <div className={styles.tableRow} key={row.market}>
                <strong>
                  {MARKET_LABELS[row.market] ?? row.market.toUpperCase()}
                </strong>
                <span>{row.totalPicks}</span>
                <span>{row.settledPicks}</span>
                <span>{signed(row.unitsProfit)}</span>
                <span>{signed(row.roiPct, "%")}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {months ? (
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>◆</span>
            <h3>MONTHLY PERFORMANCE</h3>
          </div>

          {months.length === 0 ? (
            <div className={styles.panelEmpty}>
              MONTHLY HISTORY WILL APPEAR AFTER THE FIRST SETTLED PICKS.
            </div>
          ) : (
            <div className={styles.marketTable}>
              <div className={styles.tableHeader}>
                <span>MONTH</span>
                <span>PICKS</span>
                <span>SETTLED</span>
                <span>UNITS</span>
                <span>ROI</span>
              </div>

              {[...months].reverse().map((row) => (
                <div className={styles.tableRow} key={row.month}>
                  <strong>{row.month}</strong>
                  <span>{row.totalPicks}</span>
                  <span>{row.settledPicks}</span>
                  <span>{signed(row.unitsProfit)}</span>
                  <span>{signed(row.roiPct, "%")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default function StatisticsDashboard({ free, paid }: Props) {
  const [view, setView] = useState<"free" | "paid">("free");

  return (
    <div className={styles.page}>
      <RetroHero
        eyebrow="LIVE DATABASE"
        title={
          <>
            PLAYER <span className={styles.green}>STATISTICS</span>
          </>
        }
        subtitle="REAL RESULTS. REAL PUBLISHED ODDS. NO SIMULATED PERFORMANCE."
        badge="1 UNIT PER OFFICIAL PICK"
        variant="blue"
      />

      <div className={styles.statsActions}>
        <nav className={styles.tabs} aria-label="Statistics views">
          {[
            ["free", "FREE PICKS"],
            ["paid", "PAID PICKS"],
          ].map(([key, label]) => (
            <button
              type="button"
              className={view === key ? styles.tabActive : styles.tab}
              onClick={() => setView(key as "free" | "paid")}
              key={key}
            >
              {label}
            </button>
          ))}
        </nav>

        <Link
          className={styles.leagueStatsLink}
          href="/stats/over-2-5-leagues"
        >
          <span aria-hidden="true">▲</span>
          LEAGUE STATS
          <small>O2.5 · U2.5 · BTTS</small>
        </Link>
      </div>

      {view === "free" ? (
        <PerformanceSection
          eyebrow="FREE RECORD"
          title="FREE PICKS"
          summary={free.overall}
          markets={free.byMarket}
          months={free.byMonth}
        />
      ) : null}

      {view === "paid" ? (
        <PerformanceSection
          eyebrow="MEMBER RECORD"
          title="PAID PICKS"
          summary={paid.overall}
          markets={paid.byMarket}
          months={paid.byMonth}
        />
      ) : null}

      <div className={styles.disclaimer}>
        Statistics use settled picks stored in the live database. ROI uses a
        fixed 1-unit stake per priced settled pick. Units use published odds.
        Data timezone: Europe/Sofia.
      </div>
    </div>
  );
}
