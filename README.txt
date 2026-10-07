THE UNDER OVER CLUB — STATS MOBILE FIX

This fixes the mobile Stats page shown in your screenshot.

WHAT IT CHANGES
- Hides the large desktop HUD on phones (<=700px).
- Removes the huge empty black block at the top.
- Keeps the stadium hero directly below the top of the page.
- Keeps Free/Paid tabs full-width and easy to tap.
- Keeps the six Statistics KPI cards in a compact 2-column grid.
- Reduces KPI card height and font sizes on phones.
- Keeps tables horizontally scrollable rather than breaking the layout.
- Desktop remains unchanged.

FILES
1. REPLACE:
   src/app/globals.css
2. NEW:
   src/app/mobile-stats-fix.css

INSTALL
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build

If successful:
git add .
git commit -m "Fix mobile statistics layout"
git push origin main

If GitHub still errors:
npx vercel --prod
