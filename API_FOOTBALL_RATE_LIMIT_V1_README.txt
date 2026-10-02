THE UNDER OVER CLUB — API-FOOTBALL RATE-LIMIT PATCH V1

Problem found
-------------
The paid-analysis dry run failed because API-Football returned:
"Too many requests. You have exceeded the limit of requests per minute..."

What this patch does
--------------------
1. Adds one central request-start throttle in src/lib/api-football/client.ts.
2. Starts API-Football requests at least 250 ms apart (~4 requests/second).
3. Detects:
   - HTTP 429
   - API-Football JSON rate-limit errors returned inside a normal HTTP response
4. Retries rate-limit responses using:
   - Retry-After header when present
   - otherwise 5s, 15s, then 30s delays
5. Keeps the normal API-Football parser/error handling after the retry layer.
6. Raises the paid-analysis route maxDuration from 60s to 300s when that
   declaration exists.
7. Makes .bak copies before changing source files.

Why ~4 requests/second?
-----------------------
API-Football's current Pro limit is 300 requests/minute and 5 requests/second.
4 requests/second gives headroom below both ceilings.

Important
---------
- This does not change the model.
- This does not change pick selection.
- This does not store anything by itself.
- Continue using dry-run first:
  powershell -ExecutionPolicy Bypass -File .\run_paid_board.ps1 -Date 2026-08-20

Install
-------
Extract this ZIP into:
C:\Users\Marty\Desktop\theunderoverclub

Then run:
powershell -ExecutionPolicy Bypass -File .\apply_api_football_rate_limit_patch.ps1
npm run build

If build passes:
1. restart npm run dev
2. wait ~60 seconds to clear the previous API-Football rate window
3. rerun the paid-board dry run
