THE UNDER OVER CLUB — PERMANENT FOUR-MARKET TRACKING

PURPOSE
-------
For every paid-board fixture, freeze one strongest selection from each market:

1. Over/Under 2.5
2. BTTS
3. 1X2
4. Double Chance

All four are kept for model tracking.

Only the best three selections that pass the official thresholds are copied
to the existing recommendations table and become customer-facing paid picks.

OFFICIAL THRESHOLDS
-------------------
- Confidence >= 75%
- Fair/de-vigged value edge >= +5 percentage points
- Data quality >= 65%
- Valid odds

ODDS
----
- Bet365 bookmaker ID 8 is primary.
- Exact API-Football market IDs only:
  1  Match Winner
  5  Goals Over/Under
  8  Both Teams Score
  12 Double Chance
- If Bet365 is unavailable, exact-market median fallback is allowed.

IMPORTANT SCHEMA CHANGE
-----------------------
The existing recommendations table keeps its original raw:
- bookmaker_probability = 1 / odds
- value_edge = model_probability - 1 / odds

Two new official-pick fields are added:
- fair_bookmaker_probability
- fair_value_edge

The +5pp database qualification constraint is updated to use the fair
probability when present. Historical rows remain valid through the raw fallback.

TRACKING TABLE
--------------
market_analysis_snapshots stores:
- all 4 markets per fixture
- exact selection
- odds + source
- model probability
- fair bookmaker probability
- fair value edge
- confidence
- data quality
- pass/fail
- official rank if customer-facing
- rejection reasons
- complete analysis JSON
- settlement status and unit profit

Rows are immutable except for settlement fields.

SAFETY
------
Permanent saving refuses to run after ANY fixture in the published board has
already kicked off. This prevents look-ahead bias.

INSTALL
-------
1. Open Supabase SQL Editor.
2. Run:
   supabase/market_analysis_tracking_v1.sql

3. Extract the code files into:
   C:\Users\Marty\Desktop\theunderoverclub

4. Stop the dev server.

5. Build:
   npm run build

6. Start:
   npm run dev

DRY RUN
-------
Nothing is written:

powershell -ExecutionPolicy Bypass -File .\run_store_paid_analysis.ps1

Historical dry-run example:

powershell -ExecutionPolicy Bypass -File .\run_store_paid_analysis.ps1 -Date 2026-08-09

PERMANENT COMMIT
----------------
Use ONLY before the day's fixtures have started and only after the paid board
has been published:

powershell -ExecutionPolicy Bypass -File .\run_store_paid_analysis.ps1 -Commit

Do not use -Commit for 2026-08-09 now. Those matches have already started or
finished, and the route will reject the write deliberately.
