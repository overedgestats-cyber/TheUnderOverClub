THE UNDER OVER CLUB — PAID BOARD FUTURE-ONLY PUBLICATION V1

Purpose
-------
Prevent already-started fixtures from entering a new immutable paid board.

Before
------
getPaidFixturesForDate(date)
→ every paid-scope fixture on that Europe/Sofia calendar date
→ immutable publication

This caused early South American fixtures to be included when the board was
published later in the Sofia morning.

After
-----
getPaidFixturesForDate(date)
→ filter kickoff_at > actual publication time
→ immutable publication

Rules
-----
- kickoff in the future: included
- kickoff already reached/passed: excluded
- invalid kickoff timestamp: excluded conservatively
- existing already-published runs remain immutable and are not rewritten

Defense in depth
----------------
Keep Pre-Kickoff Storage Guard v3 installed.

Publication layer:
started fixtures never enter a NEW board.

Storage layer:
if a fixture somehow starts between publication and analysis storage, it is
skipped and cannot contaminate the permanent tracking dataset.

Installation
------------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:

powershell -ExecutionPolicy Bypass -File .\apply_paid_board_future_only_v1.ps1
npm run build

If build passes:
vercel deploy --prod

No SQL changes.
No model changes.
No confidence/value threshold changes.

Next-day workflow
-----------------
1. Import fixtures.
2. Publish the paid fixture board while it is still morning.
3. Run paid-analysis dry run.
4. Review.
5. Commit immediately.

Do not use this patch to retroactively rewrite an already-published historical
board. Existing publication_runs remain immutable by design.
