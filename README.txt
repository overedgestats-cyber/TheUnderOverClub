THE UNDER OVER CLUB — CONVERSION + TRUST UPDATE

WHAT THIS ADDS

1. TODAY'S PICKS CONVERSION CTA
Directly under the free picks:
- "WANT THE FULL BOARD?"
- VIEW PAID PICKS
- VIEW STATISTICS

This gives visitors an obvious next step after seeing the two free picks.

2. REUSABLE TRUST STRIP
Shows:
- LIVE RESULTS
- ROI TRACKED
- EVERY PICK RECORDED
- NO DELETED LOSSES

Placed on:
- Home
- Today's Free Picks
- Membership

This keeps the transparency message visible on the highest-conversion public pages
without repeating it everywhere.

FILES

NEW:
src/components/retro/TrustStrip.tsx
src/components/retro/TrustStrip.module.css

REPLACE:
src/app/page.tsx
src/components/free-picks/TodayFreePicks.tsx
src/components/free-picks/TodayFreePicks.module.css
src/app/subscription/page.tsx

NO DATABASE OR API CHANGES.
NO PICK / SETTLEMENT LOGIC CHANGES.
NO STRIPE OR AUTH CHANGES.

INSTALL
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build
npm run dev

Check:
http://localhost:3000/
http://localhost:3000/today
http://localhost:3000/subscription

DEPLOY
git add .
git commit -m "Improve conversion and add trust strip"
git push origin main

If GitHub errors:
npx vercel --prod
