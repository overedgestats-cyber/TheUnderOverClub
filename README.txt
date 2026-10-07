THE UNDER OVER CLUB — MAKE LEAGUE STATS VISIBLE

This fixes the navigation issue.

CHANGES
1. Adds LEAGUE STATS directly under STATS in the desktop/sidebar navigation.
2. Adds a visible LEAGUE STATS shortcut on the /statistics page.
3. The shortcut shows O2.5 · U2.5 · BTTS.
4. Mobile bottom navigation remains at 6 items so it does not become overcrowded.
5. On mobile, the Statistics page shortcut becomes full-width.

FILES TO REPLACE
src/components/retro/RetroNavigation.tsx
src/components/statistics/StatisticsDashboard.tsx
src/components/statistics/StatisticsDashboard.module.css

INSTALL
Extract to:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build

Deploy:
git add .
git commit -m "Add League Stats navigation"
git push origin main

Or:
npx vercel --prod

AFTER DEPLOYMENT
You should see:
STATS
LEAGUE STATS
GUIDES

in the left sidebar.

And on /statistics you should see a LEAGUE STATS button next to/below the Free Picks / Paid Picks tabs.
