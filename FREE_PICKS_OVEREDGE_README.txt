THE UNDER OVER CLUB — FREE PICKS OVEREDGE MODEL

This package ports the actual OverEdge Free Picks selection path:

scoreFixtureForOU25()
  -> last-match O/U statistics
  -> choose Over 2.5 or Under 2.5
  -> calibratedConfidence()
  -> rank by confidence
  -> select two

CHANGES FOR THE UNDER OVER CLUB
-------------------------------
1. No odds restriction.
   Odds do NOT influence which two picks are chosen.

2. The target is two picks every day whenever at least two eligible,
   analyzable fixtures exist.

3. 75%+ confidence remains the preferred quality band.
   If fewer than two candidates reach 75%, the engine fills the slate with
   the next-highest calibrated-confidence candidate(s).

4. Exact Under Over Club odds infrastructure is used AFTER selection:
   - Bet365 bookmaker ID 8 is primary.
   - exact API-Football market ID 5 only.
   - market-median exact-market fallback if Bet365 is unavailable.

5. Men's European scope only:
   - first divisions
   - second divisions
   - domestic cups
   - UEFA club competitions
   - youth/reserve/women are excluded.

6. Historical scoring excludes matches at/after the target kickoff to avoid
   look-ahead leakage during backtests/previews.

IMPORTANT
---------
This package is PREVIEW ONLY.
It does not save Free Picks to Supabase yet.

That is intentional: first verify that the two daily selections reproduce the
OverEdge behavior sensibly with the new fixture/odds infrastructure.

INSTALL
-------
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub

2. Stop dev server.

3. Run:
   npm run build

4. If successful:
   npm run dev

5. In another PowerShell:
   powershell -ExecutionPolicy Bypass -File .\run_free_picks_preview.ps1

Optional date:
   powershell -ExecutionPolicy Bypass -File .\run_free_picks_preview.ps1 -Date 2026-08-11

Before previewing a new day, import that day's fixtures first.
