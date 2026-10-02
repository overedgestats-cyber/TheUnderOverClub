THE UNDER OVER CLUB — PAID MODEL V3B OPPONENT-STRENGTH SHADOW V1

PURPOSE
-------
Add true opponent-strength context to the 1X2 shadow model while leaving
production recommendations unchanged.

PRODUCTION REMAINS
------------------
- paid-confidence-v2
- current 1X2 anomaly guard
- current official recommendation rules

V3B SHADOW ADDS
---------------
1. Standings lookup by historical fixture league + season.
2. In-process cache by leagueId:season.
3. Opponent strength derived from:
   - league standing position
   - points per game
4. Competition-context weighting.
5. Recency weighting.
6. Venue weighting.
7. Target-competition environment normalization.
8. Opponent-adjusted Poisson and empirical 1X2.
9. Conservative de-vigged market calibration.
10. Storage inside the existing analysis_snapshot JSON.

API COST
--------
No per-opponent API call is made.

Standings are fetched once per unique league + season and cached for the
lifetime of the server process. Repeated historical fixtures in the same
competition reuse the same standings response.

Cup / UEFA / Libertadores-style historical competitions fall back to the
existing competition-context coefficient rather than forcing a standings call.

IMPORTANT LIMITATION
--------------------
This is still shadow-only.

Standings available at publication time are used as a pre-kickoff strength
signal. The model does not claim to reconstruct the exact historical standing
table as it existed before every historical match.

No customer-facing probability or pick is changed by this package.

INSTALL
-------
Extract ZIP into:

C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_paid_v3b_opponent_strength_shadow_v1.mjs
npm run build

TEST ARSENAL VS COVENTRY
------------------------
With npm run dev running:

powershell -ExecutionPolicy Bypass -File .\run_v3b_shadow_preview.ps1 -FixtureId 1557367

Compare:
- productionV2.oneXTwo
- shadowV3a
- shadowV3b.oneXTwo.rawOpponentAdjusted
- shadowV3b.oneXTwo.bookmakerPrior
- shadowV3b.oneXTwo.calibratedShadow
- shadowV3b home/away standingsCoverage
- shadowV3b averageOpponentStrength

DEPLOY
------
Do not deploy until the build passes and the Arsenal-Coventry diagnostic looks
sensible.

No SQL changes.
No Free Picks changes.
No Stripe changes.
No Clerk changes.
