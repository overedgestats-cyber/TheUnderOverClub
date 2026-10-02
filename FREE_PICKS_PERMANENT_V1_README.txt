THE UNDER OVER CLUB — FREE PICKS PERMANENT V1

PURPOSE
-------
This package makes the tested OverEdge-based Free Picks engine permanent.

It does NOT change the paid recommendation table or relax paid-pick constraints.

DATABASE
--------
Creates:
- free_pick_publications
- free_pick_settlement_events

The daily slate is immutable:
- publication date cannot change
- fixture cannot change
- rank cannot change
- selection cannot change
- model probability/confidence cannot change
- analysis snapshot cannot change

Odds are allowed to start NULL.
If captured later before kickoff, they can be written ONCE.
After odds are captured, the DB trigger prevents changing them.

Settlement fields are the only other mutable fields.

WHY FREE PICKS HAVE THEIR OWN TABLE
-----------------------------------
Paid picks require strict odds/value/confidence constraints.
Free Picks have a different product rule:
- exactly two top O/U 2.5 model selections when possible
- odds do not affect selection
- fallback confidence below 75% can be used if needed
- a pick remains valid even if no bookmaker price is available yet

Keeping Free Picks in their own table preserves paid-pick integrity.

STATISTICS
----------
The package updates recommendation-statistics.ts so:
- Free statistics read free_pick_publications
- Paid statistics still read recommendations
- ALL combines both
- Free picks without captured odds still count for win rate
- unpriced Free Picks do NOT distort units profit or ROI

INSTALL ORDER
-------------
1. Extract package into:
   C:\Users\Marty\Desktop\theunderoverclub

2. In Supabase SQL Editor run:
   supabase/free_picks_v1.sql

3. Stop dev server and run:
   npm run build

4. If build passes:
   npm run dev

DRY RUN AUGUST 11
-----------------
powershell -ExecutionPolicy Bypass -File .\run_publish_free_picks.ps1 -Date 2026-08-11

Nothing is stored unless -Commit is supplied.

COMMIT AUGUST 11
----------------
Only after the dry run shows the expected two picks:

powershell -ExecutionPolicy Bypass -File .\run_publish_free_picks.ps1 -Date 2026-08-11 -Commit

Once committed, re-running publication for the same date will return the existing slate and will NOT regenerate it.

ODDS ENRICHMENT
---------------
Dry:
powershell -ExecutionPolicy Bypass -File .\run_enrich_free_pick_odds.ps1 -Date 2026-08-11

Commit:
powershell -ExecutionPolicy Bypass -File .\run_enrich_free_pick_odds.ps1 -Date 2026-08-11 -Commit

Only picks with NULL odds are considered.
Only pre-kickoff fixtures can receive odds.
Odds can be captured only once.

SETTLEMENT
----------
After matches finish:

Dry:
powershell -ExecutionPolicy Bypass -File .\run_settle_free_picks.ps1 -Date 2026-08-11

Commit:
powershell -ExecutionPolicy Bypass -File .\run_settle_free_picks.ps1 -Date 2026-08-11 -Commit

O/U 2.5 settlement:
- Over 2.5 wins at 3+ goals.
- Under 2.5 wins at 0-2 goals.
- FT/AET/PEN use the 90-minute full-time score when API-Football provides it.

IMPORTANT
---------
Do not commit a historical date after its selected fixtures have kicked off.
The publication route blocks that to protect against look-ahead bias.
