THE UNDER OVER CLUB — FULL PAID-DAY ANALYSIS PREVIEW

This adds a protected preview endpoint that analyzes every paid-scope fixture
for the selected Sofia calendar date.

It DOES NOT save recommendations and DOES NOT modify the immutable board.

Install:
1. Extract this ZIP into:
   C:\Users\Marty\Desktop\theunderoverclub
2. Stop the dev server.
3. Run:
   npm run build
4. If the build succeeds:
   npm run dev
5. In a second PowerShell window:
   powershell -ExecutionPolicy Bypass -File .\run_analysis_day_preview.ps1

Optional historical date:
   powershell -ExecutionPolicy Bypass -File .\run_analysis_day_preview.ps1 2026-08-09
