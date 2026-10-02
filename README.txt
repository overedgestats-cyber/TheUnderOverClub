THE UNDER OVER CLUB - ROI STATISTICS UPDATE

Replace these files in your project with the files from this package:

1. src/components/statistics/StatisticsDashboard.tsx
   - Removes ALL PICKS tab/view
   - Keeps FREE PICKS and PAID PICKS
   - Removes WIN RATE / WIN % everywhere in the Statistics dashboard
   - Makes ROI the first/main metric
   - Replaces WIN % table columns with SETTLED

2. src/components/retro/RetroShell.tsx
   - Removes WIN RATE from the global top HUD
   - Makes ROI the first HUD metric
   - Adds SETTLED PICKS instead

3. src/app/statistics/layout.tsx
   - Removes "Win Rate" from Statistics page SEO metadata
   - Focuses metadata on ROI and transparent results

No settlement logic, database records, or statistics calculations are changed.
