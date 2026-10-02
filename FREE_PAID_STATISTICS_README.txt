THE UNDER OVER CLUB — FREE + PAID PUBLIC STATISTICS

NO SQL MIGRATION REQUIRED.

PUBLIC ENDPOINTS
----------------
GET /api/statistics/free
GET /api/statistics/paid
GET /api/statistics/overview

BACKWARD COMPATIBILITY
----------------------
GET /api/statistics/official

still returns paid official statistics, so existing code does not break.

FREE PICKS
----------
Reads recommendations where:
access_tier = 'free'

This keeps the free performance record separate.

PAID PICKS
----------
Reads recommendations where:
access_tier = 'paid'

This keeps official paid performance separate from free picks.

OVERVIEW
--------
Returns:
- combined summary
- free summary
- paid summary
- combined monthly history

The public Statistics page can therefore offer:

ALL | FREE PICKS | PAID PICKS

without mixing the underlying free and paid records.

IMPORTANT
---------
The internal model-tracking endpoint remains separate:

GET /api/admin/statistics/model

market_analysis_snapshots must not be mixed into the public customer-facing
win rate, ROI, units profit or total-pick counts.

INSTALL
-------
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub

2. Stop dev server.

3. Run:
   npm run build

4. If successful:
   npm run dev

5. In another PowerShell:
   powershell -ExecutionPolicy Bypass -File .\run_public_statistics_preview.ps1

CURRENT EXPECTED STATE
----------------------
If no genuine free or paid recommendations have been committed yet,
both sections will correctly show zeros and empty month histories.
