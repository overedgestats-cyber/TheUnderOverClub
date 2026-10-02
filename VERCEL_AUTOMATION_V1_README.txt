THE UNDER OVER CLUB — VERCEL AUTOMATION V1

WHAT IS AUTOMATED
-----------------
1. Fixture sync
   - imports today
   - imports tomorrow
   - uses the existing idempotent fixture upsert

2. Free Pick odds enrichment
   - runs twice daily
   - checks today + tomorrow
   - only fills NULL odds
   - never changes already-captured odds
   - never changes which Free Picks were selected

3. Settlement reconciliation
   - checks today, yesterday and two days ago
   - settles Free Picks
   - settles paid tracking snapshots
   - settles official Paid Picks
   - only pending rows are touched

WHAT IS NOT AUTOMATED
---------------------
Free Picks publication is NOT automated.
Paid board publication is NOT automated.

The reviewed/signed Free Picks publication workflow remains manual.

CRON SCHEDULES
--------------
Vercel cron schedules are UTC.

fixture-sync:
  0 15 * * *
  Approx Sofia:
    18:00 during EEST
    17:00 during EET

free-odds-morning:
  0 8 * * *
  Approx Sofia:
    11:00 during EEST
    10:00 during EET

free-odds-afternoon:
  0 13 * * *
  Approx Sofia:
    16:00 during EEST
    15:00 during EET

settlement:
  0 4 * * *
  Approx Sofia:
    07:00 during EEST
    06:00 during EET

Each configured cron expression runs once per day, so this configuration is
compatible with Vercel's current Hobby minimum scheduling interval.
On Hobby, invocation can occur at any point within the configured UTC hour.

SECURITY
--------
All cron routes require:
CRON_SECRET

Vercel sends CRON_SECRET as:
Authorization: Bearer <CRON_SECRET>

setup_cron_secret.ps1:
- creates a 32-byte random local secret if missing
- does not print it
- if Vercel CLI is available, adds the same value to Production as a sensitive env var

INSTALL
-------
1. Extract this package into:
   C:\Users\Marty\Desktop\theunderoverclub

2. Configure cron secret:
   powershell -ExecutionPolicy Bypass -File .\setup_cron_secret.ps1

3. Install/merge vercel.json cron entries:
   powershell -ExecutionPolicy Bypass -File .\install_vercel_crons.ps1

4. Build:
   npm run build

5. Local test:
   npm run dev

   In another PowerShell:
   powershell -ExecutionPolicy Bypass -File .\run_cron_test.ps1 -Job fixture-sync
   powershell -ExecutionPolicy Bypass -File .\run_cron_test.ps1 -Job free-odds-morning
   powershell -ExecutionPolicy Bypass -File .\run_cron_test.ps1 -Job settlement

6. Deploy to PRODUCTION.
   Vercel Cron Jobs run against production deployments, not local/preview deployments.

IMPORTANT
---------
Cron execution is designed to be idempotent:
- fixtures use upsert
- odds only fill NULL prices
- settlement only updates pending rows

The settlement job reconciles multiple dates to recover from an occasional
missed scheduled invocation.

No SQL migration is required.
