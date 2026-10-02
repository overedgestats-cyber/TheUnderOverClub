THE UNDER OVER CLUB — PAID ANALYSIS PREVIEW

This package adds a non-persistent preview of the paid prediction model.

It does not write recommendations into the immutable published board.

Files:
- API-Football helpers for recent fixtures, head-to-head and odds
- 12-match team-form analysis
- home/away splits
- internal expected-goals estimate
- Poisson score model
- Over/Under 2.5 probabilities
- BTTS probabilities
- 1X2 probabilities
- Double Chance derived from 1X2
- non-Bet365 market-median odds
- confidence, bookmaker probability and value edge
- protected preview API route

Run:
1. Extract this ZIP into the project folder and replace client.ts.
2. Stop npm run dev.
3. Run npm run build.
4. Run npm run dev.
5. In a second PowerShell window:
   powershell -ExecutionPolicy Bypass -File .\run_analysis_preview.ps1

Optional exact API-Football fixture ID:
   powershell -ExecutionPolicy Bypass -File .\run_analysis_preview.ps1 1607587
