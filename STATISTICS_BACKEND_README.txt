THE UNDER OVER CLUB — STATISTICS BACKEND

NO SQL MIGRATION IS REQUIRED.

PUBLIC ENDPOINT
---------------
GET /api/statistics/official

Returns paid official performance only:
- total picks
- settled / resolved / pending
- won / lost / void
- win rate
- units profit
- ROI
- average odds
- current win/loss streak
- performance by market
- performance by Sofia calendar month

Definitions:
- Win rate = wins / (wins + losses)
- Voids are excluded from win-rate denominator
- Unit stake = 1 per priced official pick
- Win profit = odds - 1
- Loss = -1
- Void = 0
- ROI = total unit profit / priced settled stakes

INTERNAL ENDPOINT
-----------------
GET /api/admin/statistics/model

Requires INTERNAL_API_SECRET.

Returns all model-tracking data grouped by:
- market
- qualified / not qualified / official
- confidence band
- fair-value-edge band
- odds band
- model version

This allows later calibration of the 75% confidence and +5pp value thresholds.

INSTALL
-------
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub

2. Stop the dev server.

3. Run:
   npm run build

4. If successful:
   npm run dev

5. In another PowerShell:
   powershell -ExecutionPolicy Bypass -File .\run_statistics_preview.ps1

CURRENT EXPECTED STATE
----------------------
Because no genuine tracking/recommendation rows have been committed yet,
the statistics should currently return zeros/empty groups. That is correct.
