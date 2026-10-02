THE UNDER OVER CLUB — 1X2 +12PP SAFETY PATCH V1

PURPOSE
-------
Tighten the temporary production 1X2 anomaly guard.

OLD RULE
--------
Reject an official 1X2 pick when model-vs-market value edge is >= +18 percentage points.

NEW RULE
--------
Reject an official 1X2 pick when model-vs-market value edge is >= +12 percentage points.

UNCHANGED
---------
- The pick is still tracked for calibration.
- The long-shot probability-ratio guard remains unchanged.
- O/U 2.5 rules are unchanged.
- BTTS rules are unchanged.
- Double Chance rules are unchanged.
- Free Picks are unchanged.
- Existing immutable published slates are unchanged.
- No SQL migration.
- No API-Football changes.
- No Stripe/Clerk changes.

INSTALL
-------
Extract into:

C:\Users\Marty\Desktop\theunderoverclub

Then run:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_1x2_12pp_safety_patch_v1.mjs
npm run build

If build passes:

vercel deploy --prod
