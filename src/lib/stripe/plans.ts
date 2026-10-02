import "server-only";

import {
  getStripe,
} from "@/lib/stripe/client";

export type BillingPlanKey =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

type PlanDefinition = {
  key: BillingPlanKey;
  envName: string;
  publicName: string;
  expectedUnitAmount: number;
  expectedCurrency: "eur";
  checkoutMode:
    | "payment"
    | "subscription";
  recurring:
    | null
    | {
        interval:
          | "week"
          | "month"
          | "year";
        intervalCount:
          number;
      };
  badge:
    | null
    | "MOST POPULAR"
    | "BEST VALUE";
  description: string;
};

export const PLAN_DEFINITIONS:
  Record<
    BillingPlanKey,
    PlanDefinition
  > = {
    daily: {
      key:
        "daily",
      envName:
        "STRIPE_PRICE_DAILY",
      publicName:
        "Daily Pass",
      expectedUnitAmount:
        249,
      expectedCurrency:
        "eur",
      checkoutMode:
        "payment",
      recurring:
        null,
      badge:
        null,
      description:
        "Full Paid Picks access for the purchase date.",
    },

    weekly: {
      key:
        "weekly",
      envName:
        "STRIPE_PRICE_WEEKLY",
      publicName:
        "Weekly",
      expectedUnitAmount:
        699,
      expectedCurrency:
        "eur",
      checkoutMode:
        "subscription",
      recurring: {
        interval:
          "week",
        intervalCount:
          1,
      },
      badge:
        null,
      description:
        "Full Paid Picks access. Renews weekly until cancelled.",
    },

    monthly: {
      key:
        "monthly",
      envName:
        "STRIPE_PRICE_MONTHLY",
      publicName:
        "Monthly",
      expectedUnitAmount:
        1799,
      expectedCurrency:
        "eur",
      checkoutMode:
        "subscription",
      recurring: {
        interval:
          "month",
        intervalCount:
          1,
      },
      badge:
        "MOST POPULAR",
      description:
        "Full Paid Picks access. Renews monthly until cancelled.",
    },

    yearly: {
      key:
        "yearly",
      envName:
        "STRIPE_PRICE_YEARLY",
      publicName:
        "Yearly",
      expectedUnitAmount:
        11999,
      expectedCurrency:
        "eur",
      checkoutMode:
        "subscription",
      recurring: {
        interval:
          "year",
        intervalCount:
          1,
      },
      badge:
        "BEST VALUE",
      description:
        "Full Paid Picks access. Renews yearly until cancelled.",
    },
  };

export function isBillingPlanKey(
  value: unknown,
): value is BillingPlanKey {
  return (
    value === "daily" ||
    value === "weekly" ||
    value === "monthly" ||
    value === "yearly"
  );
}

export function configuredPriceId(
  plan:
    BillingPlanKey,
) {
  const definition =
    PLAN_DEFINITIONS[
      plan
    ];

  const value =
    process.env[
      definition
        .envName
    ];

  if (!value) {
    throw new Error(
      `${definition.envName} is not configured`,
    );
  }

  return value;
}

function formatAmount(
  amount:
    number | null,
  currency:
    string,
) {
  if (
    amount === null
  ) {
    return null;
  }

  return new Intl
    .NumberFormat(
      "en-IE",
      {
        style:
          "currency",
        currency:
          currency.toUpperCase(),
      },
    )
    .format(
      amount / 100,
    );
}

function validateStripePrice({
  definition,
  unitAmount,
  currency,
  recurring,
  active,
}: {
  definition:
    PlanDefinition;
  unitAmount:
    number | null;
  currency:
    string;
  recurring:
    {
      interval:
        string;
      interval_count:
        number;
    } | null;
  active:
    boolean;
}) {
  if (!active) {
    throw new Error(
      `${definition.envName} points to an inactive Stripe Price`,
    );
  }

  if (
    currency.toLowerCase() !==
    definition.expectedCurrency
  ) {
    throw new Error(
      `${definition.envName} must use EUR`,
    );
  }

  if (
    unitAmount !==
    definition.expectedUnitAmount
  ) {
    throw new Error(
      `${definition.envName} has the wrong amount for ${definition.publicName}`,
    );
  }

  if (
    definition.checkoutMode ===
    "payment"
  ) {
    if (
      recurring !== null
    ) {
      throw new Error(
        `${definition.envName} must be a one-time Stripe Price`,
      );
    }

    return;
  }

  if (
    !recurring ||
    !definition.recurring
  ) {
    throw new Error(
      `${definition.envName} must be a recurring Stripe Price`,
    );
  }

  if (
    recurring.interval !==
      definition
        .recurring
        .interval ||
    recurring.interval_count !==
      definition
        .recurring
        .intervalCount
  ) {
    throw new Error(
      `${definition.envName} has the wrong recurring interval`,
    );
  }
}

export async function getConfiguredPlans() {
  const stripe =
    getStripe();

  const keys:
    BillingPlanKey[] = [
      "daily",
      "weekly",
      "monthly",
      "yearly",
    ];

  const plans = [];

  for (
    const key of keys
  ) {
    const definition =
      PLAN_DEFINITIONS[
        key
      ];

    const priceId =
      process.env[
        definition
          .envName
      ];

    if (!priceId) {
      continue;
    }

    const price =
      await stripe
        .prices
        .retrieve(
          priceId,
        );

    validateStripePrice({
      definition,
      unitAmount:
        price.unit_amount,
      currency:
        price.currency,
      recurring:
        price.recurring
          ? {
              interval:
                price
                  .recurring
                  .interval,
              interval_count:
                price
                  .recurring
                  .interval_count,
            }
          : null,
      active:
        price.active,
    });

    plans.push({
      key,
      priceId,
      name:
        definition
          .publicName,
      amount:
        formatAmount(
          price.unit_amount,
          price.currency,
        ),
      currency:
        price.currency
          .toUpperCase(),
      checkoutMode:
        definition
          .checkoutMode,
      interval:
        price.recurring
          ?.interval ??
        null,
      intervalCount:
        price.recurring
          ?.interval_count ??
        null,
      badge:
        definition
          .badge,
      description:
        definition
          .description,
    });
  }

  return plans;
}
