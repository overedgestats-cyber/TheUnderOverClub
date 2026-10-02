import "server-only";

import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getStripe,
} from "@/lib/stripe/client";

type ClerkUserLike = {
  primaryEmailAddressId:
    string | null;
  emailAddresses:
    Array<{
      id: string;
      emailAddress: string;
    }>;
};

function db() {
  return createAdminSupabaseClient() as any;
}

function primaryEmail(
  user: ClerkUserLike,
) {
  const primary =
    user.emailAddresses.find(
      (email) =>
        email.id ===
        user.primaryEmailAddressId,
    );

  return (
    primary?.emailAddress ??
    user.emailAddresses[0]
      ?.emailAddress ??
    null
  );
}

export async function syncCustomerAccount({
  clerkUserId,
  email,
}: {
  clerkUserId: string;
  email:
    string | null;
}) {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "customer_accounts",
    )
    .upsert(
      {
        clerk_user_id:
          clerkUserId,
        email,
      },
      {
        onConflict:
          "clerk_user_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not sync customer account: ${error.message}`,
    );
  }

  return data;
}

export async function ensureStripeCustomer({
  clerkUserId,
  user,
}: {
  clerkUserId: string;
  user:
    ClerkUserLike;
}) {
  const email =
    primaryEmail(user);

  const client = db();

  const {
    data:
      existing,
    error:
      existingError,
  } = await client
    .from(
      "customer_accounts",
    )
    .select("*")
    .eq(
      "clerk_user_id",
      clerkUserId,
    )
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Could not load customer account: ${existingError.message}`,
    );
  }

  if (
    existing
      ?.stripe_customer_id
  ) {
    if (
      existing.email !==
      email
    ) {
      await syncCustomerAccount({
        clerkUserId,
        email,
      });
    }

    return {
      stripeCustomerId:
        existing
          .stripe_customer_id as string,
      email,
    };
  }

  const stripe =
    getStripe();

  const customer =
    await stripe
      .customers
      .create({
        email:
          email ??
          undefined,
        metadata: {
          clerk_user_id:
            clerkUserId,
        },
      });

  const {
    error:
      saveError,
  } = await client
    .from(
      "customer_accounts",
    )
    .upsert(
      {
        clerk_user_id:
          clerkUserId,
        email,
        stripe_customer_id:
          customer.id,
      },
      {
        onConflict:
          "clerk_user_id",
      },
    );

  if (saveError) {
    throw new Error(
      `Could not save Stripe customer mapping: ${saveError.message}`,
    );
  }

  return {
    stripeCustomerId:
      customer.id,
    email,
  };
}

export function getClerkPrimaryEmail(
  user:
    ClerkUserLike,
) {
  return primaryEmail(user);
}
