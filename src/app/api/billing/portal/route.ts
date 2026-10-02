import {
  auth,
} from "@clerk/nextjs/server";
import type {
  NextRequest,
} from "next/server";

import {
  getPaidEntitlement,
} from "@/lib/auth/entitlement";
import {
  getStripe,
} from "@/lib/stripe/client";

export const dynamic =
  "force-dynamic";

export async function POST(
  request: NextRequest,
) {
  const {
    isAuthenticated,
    userId,
  } =
    await auth();

  if (
    !isAuthenticated ||
    !userId
  ) {
    return Response.redirect(
      new URL(
        "/sign-in",
        request.url,
      ),
      303,
    );
  }

  const entitlement =
    await getPaidEntitlement(
      userId,
    );

  if (
    !entitlement
      .stripeCustomerId
  ) {
    return Response.redirect(
      new URL(
        "/subscription",
        request.url,
      ),
      303,
    );
  }

  const stripe =
    getStripe();

  const origin =
    new URL(
      request.url,
    ).origin;

  const session =
    await stripe
      .billingPortal
      .sessions
      .create({
        customer:
          entitlement
            .stripeCustomerId,
        return_url:
          `${origin}/account`,
      });

  return Response.redirect(
    session.url,
    303,
  );
}
