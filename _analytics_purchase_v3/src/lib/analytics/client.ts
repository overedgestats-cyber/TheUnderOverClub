"use client";

export type AnalyticsParams =
  Record<
    string,
    string | number | boolean | null | undefined
  >;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const ANALYTICS_CONSENT_KEY =
  "uo_analytics_consent_v1";

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(
      ANALYTICS_CONSENT_KEY,
    ) === "accepted"
  );
}

export function trackEvent(
  name: string,
  params: AnalyticsParams = {},
) {
  if (
    typeof window === "undefined" ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  const cleanParams =
    Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined,
      ),
    );

  window.gtag?.(
    "event",
    name,
    cleanParams,
  );

  window.fbq?.(
    "trackCustom",
    name,
    cleanParams,
  );
}

export function trackPurchase({
  plan,
  value,
  currency = "EUR",
  transactionId,
}: {
  plan: string;
  value: number;
  currency?: string;
  transactionId: string;
}) {
  if (
    typeof window === "undefined" ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  window.gtag?.(
    "event",
    "purchase",
    {
      transaction_id:
        transactionId,
      value,
      currency,
      items: [
        {
          item_id:
            plan,
          item_name:
            `${plan} membership`,
          price:
            value,
          quantity:
            1,
        },
      ],
    },
  );

  window.gtag?.(
    "event",
    "purchase_completed",
    {
      transaction_id:
        transactionId,
      plan,
      value,
      currency,
    },
  );

  window.fbq?.(
    "track",
    "Purchase",
    {
      value,
      currency,
      content_name:
        plan,
      content_type:
        "product",
      content_ids: [
        plan,
      ],
    },
  );

  window.fbq?.(
    "trackCustom",
    "purchase_completed",
    {
      transaction_id:
        transactionId,
      plan,
      value,
      currency,
    },
  );
}
