THE UNDER OVER CLUB — SAFE PAID BOARD RUNNER V1

WHY
---
The legacy run_publish_paid_board.ps1 ignored -Date because it had no param()
block and sent Body "{}".

The API route itself supports body.date, but the legacy wrapper never sent it.
That caused an immutable 2026-08-19 publication when 2026-08-20 was requested.

This package prevents that from happening again.

CURRENT ENGINE
--------------
The safe runner uses:

/api/admin/store-paid-analysis

This is the current Confidence v2 paid-analysis storage flow that:
- evaluates the four tracked markets
- keeps the strongest tracked selection per market
- exposes only qualifying official picks
- supports dry-run vs commit

USAGE
-----
Review only:

powershell -ExecutionPolicy Bypass -File .\run_paid_board.ps1 -Date 2026-08-20

This sends:
{
  "date": "2026-08-20",
  "commit": false
}

Nothing should be stored.

After reviewing the exact slate:

powershell -ExecutionPolicy Bypass -File .\run_paid_board.ps1 -Date 2026-08-20 -Commit

This sends:
{
  "date": "2026-08-20",
  "commit": true
}

LEGACY RUNNER
-------------
run_publish_paid_board.ps1 is replaced with a guard that refuses to run and
points to the safe runner.

NO SQL CHANGES.
