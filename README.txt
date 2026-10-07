THE UNDER OVER CLUB — COMPLETE-SEASON LEAGUE STATS V2

This replaces the first League Stats calculation.

WHAT WAS WRONG
The first version used only fixtures already stored in Supabase. Because your
daily importer did not contain every earlier match in the 2026/27 season,
"Matches" could show incomplete numbers such as 20 or 23.

WHAT THIS VERSION DOES
- Uses API-Football's full current-season fixture list.
- Fetches completed fixtures only.
- Exactly 10 major European top-flight leagues are analysed:
  Premier League
  Bundesliga
  Eredivisie
  La Liga
  Serie A
  Ligue 1
  Primeira Liga
  Belgian Pro League
  Swiss Super League
  Süper Lig
- Sorts those 10 leagues by Over 2.5 percentage.
- Shows:
  Over 2.5 %
  Under 2.5 %
  BTTS %
  Average goals
  Full-season completed matches
- Caches the full result for 12 hours.
- Only 10 API requests are needed per cache refresh.
- No Supabase migration and no manual backfill command required.

IMPORTANT
"Matches" now means ALL completed current-season matches returned by
API-Football for that league, not just matches previously imported by your site.

REPLACE THESE FILES
src/lib/seo-stats/over25-leagues.ts
src/app/stats/over-2-5-leagues/page.tsx
src/app/stats/over-2-5-leagues/page.module.css

INSTALL
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build

Test:
npm run dev

Open:
http://localhost:3000/stats/over-2-5-leagues

The first uncached page load can take a few seconds because it is collecting
10 full-season league datasets. After that, the result is cached for 12 hours.

DEPLOY
git add .
git commit -m "Use complete season data for league stats"
git push origin main

If GitHub errors:
npx vercel --prod
