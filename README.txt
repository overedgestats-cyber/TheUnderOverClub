THE UNDER OVER CLUB — LIVE OVER 2.5 LEAGUE SEO PAGE

NEW LIVE PAGE
https://www.theunderoverclub.com/stats/over-2-5-leagues

WHAT IT DOES
- Reads completed current-season fixtures already stored in your Supabase "fixtures" table.
- Does NOT make fresh API-Football calls on every page view.
- Ranks tracked European leagues by Over 2.5 percentage.
- Shows:
  - completed matches
  - Over 2.5 %
  - Under 2.5 %
  - average total goals
  - BTTS %
  - average home goals
  - average away goals
- Minimum 5 completed matches before a league is displayed.
- Cached for 12 hours.
- Automatically rolls the European season label each July.
- Includes Dataset + ItemList structured data for SEO.
- Added to sitemap.xml with daily change frequency.
- Existing "Best Leagues for Over 2.5 Goals" guide now links to the live page.

FILES
NEW:
src/lib/seo-stats/over25-leagues.ts
src/app/stats/over-2-5-leagues/page.tsx
src/app/stats/over-2-5-leagues/page.module.css

REPLACE:
src/app/sitemap.ts
src/app/guides/[slug]/page.tsx

NO DATABASE MIGRATION IS REQUIRED.
NO NEW ENVIRONMENT VARIABLES ARE REQUIRED.

IMPORTANT
The live ranking depends on your existing daily fixture import. If a league has
not been imported into the fixtures table, it simply will not appear rather than
showing fake data.

INSTALL
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub
2. Allow Windows to merge/replace files.
3. Run:
   npm run build
4. Then:
   npm run dev
5. Open:
   http://localhost:3000/stats/over-2-5-leagues

DEPLOY
git add .
git commit -m "Add live Over 2.5 league statistics page"
git push origin main

If GitHub still gives the remote error:
npx vercel --prod

AFTER DEPLOYMENT
1. Open:
   https://www.theunderoverclub.com/stats/over-2-5-leagues
2. Confirm the table has real league data.
3. Open:
   https://www.theunderoverclub.com/sitemap.xml
4. In Google Search Console request indexing for:
   https://www.theunderoverclub.com/stats/over-2-5-leagues
