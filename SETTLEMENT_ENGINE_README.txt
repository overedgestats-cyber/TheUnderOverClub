THE UNDER OVER CLUB — PAID SETTLEMENT ENGINE

Settles all four market_analysis_snapshots rows per fixture and the customer-facing official recommendations.

Markets: O/U 2.5, BTTS, 1X2, Double Chance.

Standard pre-match markets use the 90-minute score. For AET/PEN fixtures, score.fulltime is required so extra time and penalties are excluded. Only FT, AET and PEN are auto-settled. Other statuses stay pending.

Official recommendations use a fixed 1-unit stake:
Won = odds - 1
Lost = -1
Void = 0

Dry run:
powershell -ExecutionPolicy Bypass -File .\run_settle_paid_analysis.ps1

Historical date:
powershell -ExecutionPolicy Bypass -File .\run_settle_paid_analysis.ps1 -Date 2026-08-11

Commit after checking the dry run:
powershell -ExecutionPolicy Bypass -File .\run_settle_paid_analysis.ps1 -Commit

No SQL migration is required. Updates only rows still marked pending, so reruns are idempotent.
