THE UNDER OVER CLUB — REMOVE HOME PERFORMANCE STRIP

This removes the four-stat row under the hero on the Home page only:
- Win Rate
- Units Profit
- Total Picks
- ROI

It does not change:
- the top global HUD
- Statistics page
- picks
- settlement logic

Replace:
src/app/page.tsx

Then run:
npm run build

If successful:
git add .
git commit -m "Remove home performance strip"
git push origin main
