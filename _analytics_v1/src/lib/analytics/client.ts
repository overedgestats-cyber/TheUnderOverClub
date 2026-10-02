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

  if (window.gtag) {
    window.gtag(
      "event",
      name,
      cleanParams,
    );
  }

  if (window.fbq) {
    if (
      name ===
      "purchase_completed"
    ) {
      window.fbq(
        "track",
        "Purchase",
        {
          value:
            cleanParams.value ??
            0,
          currency:
            cleanParams.currency ??
            "EUR",
          content_name:
            cleanParams.plan ??
            "membership",
        },
      );
    } else {
      window.fbq(
        "trackCustom",
        name,
        cleanParams,
      );
    }
  }
}
