import Link from "next/link";

import RetroHero from "@/components/retro/RetroHero";

import styles from "./TodayFreePicks.module.css";

type Pick = {
  id: string;
  date: string;
  rank: number;
  fixtureId: number | null;
  competition: string;
  country: string | null;
  kickoffAt: string | null;
  home: string;
  away: string;
  selection: string;
  modelProbabilityPct: number;
  confidencePct: number;
  confidenceBand: "75_plus" | "fallback";
  odds: number | null;
  bookmakerName: string | null;
  oddsSource: "bet365" | "market_median_fallback" | null;
  resultStatus: "pending" | "won" | "lost" | "void";
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  settledAt: string | null;
  publishedAt: string;
};

type Data = {
  requestedDate: string | null;
  today: string;
  displayDate: string;
  dateMode: "today" | "future" | "past" | "none";
  picks: Pick[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00+03:00`));
}

function formatKickoff(value: string | null) {
  if (!value) return "TBC";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function statusLabel(status: Pick["resultStatus"]) {
  if (status === "won") return "WIN";
  if (status === "lost") return "LOSS";
  if (status === "void") return "VOID";
  return "PENDING";
}

function statusClass(status: Pick["resultStatus"]) {
  if (status === "won") return styles.statusWon;
  if (status === "lost") return styles.statusLost;
  if (status === "void") return styles.statusVoid;
  return styles.statusPending;
}

export default function TodayFreePicks({ data }: { data: Data }) {
  const isFuture = data.dateMode === "future";
  const pageTitle = isFuture ? "NEXT FREE PICKS" : "TODAY'S FREE PICKS";

  return (
    <div className={styles.page}>
      <RetroHero
        eyebrow="FREE PICKS"
        title={
          <>
            <span className={styles.green}>
              {isFuture ? "NEXT" : "TODAY'S"}
            </span>{" "}
            FREE <span className={styles.red}>PICKS</span>
          </>
        }
        subtitle="2 FREE O/U 2.5 PICKS. PUBLISHED FROM THE LIVE MODEL."
        badge={formatDate(data.displayDate)}
      />

      <div className={styles.contentGrid}>
        <section className={styles.mainPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>★</span>
              <h2>{pageTitle}</h2>
            </div>
            <strong>{data.picks.length} / 2</strong>
          </div>

          {data.picks.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyBall}>●</div>
              <div>
                <h3>NO FREE PICKS PUBLISHED YET</h3>
                <p>
                  The next genuine published slate will appear here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.pickGrid}>
              {data.picks.map((pick) => {
                const score =
                  pick.finalHomeScore !== null && pick.finalAwayScore !== null
                    ? `${pick.finalHomeScore} - ${pick.finalAwayScore}`
                    : null;

                const under = pick.selection.toLowerCase().includes("under");

                return (
                  <article
                    className={`${styles.pickCard} ${
                      under ? styles.under : styles.over
                    }`}
                    key={pick.id}
                  >
                    <div className={styles.pickTop}>
                      <span>{pick.competition.toUpperCase()}</span>

                      <span
                        className={`${styles.status} ${statusClass(
                          pick.resultStatus,
                        )}`}
                      >
                        {statusLabel(pick.resultStatus)}
                      </span>
                    </div>

                    <div className={styles.kickoff}>
                      PICK #{pick.rank} · {formatKickoff(pick.kickoffAt)} SOFIA
                    </div>

                    <div className={styles.teams}>
                      <div>
                        <span className={styles.teamBadge}>
                          {pick.home.slice(0, 2).toUpperCase()}
                        </span>
                        <strong>{pick.home}</strong>
                      </div>

                      <span className={styles.vs}>VS</span>

                      <div>
                        <span className={styles.teamBadge}>
                          {pick.away.slice(0, 2).toUpperCase()}
                        </span>
                        <strong>{pick.away}</strong>
                      </div>
                    </div>

                    {score ? (
                      <div className={styles.finalScore}>FT {score}</div>
                    ) : null}

                    <div className={styles.selection}>
                      <span>PICK:</span>
                      <strong>{pick.selection.toUpperCase()}</strong>
                    </div>

                    <div className={styles.metrics}>
                      <div>
                        <span>MODEL</span>
                        <strong>{pick.modelProbabilityPct}%</strong>
                      </div>

                      <div>
                        <span>CONFIDENCE</span>
                        <strong>{pick.confidencePct}%</strong>
                      </div>

                      <div>
                        <span>ODDS</span>
                        <strong>
                          {pick.odds !== null ? pick.odds.toFixed(2) : "—"}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.confidenceBar}>
                      <span
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, pick.confidencePct),
                          )}%`,
                        }}
                      />
                    </div>

                    <div className={styles.cardFooter}>
                      <span>
                        {pick.odds !== null
                          ? pick.bookmakerName ?? "PUBLISHED PRICE"
                          : "ODDS PENDING"}
                      </span>

                      <strong>
                        {pick.confidenceBand === "75_plus"
                          ? "HIGH CONFIDENCE"
                          : "DAILY FALLBACK"}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className={styles.premiumGate}>
            <div className={styles.premiumGateHeader}>
              <div>
                <span>◆</span>
                <strong>UNLOCK THE FULL PAID BOARD</strong>
              </div>

              <Link href="/subscription">GO PREMIUM</Link>
            </div>

            <div className={styles.lockedSlots}>
              {["O/U 2.5", "BTTS", "DOUBLE CHANCE", "1X2"].map((market) => (
                <div key={market}>
                  <span>▣</span>
                  <strong>{market}</strong>
                  <small>MEMBER ONLY</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className={styles.sideRail}>
          <article className={styles.sideCard}>
            <span>FREE PICKS TODAY</span>

            <div className={styles.hearts}>
              <b>♥</b>
              <b>♥</b>
              <strong>{data.picks.length} / 2</strong>
            </div>

            <p>
              {data.picks.length === 2
                ? "TODAY'S FREE SLATE IS PUBLISHED."
                : "WAITING FOR THE NEXT COMPLETE SLATE."}
            </p>
          </article>

          <article className={styles.sideCard}>
            <span className={styles.purpleTitle}>SLATE DATE</span>
            <div className={styles.clock}>◷</div>
            <strong className={styles.dateValue}>
              {formatDate(data.displayDate)}
            </strong>
            <p>EUROPE / SOFIA</p>
          </article>

          <article className={styles.sideCard}>
            <span className={styles.goldTitle}>MODEL RULES</span>

            <div className={styles.ruleList}>
              <div>
                <span>●</span>
                <p>MARKET</p>
                <strong>O/U 2.5</strong>
              </div>
              <div>
                <span>●</span>
                <p>DAILY TARGET</p>
                <strong>2 PICKS</strong>
              </div>
              <div>
                <span>●</span>
                <p>RECORD</p>
                <strong>IMMUTABLE</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <div className={styles.infoStrip}>
        <span>Picks are published before kickoff and remain immutable.</span>
        <Link href="/statistics">VIEW PERFORMANCE ▶</Link>
      </div>
    </div>
  );
}
