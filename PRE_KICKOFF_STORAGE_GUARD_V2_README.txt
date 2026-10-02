THE UNDER OVER CLUB — PRE-KICKOFF STORAGE GUARD V2

Purpose
-------
The old permanent-storage guard aborted the entire paid-board commit if even
one fixture had already kicked off.

That behavior protected against look-ahead bias, but it also prevented valid
future fixtures from being stored when a Sofia calendar day included earlier
South American matches.

New behavior
------------
For both dry-run and permanent paid analysis:

1. Load the immutable published paid board.
2. Partition fixtures by CURRENT execution time.
3. Already-started fixtures are skipped.
4. Invalid kickoff timestamps are skipped conservatively.
5. Future fixtures continue through the normal Confidence v2 analysis.
6. If every published fixture has already started, the operation is refused.

This keeps the look-ahead protection intact. It does NOT permit historical
analysis to be written after kickoff.

Important for 2026-08-20
------------------------
Do not try to retroactively commit the August 20 slate late in the day.
By the evening, many/all fixtures have started, and this patch will correctly
refuse or skip them.

The patch is for future publication cycles.

Next publication fix
--------------------
The publication layer must also exclude fixtures whose kickoff is already in
the past at publication time, so they never enter daily_board_fixtures in the
first place.

To patch that safely, inspect:

src/lib/paid-board/create-paid-board.ts

Suggested command:

Get-Content .\src\lib\paid-board\create-paid-board.ts |
  Select-Object -First 360

Install
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:

powershell -ExecutionPolicy Bypass -File .\apply_pre_kickoff_storage_guard_v2.ps1
npm run build

No SQL changes.
No model changes.
No threshold changes.
