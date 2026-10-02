THE UNDER OVER CLUB — RATE-LIMIT TYPESCRIPT FIX V2

Build error
-----------
src/lib/api-football/client.ts
release?.()
Type 'never' has no call signatures.

Cause
-----
The first throttle implementation assigned the Promise resolver to a nullable
variable from inside a Promise constructor. TypeScript control-flow analysis
does not reliably treat that callback assignment as a synchronous assignment,
so the optional call was narrowed incorrectly.

Fix
---
The throttle queue now uses chained Promises directly and has no nullable
resolver variable.

The behavior remains the same:
- one shared API-Football request-start queue
- minimum 250 ms between request starts
- ~4 request starts/second maximum
- retry logic from rate-limit v1 remains unchanged

No SQL changes.
No model changes.
No pick-selection changes.

Install
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
powershell -ExecutionPolicy Bypass -File .\fix_api_football_throttle_typescript_v2.ps1

Then:
npm run build

After the build passes:
1. npm run dev
2. wait about 60 seconds if the API rate limit was recently hit
3. dry run only:
   powershell -ExecutionPolicy Bypass -File .\run_paid_board.ps1 -Date 2026-08-20
