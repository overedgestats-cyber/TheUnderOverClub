import "server-only";

import Stripe from "stripe";

let stripe:
  Stripe | null = null;

export function getStripe() {
  const secret =
    process.env
      .STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY",
    );
  }

  if (!stripe) {
    stripe =
      new Stripe(secret);
  }

  return stripe;
}
