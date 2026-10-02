"use client";

import Link from "next/link";
import Script from "next/script";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
} from "next/navigation";

import {
  ANALYTICS_CONSENT_KEY,
  trackEvent,
  trackPurchase,
} from "@/lib/analytics/client";

import styles from "./AnalyticsProvider.module.css";

type Consent =
  | "unknown"
  | "accepted"
  | "rejected";

const GA_ID =
  process.env
    .NEXT_PUBLIC_GA_MEASUREMENT_ID
    ?.trim() || "G-ECB5B84FW8";

const META_PIXEL_ID =
  process.env
    .NEXT_PUBLIC_META_PIXEL_ID
    ?.trim() ?? "";

const PLAN_VALUES:
  Record<string, number> = {
    daily:
      2.49,
    weekly:
      6.99,
    monthly:
      17.99,
    yearly:
      119.99,
  };

function eventForPath(
  pathname: string,
) {
  if (pathname === "/") {
    return "homepage_view";
  }

  if (
    pathname === "/today"
  ) {
    return "free_picks_view";
  }

  if (
    pathname ===
    "/subscription"
  ) {
    return "subscription_view";
  }

  if (
    pathname ===
    "/paid-picks"
  ) {
    return "paid_picks_view";
  }

  if (
    pathname ===
    "/statistics"
  ) {
    return "statistics_view";
  }

  if (
    pathname ===
    "/account"
  ) {
    return "account_view";
  }

  return null;
}

export default function AnalyticsProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [gaReady, setGaReady] = useState(false);
  const [metaReady, setMetaReady] = useState(false);
  const pathname =
    usePathname();

  const [
    consent,
    setConsent,
  ] =
    useState<Consent>(
      "unknown",
    );

  const lastTracked =
    useRef<string | null>(
      null,
    );

  const configured =
    Boolean(
      GA_ID ||
      META_PIXEL_ID,
    );

  useEffect(() => {
    if (!configured) {
      setConsent(
        "rejected",
      );
      return;
    }

    const stored =
      window.localStorage
        .getItem(
          ANALYTICS_CONSENT_KEY,
        );

    if (
      stored ===
        "accepted" ||
      stored ===
        "rejected"
    ) {
      setConsent(
        stored,
      );
    }
  }, [
    configured,
  ]);

  useEffect(() => {
    if (
      consent !==
      "accepted" || (GA_ID && !gaReady) || (META_PIXEL_ID && !metaReady)
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          const search =
            new URLSearchParams(
              window.location
                .search,
            );

          const signature =
            `${pathname}${window.location.search}`;

          if (
            lastTracked.current !==
            signature
          ) {
            lastTracked.current =
              signature;

            window.gtag?.(
              "event",
              "page_view",
              {
                page_path:
                  pathname,
                page_location:
                  `${window.location.origin}${pathname}`,
                page_title:
                  document.title,
              },
            );

            window.fbq?.(
              "track",
              "PageView",
            );

            const routeEvent =
              eventForPath(
                pathname,
              );

            if (
              routeEvent
            ) {
              trackEvent(
                routeEvent,
                {
                  path:
                    pathname,
                },
              );
            }
          }

          if (
            pathname ===
              "/subscription" &&
            search.get(
              "required",
            ) === "paid"
          ) {
            trackEvent(
              "paid_picks_gate_view",
              {
                source:
                  "paid_picks",
              },
            );
          }

          if (
            pathname ===
              "/subscription" &&
            search.get(
              "checkout",
            ) ===
              "cancelled"
          ) {
            trackEvent(
              "checkout_cancelled",
              {
                plan:
                  search.get(
                    "plan",
                  ) ??
                  "unknown",
              },
            );
          }

          if (
            pathname ===
              "/account" &&
            search.get(
              "checkout",
            ) ===
              "success"
          ) {
            const plan =
              search.get(
                "plan",
              ) ??
              "";

            const sessionId =
              search.get(
                "session_id",
              ) ??
              "";

            const value =
              PLAN_VALUES[
                plan
              ];

            if (
              plan &&
              sessionId &&
              typeof value ===
                "number"
            ) {
              const storageKey =
                `uo_purchase_tracked:${sessionId}`;

              if (
                window.localStorage
                  .getItem(
                    storageKey,
                  ) !== "1"
              ) {
                trackPurchase({
                  plan,
                  value,
                  currency:
                    "EUR",
                  transactionId:
                    sessionId,
                });

                window.localStorage
                  .setItem(
                    storageKey,
                    "1",
                  );
              }
            }
          }
        },
        500,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    pathname,
    consent,
    gaReady,
    metaReady,
  ]);

  function chooseConsent(
    value:
      "accepted" |
      "rejected",
  ) {
    window.localStorage
      .setItem(
        ANALYTICS_CONSENT_KEY,
        value,
      );

    setConsent(
      value,
    );
  }

  return (
    <>
      {consent ===
        "accepted" &&
      GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />

          <Script
            id="uo-ga4"
            onReady={() => setGaReady(true)}
            strategy="afterInteractive"
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                send_page_view: false
              });
            `}
          </Script>
        </>
      ) : null}

      {consent ===
        "accepted" &&
      META_PIXEL_ID ? (
        <Script
          id="uo-meta-pixel"
          onReady={() => setMetaReady(true)}
          strategy="afterInteractive"
        >
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
          `}
        </Script>
      ) : null}

      {children}

      {configured &&
      consent ===
        "unknown" ? (
        <div
          className={
            styles.banner
          }
          role="dialog"
          aria-label="Analytics consent"
        >
          <div>
            <strong>
              OPTIONAL ANALYTICS
            </strong>

            <p>
              Help us understand
              which pages and
              membership options
              work best. Login and
              payment features work
              without optional
              analytics.
            </p>

            <Link href="/privacy">
              PRIVACY POLICY
            </Link>
          </div>

          <div
            className={
              styles.actions
            }
          >
            <button
              type="button"
              className={
                styles.reject
              }
              onClick={() =>
                chooseConsent(
                  "rejected",
                )
              }
            >
              NECESSARY ONLY
            </button>

            <button
              type="button"
              className={
                styles.accept
              }
              onClick={() =>
                chooseConsent(
                  "accepted",
                )
              }
            >
              ACCEPT ANALYTICS
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
