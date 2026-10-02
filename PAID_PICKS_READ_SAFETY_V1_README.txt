THE UNDER OVER CLUB — PAID PICKS READ SAFETY V1

PURPOSE
-------
Hide already-stored customer-facing 1X2 recommendations when they violate the
CURRENT production 1X2 anomaly rules.

WHY
---
An immutable recommendation can have been published before a later safety rule
was introduced. We do not delete or rewrite that historical recommendation.
Instead, the customer-facing Paid Picks read path re-checks the same safety
helper used by production recommendation qualification.

WHAT CHANGES
------------
1. Exports oneXTwoAnomalyReason() from:
   src/lib/analysis/recommendations.ts

2. Reuses that exact helper in:
   src/lib/paid-picks/public-paid-picks.ts

3. Filters only the Paid Picks response.

WHAT DOES NOT CHANGE
--------------------
- recommendations table
- market_analysis_snapshots
- immutable publication run
- settlement
- statistics/tracking/calibration data
- Free Picks
- O/U rules
- BTTS rules
- Double Chance rules
- Stripe / Clerk
- today's stored records

With the current production rules, Arsenal vs Coventry's Coventry 1X2
recommendation is preserved in the database but removed from the customer-facing
Paid Picks response.

INSTALL
-------
Extract into:

C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_paid_picks_read_safety_v1.mjs
npm run build

If build passes:

vercel deploy --prod

VERIFY
------
After deployment:
1. Open the live Paid Picks page.
2. Hard refresh (Ctrl+F5).
3. Arsenal vs Coventry may still appear because the fixture itself belongs to
   today's board, but the Coventry @ 15.00 official 1X2 pick must not appear.
4. Other safe recommendations for that fixture may still be displayed.
