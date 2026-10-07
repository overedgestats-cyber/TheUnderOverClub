import Link from "next/link";

import { getPublicFreePicks } from "@/lib/free-picks/public-free-picks";

import RetroHero from "@/components/retro/RetroHero";
import TrustStrip from "@/components/retro/TrustStrip";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AnyRecord = Record<string, any>;

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function pickSelection(pick: AnyRecord) {
  const raw = stringValue(pick.selection ?? pick.pick);
  const normalized = raw.toLowerCase();

  if (normalized === "over_2_5" || normalized === "over 2.5") {
    return "OVER 2.5";
  }

  if (normalized === "under_2_5" || normalized === "under 2.5") {
    return "UNDER 2.5";
  }

  return raw.toUpperCase() || "O/U 2.5";
}

function pickTeams(pick: AnyRecord) {
  return {
    home: stringValue(
      pick.home ?? pick.homeTeam ?? pick.home_name,
      "Home",
    ),
    away: stringValue(
      pick.away ?? pick.awayTeam ?? pick.away_name,
      "Away",
    ),
  };
}

function formatKickoff(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "TBC";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default async function Home() {
  const freeData = await getPublicFreePicks();

  const free = freeData as AnyRecord;
  const picks = Array.isArray(free.picks) ? free.picks : [];

  return (
    <div className={styles.dashboard}>
      <RetroHero
        eyebrow="THE UNDER OVER CLUB"
        title={
          <>
            STATS. GOALS.{" "}
            <span className={styles.heroAccent}>PROFIT.</span>
          </>
        }
        subtitle="IN THAT ORDER. LIVE FOOTBALL PICKS BUILT ON DATA, NOT GUT FEELING."
        badge="MODEL ONLINE"
      />

      <TrustStrip />

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div>
            <span>★</span>
            <h2>TODAY&apos;S TOP PICKS</h2>
          </div>

          <Link href="/today">VIEW FREE PICKS</Link>
        </div>

        <div className={styles.pickDeck}>
          {picks.slice(0, 2).map((pick: AnyRecord, index: number) => {
            const teams = pickTeams(pick);
            const confidence = numberValue(
              pick.confidencePct ??
                pick.confidence_pct ??
                numberValue(pick.confidence) * 100,
            );
            const isUnder = pickSelection(pick).includes("UNDER");

            return (
              <article
                key={
                  stringValue(pick.id) ||
                  `${teams.home}-${teams.away}-${index}`
                }
                className={`${styles.pickCard} ${
                  isUnder ? styles.pickUnder : styles.pickOver
                }`}
              >
                <div className={styles.cardHeader}>
                  <span>O/U 2.5</span>
                  <strong>FREE</strong>
                </div>

                <div className={styles.match}>
                  <small>
                    {stringValue(
                      pick.competition ?? pick.league,
                      "FOOTBALL",
                    ).toUpperCase()}
                    {" · "}
                    {formatKickoff(pick.kickoffAt ?? pick.kickoff_at)}
                  </small>

                  <div className={styles.teamRow}>
                    <span className={styles.teamBadge}>
                      {pick.homeLogo ? (
                        <img
                          className={styles.teamLogo}
                          src={stringValue(pick.homeLogo)}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                        />
                      ) : (
                        teams.home.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <strong>{teams.home}</strong>
                  </div>

                  <div className={styles.vs}>VS</div>

                  <div className={styles.teamRow}>
                    <span className={styles.teamBadge}>
                      {pick.awayLogo ? (
                        <img
                          className={styles.teamLogo}
                          src={stringValue(pick.awayLogo)}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                        />
                      ) : (
                        teams.away.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <strong>{teams.away}</strong>
                  </div>
                </div>

                <div className={styles.pickSelection}>
                  {pickSelection(pick)}
                </div>

                <div className={styles.cardMetrics}>
                  <div>
                    <span>ODDS</span>
                    <strong>
                      {pick.odds === null || pick.odds === undefined
                        ? "—"
                        : numberValue(pick.odds).toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span>CONFIDENCE</span>
                    <strong>{Math.round(confidence)}%</strong>
                  </div>
                </div>

                <div className={styles.progress}>
                  <span
                    style={{
                      width: `${Math.max(0, Math.min(100, confidence))}%`,
                    }}
                  />
                </div>

                <Link className={styles.pickButton} href="/today">
                  VIEW PICK
                </Link>
              </article>
            );
          })}

          {[1, 2].map((slot) => (
            <article key={slot} className={styles.lockedCard}>
              <div className={styles.lockIcon}>◆</div>
              <span>PREMIUM BOARD</span>
              <strong>MEMBER ONLY</strong>
              <p>
                Unlock official value picks across O/U, BTTS, 1X2 and
                Double Chance.
              </p>
              <Link href="/subscription">UNLOCK</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.widgetGrid}>
        <article className={styles.widget}>
          <span className={styles.widgetTitleGreen}>FREE PICKS TODAY</span>
          <div className={styles.hearts}>
            <span>♥</span>
            <span>♥</span>
            <strong>{picks.length} / 2</strong>
          </div>
          <p>
            Two public O/U 2.5 selections when the slate is available.
          </p>
        </article>

        <article className={styles.widget}>
          <span className={styles.widgetTitleGold}>NEXT MATCHES</span>
          <div className={styles.matchList}>
            {picks.length > 0 ? (
              picks.slice(0, 3).map((pick: AnyRecord) => {
                const teams = pickTeams(pick);

                return (
                  <div
                    key={
                      stringValue(pick.id) ||
                      `${teams.home}-${teams.away}`
                    }
                  >
                    <span>●</span>
                    <p>
                      {teams.home} vs {teams.away}
                    </p>
                    <strong>
                      {formatKickoff(pick.kickoffAt ?? pick.kickoff_at)}
                    </strong>
                  </div>
                );
              })
            ) : (
              <p className={styles.noMatches}>
                WAITING FOR THE NEXT PUBLISHED SLATE.
              </p>
            )}
          </div>
        </article>

        <article className={styles.widget}>
          <span className={styles.widgetTitlePurple}>MEMBERSHIP</span>
          <div className={styles.crown}>♛</div>
          <strong className={styles.membershipPrice}>FROM €2.49</strong>
          <p>
            Daily, Weekly, Monthly and Yearly access to the same Paid Picks.
          </p>
          <Link href="/subscription" className={styles.widgetButton}>
            SEE PLANS
          </Link>
        </article>
      </section>
    </div>
  );
}
