import Image from "next/image";
import Link from "next/link";
import {
  auth,
} from "@clerk/nextjs/server";
import {
  UserButton,
} from "@clerk/nextjs";

import {
  getPaidEntitlement,
} from "@/lib/auth/entitlement";
import {
  getCombinedStatistics,
} from "@/lib/statistics/recommendation-statistics";

import RetroLogoutButton from "./RetroLogoutButton";
import RetroNavigation from "./RetroNavigation";
import styles from "./RetroShell.module.css";

type Props = {
  children: React.ReactNode;
};

type AnyRecord =
  Record<string, any>;

function numberValue(
  value: unknown,
  fallback = 0,
) {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function signedUnits(
  value: unknown,
) {
  const number =
    numberValue(value);

  return (number > 0 ? "+" : "") + number.toFixed(2);
}

function percent(
  value: unknown,
) {
  return numberValue(value).toFixed(1) + "%";
}

async function safeStatistics() {
  try {
    return await getCombinedStatistics();
  } catch (error) {
    console.error(
      "[RetroShell] Could not load HUD statistics:",
      error,
    );

    return null;
  }
}

export default async function RetroShell({
  children,
}: Props) {
  const [
    authState,
    statistics,
  ] = await Promise.all([
    auth(),
    safeStatistics(),
  ]);

  const signedIn =
    Boolean(authState.userId);

  let membership =
    signedIn
      ? "FREE MEMBER"
      : "GUEST";

  let hasPaidAccess =
    false;

  if (authState.userId) {
    try {
      const entitlement =
        await getPaidEntitlement(
          authState.userId,
        );

      hasPaidAccess =
        entitlement.hasPaidAccess;

      membership =
        entitlement.isAdmin
          ? "ADMIN"
          : entitlement.hasSubscriptionAccess
            ? "PREMIUM MEMBER"
            : entitlement.hasDailyAccess
              ? "DAY PASS"
              : "FREE MEMBER";
    } catch (error) {
      console.error(
        "[RetroShell] Could not read membership:",
        error,
      );
    }
  }

  const stats =
    (
      statistics as
        AnyRecord | null
    ) ?? {};

  const combined =
    (
      stats.combined ??
      stats.overall ??
      stats
    ) as AnyRecord;

  const settled =
    numberValue(
      combined.settledPicks ??
        combined.resolvedPicks,
    );

  return (
    <div className={styles.app}>
      <div
        className={styles.pixelBackdrop}
      />

      <aside
        className={styles.sidebar}
      >
        <Link
          href="/"
          className={styles.logoLink}
          aria-label="The Under Over Club home"
        >
          <Image
            className={styles.logo}
            src="/brand/under-over-club-logo.png"
            width={220}
            height={220}
            alt="The Under Over Club"
            priority
          />
        </Link>

        <RetroNavigation
          signedIn={signedIn}
        />

        <div
          className={
            hasPaidAccess
              ? styles.memberPanel
              : styles.upgradePanel
          }
        >
          <div
            className={styles.upgradeIcon}
            aria-hidden="true"
          >
            {hasPaidAccess
              ? "★"
              : "◆"}
          </div>

          <strong>
            {hasPaidAccess
              ? "MEMBER ACCESS"
              : "GO PREMIUM"}
          </strong>

          <p>
            {hasPaidAccess
              ? "Paid Picks are unlocked for this account."
              : "Unlock the complete official picks board."}
          </p>

          <Link
            href={
              hasPaidAccess
                ? "/paid-picks"
                : "/subscription"
            }
          >
            {hasPaidAccess
              ? "OPEN PAID PICKS"
              : "UPGRADE NOW"}
          </Link>
        </div>
      </aside>

      <div className={styles.main}>
        <header
          className={styles.hud}
        >
          <div
            className={styles.hudStat}
          >
            <span
              className={styles.hudIconGreen}
              aria-hidden="true"
            >
              ▲
            </span>

            <div>
              <small>WIN RATE</small>
              <strong>
                {percent(
                  combined.winRatePct,
                )}
              </strong>
              <em>
                {settled > 0
                  ? settled + " settled"
                  : "NO SETTLED PICKS"}
              </em>
            </div>
          </div>

          <div
            className={styles.hudStat}
          >
            <span
              className={styles.hudIconGold}
              aria-hidden="true"
            >
              ●
            </span>

            <div>
              <small>
                UNITS PROFIT
              </small>
              <strong>
                {signedUnits(
                  combined.unitsProfit,
                )}
              </strong>
              <em>
                1 UNIT / PICK
              </em>
            </div>
          </div>

          <div
            className={styles.hudStat}
          >
            <span
              className={styles.hudIconBlue}
              aria-hidden="true"
            >
              ◎
            </span>

            <div>
              <small>
                TOTAL PICKS
              </small>
              <strong>
                {numberValue(
                  combined.totalPicks,
                )}
              </strong>
              <em>
                LIVE DATABASE
              </em>
            </div>
          </div>

          <div
            className={styles.hudStat}
          >
            <span
              className={styles.hudIconPurple}
              aria-hidden="true"
            >
              ▥
            </span>

            <div>
              <small>ROI</small>
              <strong>
                {percent(
                  combined.roiPct,
                )}
              </strong>
              <em>
                SETTLED PICKS
              </em>
            </div>
          </div>

          <div
            className={styles.hudMember}
          >
            <div
              className={styles.memberCoin}
              aria-hidden="true"
            >
              $
            </div>

            <div>
              <small>STATUS</small>
              <strong>
                {membership}
              </strong>
            </div>

            {signedIn ? (
              <div
                className={styles.userControls}
              >
                <div
                  className={styles.userButton}
                >
                  <UserButton />
                </div>

                <RetroLogoutButton />
              </div>
            ) : (
              <Link
                className={styles.signInLink}
                href="/sign-in"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </header>

        <div
          className={styles.content}
        >
          {children}
        </div>

        <footer
          className={styles.footer}
        >
          <div>
            <span
              className={styles.footerShield}
              aria-hidden="true"
            >
              ◇
            </span>
            <p>
              <strong>
                PLAY SMART.
              </strong>
              <br />
              BET RESPONSIBLY.
            </p>
          </div>

          <div>
            <p>
              © 2026 THE UNDER OVER CLUB
              <br />
              STATS. GOALS. PROFIT.
            </p>
          </div>

          <div>
            <span
              className={styles.footerGamepad}
              aria-hidden="true"
            >
              +●
            </span>
            <p>
              BUILT ON LIVE DATA.
              <br />
              MADE FOR PLAYERS.
            </p>
          </div>

          <nav>
            <Link href="/about">
              ABOUT
            </Link>
            <Link href="/terms">
              TERMS
            </Link>
            <Link href="/privacy">
              PRIVACY
            </Link>
            <Link href="/responsible-play">
              RESPONSIBLE PLAY
            </Link>
            <Link href="/contact">
              CONTACT
            </Link>
          </nav>
        </footer>
      </div>

      <RetroNavigation
        signedIn={signedIn}
        mobile
      />
    </div>
  );
}
