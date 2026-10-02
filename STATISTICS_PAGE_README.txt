THE UNDER OVER CLUB — REAL STATISTICS PAGE

ROUTE
-----
/statistics

DATA SOURCES
------------
The page imports the real statistics backend directly:

- getRecommendationStatistics("free")
- getRecommendationStatistics("paid")
- getCombinedStatistics()

There is no mock data and no hardcoded performance.

VIEWS
-----
ALL
FREE PICKS
PAID PICKS

ALL
---
Shows:
- combined Win Rate
- Units
- ROI
- Total Picks
- Average Odds
- Current Streak
- Free summary card
- Paid summary card
- combined monthly history

FREE PICKS
----------
Shows:
- real free-pick performance
- market breakdown
- monthly history

PAID PICKS
----------
Shows:
- real official paid-pick performance
- market breakdown
- monthly history

EMPTY STATE
-----------
Before genuine settled picks exist, the page displays:

- 0% Win Rate
- 0.00 Units
- 0% ROI
- 0 Picks
- No settled picks yet

No fake statistics are displayed.

INSTALL
-------
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub

2. Stop the dev server.

3. Run:
   npm run build

4. If successful:
   npm run dev

5. Open:
   http://localhost:3000/statistics

No SQL migration is required.
