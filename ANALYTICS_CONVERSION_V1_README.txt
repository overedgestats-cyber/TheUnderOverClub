THE UNDER OVER CLUB — ANALYTICS + CONVERSION V1

WHAT THE SCREENSHOTS CONFIRMED
------------------------------
No analytics library or tracker is currently installed.
package.json does not need any new dependency for this package.

TRACKED FUNNEL
--------------
Automatic route events:
- homepage_view
- free_picks_view
- paid_picks_gate_view
- subscription_view
- statistics_view
- account_view
- paid_picks_view

Plan / checkout events:
- daily_plan_click
- weekly_plan_click
- monthly_plan_click
- yearly_plan_click
- checkout_started
- checkout_cancelled
- purchase_completed

CONSENT
-------
Google Analytics and Meta Pixel do NOT load until the visitor presses
ACCEPT ANALYTICS.

If the visitor chooses NECESSARY ONLY:
- Clerk / login still works
- Stripe / payments still work
- picks still work
- optional analytics scripts are not loaded

Consent is stored in:
uo_analytics_consent_v1

PURCHASE EVENT
--------------
Stripe success URLs are updated to return:

/account?checkout=success&plan=<plan>&session_id={CHECKOUT_SESSION_ID}

The account landing page fires purchase_completed only once per Stripe
Checkout Session in the browser.

This is suitable for initial funnel measurement. Stripe webhook records remain
the authoritative source for actual customer entitlement and payment state.

ENVIRONMENT VARIABLES
---------------------
Optional:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

You can configure GA4 only, Meta only, or both.

INSTALL
-------
Extract this ZIP into:
C:\Users\Marty\Desktop\theunderoverclub

Do NOT move the _analytics_v1 folder.

Run:
powershell -ExecutionPolicy Bypass -File .\install_analytics_conversion_v1.ps1
npm run build

Then add your analytics IDs to .env.local and Vercel.
Restart npm run dev after .env.local changes.
Redeploy after Vercel environment changes.

TEST
----
1. Open localhost in an incognito/private browser.
2. Confirm the retro consent banner appears.
3. Choose NECESSARY ONLY:
   no Google / Meta scripts should load.
4. Clear localStorage or use another private window.
5. Choose ACCEPT ANALYTICS.
6. Browse:
   / -> /today -> /subscription
7. Click a plan.
8. Cancel Stripe Checkout and confirm return to:
   /subscription?checkout=cancelled&plan=...
9. On a real successful purchase the return URL should include:
   /account?checkout=success&plan=...&session_id=...

NO SQL CHANGES.
NO CHANGES TO PICK LOGIC.
NO CHANGES TO ENTITLEMENT LOGIC.
