import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import {
  getClerkPrimaryEmail,
  syncCustomerAccount,
} from "@/lib/auth/customer";
import { getPaidEntitlement } from "@/lib/auth/entitlement";

import RetroHero from "@/components/retro/RetroHero";

import styles from "./account.module.css";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { userId } = await auth.protect();
  const user = await currentUser();

  if (!user) return null;

  const email = getClerkPrimaryEmail(user);

  await syncCustomerAccount({
    clerkUserId: userId,
    email,
  });

  const entitlement = await getPaidEntitlement(userId);

  const membershipLabel = entitlement.isAdmin
    ? "ADMIN"
    : entitlement.hasSubscriptionAccess
      ? "PREMIUM"
      : entitlement.hasDailyAccess
        ? "DAY PASS"
        : "FREE";

  return (
    <div className={styles.page}>
      <RetroHero
        eyebrow="PLAYER PROFILE"
        title={
          <>
            MEMBER <span className={styles.green}>ACCOUNT</span>
          </>
        }
        subtitle="MANAGE YOUR ACCESS, BILLING AND PLAYER PROFILE."
        badge={membershipLabel}
        variant="purple"
      />

      <div className={styles.accountGrid}>
        <section className={styles.playerCard}>
          <div className={styles.avatar}>
            <UserButton />
          </div>

          <span>PLAYER</span>

          <h1>
            {user.firstName ? user.firstName.toUpperCase() : "MEMBER"}
          </h1>

          <p>{email ?? "NO EMAIL AVAILABLE"}</p>

          <div className={styles.membership}>
            <span>MEMBERSHIP</span>
            <strong>{membershipLabel}</strong>
          </div>
        </section>

        <section className={styles.detailsCard}>
          <div className={styles.sectionTitle}>
            <span>★</span>
            <h2>ACCESS STATUS</h2>
          </div>

          <div className={styles.detailGrid}>
            <div>
              <span>PAID PICKS</span>
              <strong>
                {entitlement.hasPaidAccess ? "UNLOCKED" : "LOCKED"}
              </strong>
            </div>

            <div>
              <span>ROLE</span>
              <strong>{entitlement.isAdmin ? "SUPER USER" : "MEMBER"}</strong>
            </div>

            {entitlement.hasDailyAccess && !entitlement.isAdmin ? (
              <div>
                <span>DAY PASS DATE</span>
                <strong>{entitlement.accessDate}</strong>
              </div>
            ) : null}

            {entitlement.activeSubscription && !entitlement.isAdmin ? (
              <>
                <div>
                  <span>SUBSCRIPTION</span>
                  <strong>
                    {String(
                      entitlement.activeSubscription.status,
                    ).toUpperCase()}
                  </strong>
                </div>

                <div>
                  <span>CANCEL AT PERIOD END</span>
                  <strong>
                    {entitlement.activeSubscription.cancel_at_period_end
                      ? "YES"
                      : "NO"}
                  </strong>
                </div>
              </>
            ) : null}
          </div>

          <div className={styles.actions}>
            {entitlement.hasPaidAccess ? (
              <Link href="/paid-picks">OPEN PAID PICKS</Link>
            ) : (
              <Link href="/subscription">VIEW PLANS</Link>
            )}

            {!entitlement.isAdmin && entitlement.stripeCustomerId ? (
              <form action="/api/billing/portal" method="post">
                <button type="submit">MANAGE BILLING</button>
              </form>
            ) : null}
          </div>
        </section>

        <section className={styles.systemCard}>
          <span>PLAYER SETTINGS</span>

          <div className={styles.systemRows}>
            <div>
              <p>TIMEZONE</p>
              <strong>EUROPE / SOFIA</strong>
            </div>

            <div>
              <p>ODDS FORMAT</p>
              <strong>DECIMAL</strong>
            </div>

            <div>
              <p>AUTHENTICATION</p>
              <strong>CLERK</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
