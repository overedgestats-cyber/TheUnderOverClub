"use client";

import { useState } from "react";
import RetroHero from "@/components/retro/RetroHero";
import styles from "./StatisticsDashboard.module.css";

type Streak = {
  result: "won" | "lost" | null;
  count: number;
};

type Summary = {
  totalPicks: number;
  settledPicks: number;
  resolvedPicks: number;
  pendingPicks: number;
  won: number;
  lost: number;
  void: number;
  winRatePct: number;
  unitsProfit: number;
  roiPct: number;
  averageOdds: number | null;
  currentStreak: Streak;
};

type MarketSummary = Summary & {
  market: string;
};

type MonthSummary = Summary & {
  month: string;
};

type TierStatistics = {
  generatedAt: string;
  timezone: string;
  accessTier: "free" | "paid";
  stakingModel: string;
  definitions: {
    winRate: string;
    roi: string;
    unitsProfit: string;
  };
  overall: Summary;
  byMarket: MarketSummary[];
  byMonth: MonthSummary[];
};

type OverviewStatistics = {
  generatedAt: string;
  timezone: string;
  combined: Summary;
  free: Summary;
  paid: Summary;
  byMonth: MonthSummary[];
};

type Props = {
  free: TierStatistics;
  paid: TierStatistics;
  overview: OverviewStatistics;
};

type View = "all" | "free" | "paid";

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

function odds(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
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
  tone: "green" | "gold" | "blue" | "purple" | "orange" | "neutral";
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

function PerformanceBlock({
  title,
  eyebrow,
  summary,
  markets,
  months,
}: {
  title: string;
  eyebrow: string;
  summary: Summary;
  markets?: MarketSummary[];
  months?: MonthSummary[];
}) {
  const hasSettled = summary.settledPicks > 0;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2>{title}</h2>
        </div>

        <div className={styles.recordBadge}>
          {summary.won}W · {summary.lost}L
          {summary.void > 0 ? ` · ${summary.void}V` : ""}
        </div>
      </div>

      <div className={styles.metricGrid}>
        <MetricCard
          icon="▲"
          label="WIN RATE"
          value={`${summary.winRatePct.toFixed(1)}%`}
          sub={
            hasSettled
              ? `${summary.won} wins / ${summary.resolvedPicks} resolved`
              : "No settled picks yet"
          }
          tone="green"
        />

        <MetricCard
          icon="●"
          label="UNITS"
          value={signed(summary.unitsProfit)}
          sub="1 unit per pick"
          tone="gold"
        />

        <MetricCard
          icon="▥"
          label="ROI"
          value={signed(summary.roiPct, "%")}
          sub="Settled priced picks"
          tone="purple"
        />

        <MetricCard
          icon="◎"
          label="TOTAL PICKS"
          value={String(summary.totalPicks)}
          sub={`${summary.pendingPicks} pending`}
          tone="blue"
        />

        <MetricCard
          icon="◆"
          label="AVG ODDS"
          value={odds(summary.averageOdds)}
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

      {!hasSettled ? (
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
      ) : null}

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
              <span>WIN %</span>
              <span>UNITS</span>
              <span>ROI</span>
            </div>

            {markets.map((market) => (
              <div className={styles.tableRow} key={market.market}>
                <strong>
                  {MARKET_LABELS[market.market] ??
                    market.market.toUpperCase()}
                </strong>
                <span>{market.totalPicks}</span>
                <span>{market.winRatePct.toFixed(1)}%</span>
                <span>{signed(market.unitsProfit)}</span>
                <span>{signed(market.roiPct, "%")}</span>
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
                <span>WIN %</span>
                <span>UNITS</span>
                <span>ROI</span>
              </div>

              {[...months].reverse().map((month) => (
                <div className={styles.tableRow} key={month.month}>
                  <strong>{month.month}</strong>
                  <span>{month.totalPicks}</span>
                  <span>{month.winRatePct.toFixed(1)}%</span>
                  <span>{signed(month.unitsProfit)}</span>
                  <span>{signed(month.roiPct, "%")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default function StatisticsDashboard({
  free,
  paid,
  overview,
}: Props) {
  const [view, setView] = useState<View>("all");

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

      <nav className={styles.tabs} aria-label="Statistics views">
        {(
          [
            ["all", "ALL PICKS"],
            ["free", "FREE PICKS"],
            ["paid", "PAID PICKS"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={view === key ? styles.tabActive : styles.tab}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {view === "all" ? (
        <>
          <PerformanceBlock
            eyebrow="COMBINED RECORD"
            title="ALL PICKS"
            summary={overview.combined}
            months={overview.byMonth}
          />

          <div className={styles.splitGrid}>
            <div className={styles.miniRecord}>
              <span>FREE PICKS</span>
              <strong>{overview.free.winRatePct.toFixed(1)}%</strong>
              <p>
                {overview.free.totalPicks} picks ·{" "}
                {signed(overview.free.unitsProfit)} units
              </p>
            </div>

            <div className={styles.miniRecord}>
              <span>PAID PICKS</span>
              <strong>{overview.paid.winRatePct.toFixed(1)}%</strong>
              <p>
                {overview.paid.totalPicks} picks ·{" "}
                {signed(overview.paid.unitsProfit)} units
              </p>
            </div>
          </div>
        </>
      ) : null}

      {view === "free" ? (
        <PerformanceBlock
          eyebrow="FREE RECORD"
          title="FREE PICKS"
          summary={free.overall}
          markets={free.byMarket}
          months={free.byMonth}
        />
      ) : null}

      {view === "paid" ? (
        <PerformanceBlock
          eyebrow="MEMBER RECORD"
          title="PAID PICKS"
          summary={paid.overall}
          markets={paid.byMarket}
          months={paid.byMonth}
        />
      ) : null}

      <div className={styles.disclaimer}>
        Statistics use settled picks stored in the live database. Voids are
        excluded from win rate. ROI uses a fixed 1-unit stake per priced
        settled pick. Data timezone: Europe/Sofia.
      </div>
    </div>
  );
}
