THE UNDER OVER CLUB — PAID MODEL V3A SHADOW V1

PURPOSE
-------
Add a shadow-only 1X2 model without changing any customer-facing production pick.

Production remains:
- paid-confidence-v2
- existing 1X2 anomaly/sanity guard
- existing official qualification rules

Shadow v3a adds:
- mild recency weighting
- conservative competition-context adjustment
- separate strength-adjusted expected goals
- separate strength-adjusted 1X2 Poisson + empirical probabilities
- de-vigged 1X2 bookmaker prior when available
- adaptive market shrinkage for extreme disagreements

IMPORTANT
---------
This package DOES NOT promote v3a to production.
It DOES NOT change official picks.
It DOES NOT change Free Picks.
It DOES NOT require SQL.

Future market_analysis_snapshots store the shadow v3 object inside the existing
analysis_snapshot JSON. This makes it possible to compare v2, v3a, bookmaker
probability, and the final result later.

INSTALL
-------
Extract ZIP directly into:

C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_paid_v3a_shadow_v1.mjs
npm run build

LOCAL PREVIEW
-------------
With npm run dev running:

powershell -ExecutionPolicy Bypass -File .\run_v3_shadow_preview.ps1 -FixtureId 123456

Replace 123456 with an API-Football provider fixture id.

The response shows:
- productionV2.oneXTwo
- production v2 1X2 recommendation
- shadowV3.rawStrengthAdjusted
- shadowV3.bookmakerPrior
- shadowV3.calibratedShadow

DEPLOY
------
Only after build and preview are sensible:

vercel deploy --prod

NOTES ON COMPETITION CONTEXT
----------------------------
The v3a coefficients are intentionally modest. They are NOT opponent Elo ratings.
They are a first shadow diagnostic layer using data already present in the
historical fixture payload, so no extra API calls are added to the morning run.

The intended later v3b step is true opponent-strength / Elo-style adjustment
after enough shadow data has been collected and reviewed.
