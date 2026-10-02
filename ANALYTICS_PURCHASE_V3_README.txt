THE UNDER OVER CLUB — ANALYTICS PURCHASE ATTRIBUTION V3

Based on the exact current Stripe checkout route supplied on 2026-08-21.

Changes
-------
1. Stripe success URL becomes:
   /account?checkout=success&plan=<plan>&session_id={CHECKOUT_SESSION_ID}

2. Stripe cancel URL becomes:
   /subscription?checkout=cancelled&plan=<plan>

3. When a visitor previously accepted optional analytics and returns from a
   successful Stripe Checkout, the frontend records:
   - GA4 standard `purchase`
   - GA4 custom `purchase_completed`
   - Meta standard `Purchase`
   - Meta custom `purchase_completed`

4. Stripe Checkout Session ID is used as the GA transaction_id.

5. Browser-side deduplication prevents the same Checkout Session from firing
   the purchase event twice in the same browser:
   uo_purchase_tracked:<session_id>

Important
---------
This tracking does NOT grant paid access.

Stripe webhook/database entitlement remains authoritative.

The analytics return URL is only for conversion measurement.

Install
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Keep the _analytics_purchase_v3 folder.

Run:
powershell -ExecutionPolicy Bypass -File .\install_analytics_purchase_v3.ps1
npm run build

No SQL changes.
No change to Stripe prices.
No change to subscription entitlement.
No change to prediction logic.
