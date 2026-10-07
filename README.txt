THE UNDER OVER CLUB — STATS MOBILE V2

This is the corrected phone layout for the Statistics page.

WHY THE PREVIOUS VERSION LOOKED WRONG
The 2-column KPI layout was still too wide on your iPhone viewport. It caused the
right column and the PAID PICKS tab to extend beyond the screen.

THIS VERSION
- Makes FREE PICKS / PAID PICKS exactly 50/50 across the screen.
- Uses one compact KPI row per metric instead of two wide cards.
- Each KPI row is only about 68px tall, so the page does not become huge.
- Stops ROI / Units / Picks cards from clipping off the right side.
- Keeps market/month tables swipeable horizontally.
- Keeps the global HUD hidden on phones.
- Desktop remains unchanged.

REPLACE
src/components/statistics/StatisticsDashboard.module.css
src/app/mobile-stats-fix.css

Then:
npm run build

Deploy:
git add .
git commit -m "Fix statistics mobile layout v2"
git push origin main

Or if GitHub still errors:
npx vercel --prod
