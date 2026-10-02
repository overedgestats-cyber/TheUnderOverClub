import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { getConfiguredPlans } from "@/lib/stripe/plans";
import RetroHero from "@/components/retro/RetroHero";
import TrackedCheckoutForm from "@/components/analytics/TrackedCheckoutForm";

import styles from "./subscription.module.css";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const { isAuthenticated } = await auth();

  let plans: Awaited<ReturnType<typeof getConfiguredPlans>> = [];
  let configError = false;

  try {
    plans = await getConfiguredPlans();
  } catch (error) {
    configError = true;

    console.error(
      "Subscription plan configuration error:",
      error instanceof Error ? error.message : error,
    );
  }

  return (
    <div className={styles.page}>
      <RetroHero
        eyebrow="MEMBERSHIP"
        title={
          <>
            UNLOCK <span className={styles.gold}>PREMIUM</span>
          </>
        }
        subtitle="UPGRADE YOUR GAME. EVERY PLAN UNLOCKS THE SAME OFFICIAL PAID PICKS."
        badge="SECURE CHECKOUT"
        variant="gold"
      />

      {configError ? (
        <div className={styles.notice}>
          SUBSCRIPTION PLANS ARE TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN
          SHORTLY.
        </div>
      ) : null}

      {!configError && plans.length === 0 ? (
        <div className={styles.notice}>
          ACCESS PLANS HAVE NOT BEEN CONFIGURED YET.
        </div>
      ) : null}

      {plans.length > 0 ? (
        <section className={styles.planGrid}>
          {plans.map((plan, index) => (
            <article
              className={`${styles.plan} ${styles[plan.key] ?? ""}`}
              key={plan.key}
            >
              {plan.badge ? (
                <div className={styles.badge}>{plan.badge}</div>
              ) : null}

              <span className={styles.planName}>{plan.name.toUpperCase()}</span>

              <h2>{plan.amount ?? "PRICE UNAVAILABLE"}</h2>

              <p>{plan.description}</p>

              <ul>
                <li>FULL PAID PICKS ACCESS</li>
                <li>ALL FOUR PAID MARKETS</li>
                <li>OFFICIAL PUBLISHED PICKS ONLY</li>
                <li>TRANSPARENT STATISTICS</li>
              </ul>

              {isAuthenticated ? (
                <TrackedCheckoutForm
                  plan={plan.key}
                  label={
                    plan.key === "daily"
                      ? "GET DAY PASS"
                      : "CHOOSE PLAN"
                  }
                />
              ) : (
                <Link
                  className={styles.button}
                  href="/sign-in?redirect_url=/subscription"
                >
                  SIGN IN TO CONTINUE
                </Link>
              )}

              <small className={styles.slot}>PLAN SLOT {index + 1}</small>
            </article>
          ))}
        </section>
      ) : null}

      <section className={styles.lowerGrid}>
        <article className={styles.features}>
          <div className={styles.sectionTitle}>
            <span>★</span>
            <h2>PREMIUM MEMBER PERKS</h2>
          </div>

          <div className={styles.featureRows}>
            <div>
              <strong>FULL PAID BOARD</strong>
              <span>FREE</span>
              <b>PREMIUM</b>
            </div>

            <div>
              <p>O/U 2.5, BTTS, 1X2 and Double Chance</p>
              <span>×</span>
              <b>✓</b>
            </div>

            <div>
              <p>Full member access for the selected period</p>
              <span>×</span>
              <b>✓</b>
            </div>

            <div>
              <p>Paid performance statistics</p>
              <span>×</span>
              <b>✓</b>
            </div>
          </div>
        </article>

        <article className={styles.checkoutPanel}>
          <div className={styles.trophy}>♛</div>

          <strong>
            SAME PICKS.
            <br />
            CHOOSE YOUR ACCESS PERIOD.
          </strong>

          <p>
            Daily, Weekly, Monthly and Yearly plans all unlock the same Paid
            Picks.
          </p>

          <div className={styles.secure}>■ PAYMENTS PROCESSED BY STRIPE</div>
        </article>
      </section>
    </div>
  );
}
