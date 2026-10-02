import type Stripe from "stripe";

import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getStripe,
} from "@/lib/stripe/client";

export const dynamic =
  "force-dynamic";

function db() {
  return createAdminSupabaseClient() as any;
}

async function findClerkUserId({
  stripeCustomerId,
  metadataClerkUserId,
}: {
  stripeCustomerId:
    string;
  metadataClerkUserId:
    string | null;
}) {
  if (
    metadataClerkUserId
  ) {
    return metadataClerkUserId;
  }

  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "customer_accounts",
    )
    .select(
      "clerk_user_id",
    )
    .eq(
      "stripe_customer_id",
      stripeCustomerId,
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not map Stripe customer to Clerk user: ${error.message}`,
    );
  }

  return (
    data
      ?.clerk_user_id ??
    null
  ) as string | null;
}

async function syncCustomerMapping({
  clerkUserId,
  stripeCustomerId,
}: {
  clerkUserId:
    string;
  stripeCustomerId:
    string;
}) {
  const client = db();

  const {
    error,
  } = await client
    .from(
      "customer_accounts",
    )
    .upsert(
      {
        clerk_user_id:
          clerkUserId,
        stripe_customer_id:
          stripeCustomerId,
      },
      {
        onConflict:
          "clerk_user_id",
      },
    );

  if (error) {
    throw new Error(
      `Could not sync Stripe customer mapping: ${error.message}`,
    );
  }
}

async function syncSubscription(
  subscription:
    Stripe.Subscription,
) {
  const customerId =
    typeof subscription
      .customer ===
    "string"
      ? subscription
          .customer
      : subscription
          .customer.id;

  const clerkUserId =
    await findClerkUserId({
      stripeCustomerId:
        customerId,
      metadataClerkUserId:
        subscription
          .metadata
          ?.clerk_user_id ??
        null,
    });

  if (!clerkUserId) {
    throw new Error(
      `No Clerk user mapping found for Stripe subscription ${subscription.id}`,
    );
  }

  await syncCustomerMapping({
    clerkUserId,
    stripeCustomerId:
      customerId,
  });

  const priceId =
    subscription
      .items
      .data[0]
      ?.price
      ?.id ??
    null;

  const client = db();

  const {
    error,
  } = await client
    .from(
      "customer_subscriptions",
    )
    .upsert(
      {
        clerk_user_id:
          clerkUserId,
        stripe_subscription_id:
          subscription.id,
        stripe_customer_id:
          customerId,
        stripe_price_id:
          priceId,
        status:
          subscription.status,
        cancel_at_period_end:
          subscription
            .cancel_at_period_end,
      },
      {
        onConflict:
          "stripe_subscription_id",
      },
    );

  if (error) {
    throw new Error(
      `Could not sync Stripe subscription: ${error.message}`,
    );
  }
}

function checkoutCustomerId(
  session:
    Stripe.Checkout.Session,
) {
  if (
    typeof session
      .customer ===
    "string"
  ) {
    return session
      .customer;
  }

  return (
    session.customer
      ?.id ??
    null
  );
}

function paymentIntentId(
  session:
    Stripe.Checkout.Session,
) {
  if (
    typeof session
      .payment_intent ===
    "string"
  ) {
    return session
      .payment_intent;
  }

  return (
    session.payment_intent
      ?.id ??
    null
  );
}

async function grantDailyPass(
  session:
    Stripe.Checkout.Session,
) {
  const plan =
    session.metadata
      ?.plan ??
    null;

  if (
    plan !== "daily"
  ) {
    return;
  }

  if (
    session.payment_status !==
    "paid"
  ) {
    return;
  }

  const clerkUserId =
    session.metadata
      ?.clerk_user_id ??
    session
      .client_reference_id ??
    null;

  const accessDate =
    session.metadata
      ?.access_date ??
    null;

  const customerId =
    checkoutCustomerId(
      session,
    );

  if (
    !clerkUserId ||
    !accessDate ||
    !customerId
  ) {
    throw new Error(
      `Daily Pass Checkout Session ${session.id} is missing entitlement metadata`,
    );
  }

  await syncCustomerMapping({
    clerkUserId,
    stripeCustomerId:
      customerId,
  });

  const client = db();

  const {
    error,
  } = await client
    .from(
      "customer_daily_access",
    )
    .upsert(
      {
        clerk_user_id:
          clerkUserId,
        access_date:
          accessDate,
        stripe_customer_id:
          customerId,
        stripe_checkout_session_id:
          session.id,
        stripe_payment_intent_id:
          paymentIntentId(
            session,
          ),
        amount_total:
          session
            .amount_total ??
          null,
        currency:
          session.currency
            ?.toLowerCase() ??
          null,
        purchased_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          "clerk_user_id,access_date",
      },
    );

  if (error) {
    throw new Error(
      `Could not grant Daily Pass: ${error.message}`,
    );
  }
}

async function handleCheckoutSession(
  session:
    Stripe.Checkout.Session,
) {
  const clerkUserId =
    session.metadata
      ?.clerk_user_id ??
    session
      .client_reference_id ??
    null;

  const customerId =
    checkoutCustomerId(
      session,
    );

  if (
    clerkUserId &&
    customerId
  ) {
    await syncCustomerMapping({
      clerkUserId,
      stripeCustomerId:
        customerId,
    });
  }

  await grantDailyPass(
    session,
  );
}

export async function POST(
  request:
    Request,
) {
  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      {
        ok: false,
        error:
          "Missing STRIPE_WEBHOOK_SECRET",
      },
      {
        status: 500,
      },
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature",
    );

  if (!signature) {
    return Response.json(
      {
        ok: false,
        error:
          "Missing Stripe-Signature",
      },
      {
        status: 400,
      },
    );
  }

  const rawBody =
    await request.text();

  const stripe =
    getStripe();

  let event:
    Stripe.Event;

  try {
    event =
      stripe
        .webhooks
        .constructEvent(
          rawBody,
          signature,
          webhookSecret,
        );
  } catch (
    error
  ) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid Stripe signature",
      },
      {
        status: 400,
      },
    );
  }

  try {
    if (
      event.type ===
        "customer.subscription.created" ||
      event.type ===
        "customer.subscription.updated" ||
      event.type ===
        "customer.subscription.deleted"
    ) {
      await syncSubscription(
        event.data
          .object as Stripe.Subscription,
      );
    }

    if (
      event.type ===
        "checkout.session.completed" ||
      event.type ===
        "checkout.session.async_payment_succeeded"
    ) {
      await handleCheckoutSession(
        event.data
          .object as Stripe.Checkout.Session,
      );
    }

    return Response.json({
      received: true,
    });
  } catch (
    error
  ) {
    console.error(
      "Stripe webhook processing failed:",
      error,
    );

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook processing failed",
      },
      {
        status: 500,
      },
    );
  }
}
