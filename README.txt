THE UNDER OVER CLUB — LEAGUE STATS INTERACTIVE TOGGLE V3

Adds an interactive market switcher to the live league statistics page.

BUTTONS
OVER 2.5 | UNDER 2.5 | BTTS

BEHAVIOUR
- Default ranking is Over 2.5.
- Selecting Under 2.5 instantly re-ranks all 10 leagues by Under 2.5 %.
- Selecting BTTS instantly re-ranks all 10 leagues by BTTS %.
- The top 3 cards update at the same time.
- The full table ranking updates.
- No page reload.
- No additional API-Football request.
- The existing 12-hour server cache remains unchanged.
- All three percentages remain visible in the cards/table for context.

FILES
NEW:
src/app/stats/over-2-5-leagues/LeagueMarketRanking.tsx

REPLACE:
src/app/stats/over-2-5-leagues/page.tsx
src/app/stats/over-2-5-leagues/page.module.css

INSTALL
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build
npm run dev

Test:
http://localhost:3000/stats/over-2-5-leagues

Click:
OVER 2.5
UNDER 2.5
BTTS

DEPLOY
git add .
git commit -m "Add league stats market ranking toggle"
git push origin main

If GitHub errors:
npx vercel --prod
