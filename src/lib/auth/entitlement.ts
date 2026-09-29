import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSofiaDate } from "@/lib/time/sofia";
import { isAdminUser } from "@/lib/auth/admin";

const ACCESS_STATUSES = new Set(["active", "trialing"]);

function db() {
  return createAdminSupabaseClient() as any;
}

export async function getPaidEntitlement(
  clerkUserId: string,
  accessDate = getSofiaDate(),
) {
  const isAdmin = isAdminUser(clerkUserId);
  const client = db();

  const [subscriptionsResult, dailyResult, accountResult] = await Promise.all([
    client
      .from("customer_subscriptions")
      .select(
        [
          "stripe_subscription_id",
          "stripe_customer_id",
          "stripe_price_id",
          "status",
          "cancel_at_period_end",
          "updated_at",
        ].join(","),
      )
      .eq("clerk_user_id", clerkUserId)
      .order("updated_at", { ascending: false }),

    client
      .from("customer_daily_access")
      .select(
        [
          "id",
          "access_date",
          "stripe_checkout_session_id",
          "purchased_at",
        ].join(","),
      )
      .eq("clerk_user_id", clerkUserId)
      .eq("access_date", accessDate)
      .maybeSingle(),

    client
      .from("customer_accounts")
      .select("stripe_customer_id,email")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle(),
  ]);

  if (subscriptionsResult.error) {
    throw new Error(
      `Could not check subscription entitlement: ${subscriptionsResult.error.message}`,
    );
  }

  if (dailyResult.error) {
    throw new Error(
      `Could not check Daily Pass entitlement: ${dailyResult.error.message}`,
    );
  }

  if (accountResult.error) {
    throw new Error(
      `Could not load customer account: ${accountResult.error.message}`,
    );
  }

  const subscriptions = subscriptionsResult.data ?? [];

  const activeSubscription =
    subscriptions.find((row: any) =>
      ACCESS_STATUSES.has(String(row.status)),
    ) ?? null;

  const dailyAccess = dailyResult.data ?? null;
  const hasSubscriptionAccess = Boolean(activeSubscription);
  const hasDailyAccess = Boolean(dailyAccess);

  return {
    accessDate,
    isAdmin,
    hasPaidAccess: isAdmin || hasSubscriptionAccess || hasDailyAccess,
    hasSubscriptionAccess,
    hasDailyAccess,
    accessSource: isAdmin
      ? "admin"
      : hasSubscriptionAccess
      ? "subscription"
      : hasDailyAccess
      ? "daily_pass"
      : null,
    activeSubscription,
    dailyAccess,
    latestSubscription: subscriptions[0] ?? null,
    stripeCustomerId: accountResult.data?.stripe_customer_id ?? null,
    email: accountResult.data?.email ?? null,
  };
}

export async function requirePaidPageAccess(
  accessDate = getSofiaDate(),
) {
  const { userId } = await auth.protect();

  const entitlement = await getPaidEntitlement(userId, accessDate);

  if (!entitlement.hasPaidAccess) {
    redirect("/subscription?required=paid");
  }

  return { userId, entitlement };
}

export async function requirePaidApiAccess(
  accessDate = getSofiaDate(),
) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return {
      ok: false as const,
      response: Response.json(
        { ok: false, error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  const entitlement = await getPaidEntitlement(userId, accessDate);

  if (!entitlement.hasPaidAccess) {
    return {
      ok: false as const,
      response: Response.json(
        { ok: false, error: "Paid access required for this date" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    userId,
    entitlement,
  };
}
