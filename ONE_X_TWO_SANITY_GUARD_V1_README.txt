THE UNDER OVER CLUB — 1X2 SANITY GUARD V1

WHAT THIS FIXES
---------------
The current 1X2 model can create extreme model-vs-market disagreements because
its recent-form/Poisson inputs do not yet adjust for opponent or competition
strength.

Example class:
- market says a team is a major long shot
- model says the same team has a dramatically higher probability
- normal confidence/data-quality/edge thresholds still pass
- result becomes an official customer-facing pick

This patch does NOT delete or suppress model tracking.

It only changes OFFICIAL QUALIFICATION for 1X2:
1. If 1X2 value edge is >= +18 percentage points -> tracking only.
2. If bookmaker fair probability is below 18% AND the model probability is
   at least 2.25x the bookmaker fair probability -> tracking only.

Normal existing rules remain:
- confidence >= 75%
- fair edge >= +5pp
- data quality >= 65%

WHY THIS IS SAFER
-----------------
The model can still disagree with bookmakers and find value.
But extreme 1X2 disagreements are treated as anomalies until the model gains
opponent-strength / competition-strength adjustment and enough calibration
history.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_one_x_two_sanity_guard_v1.mjs
npm run build

IMPORTANT
---------
Do not republish or mutate an already immutable daily board merely to remove a
historical anomaly. This patch affects future analysis/publication runs.

LONGER-TERM MODEL WORK
----------------------
Recommended later:
- opponent-strength / Elo-style adjustment
- competition-strength adjustment
- league-normalized attack/defence rates
- market calibration by probability bucket
- separate calibration for 1X2 vs O/U vs BTTS vs Double Chance
