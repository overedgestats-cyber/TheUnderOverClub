THE UNDER OVER CLUB — DAILY AUTO PUBLISH V1

Automatically runs the current daily publication pipeline:

1. Import fixtures for the Europe/Sofia date.
2. Generate the Free Picks dry run.
3. Commit the exact signed two-pick slate using the existing review token.
4. Publish the future-only immutable Paid Board.
5. Permanently store paid analysis.
6. Verify 4 tracking rows per paid fixture.
7. Count official paid recommendations.

Free Picks safety remains intact:
- signed review token is still used
- the model is not rerun between preview and commit
- final pre-kickoff validation still runs
- existing published slates remain immutable

Paid safety remains intact:
- existing published boards remain immutable
- complete tracking datasets are not duplicated
- partial non-zero tracking datasets block automatic retry
- existing pre-kickoff storage guard remains active

ROUTE
-----
GET /api/cron/daily-publish

AUTH
----
Vercel production cron: CRON_SECRET
Manual/admin fallback: INTERNAL_API_SECRET

SCHEDULE
--------
0 3 * * *

Vercel schedules are UTC.

On Hobby, Vercel may invoke the daily job at any time during the configured
03:00 UTC hour. That is roughly 06:00-06:59 Sofia during summer and
05:00-05:59 Sofia during winter, keeping the publication safely before the
morning target deadline.

On Pro/Enterprise, timing is per-minute.

INSTALL
-------
Extract ZIP directly into:
C:\Users\Marty\Desktop\theunderoverclub

Keep the _daily_auto_publish_v1 folder.

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_daily_auto_publish_v1.mjs
npm run build

If build passes:
vercel deploy --prod

MANUAL TEST
-----------
With npm run dev running:

powershell -ExecutionPolicy Bypass -File .\run_daily_auto_publish.ps1

Production manual trigger after deployment:

powershell -ExecutionPolicy Bypass -File .\run_daily_auto_publish.ps1 https://theunderoverclub.com

Successful result should contain:
"ok": true
"status": "completed"

with stages:
fixture_import
free_picks
paid_board
paid_analysis

No SQL changes.
No model changes.
No Stripe changes.
No Clerk changes.
