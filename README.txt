THE UNDER OVER CLUB — SEO GUIDES BATCH 2

This adds 10 more SEO guides, taking the site from 10 to 20 guides.

NEW GUIDES
11. How to Predict Over 2.5 Goals Using Statistics
12. Best Leagues for Over 2.5 Goals
13. What Does Over 1.5 Goals Mean?
14. What Does Over 3.5 Goals Mean?
15. BTTS Betting Strategy: What Statistics Matter?
16. BTTS and Over 2.5 Goals Explained
17. What Is xG in Football?
18. How to Calculate Fair Betting Odds
19. What Is Bookmaker Margin and Overround?
20. Football Betting Bankroll Management

NEW URLS
/guides/how-to-predict-over-2-5-goals
/guides/best-leagues-over-2-5-goals
/guides/over-1-5-goals
/guides/over-3-5-goals
/guides/btts-strategy
/guides/btts-over-2-5
/guides/xg-expected-goals
/guides/fair-betting-odds
/guides/bookmaker-margin-overround
/guides/bankroll-management

REPLACE
src/lib/guides/articles.ts
src/app/guides/page.tsx

IMPORTANT
You do NOT need to edit sitemap.ts.
Your sitemap already builds guide URLs from guideArticles, so these 10 new pages
will automatically appear in /sitemap.xml after deployment.

The Guides hub now calculates:
- total guides automatically
- category guide counts automatically

INSTALL
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build

If successful:
git add .
git commit -m "Add 10 more SEO football guides"
git push origin main

If GitHub still returns the remote error:
npx vercel --prod

AFTER DEPLOYMENT
Check:
https://www.theunderoverclub.com/guides
https://www.theunderoverclub.com/sitemap.xml

Then request indexing in Search Console for the strongest new pages first:
1. /guides/how-to-predict-over-2-5-goals
2. /guides/best-leagues-over-2-5-goals
3. /guides/xg-expected-goals
4. /guides/btts-strategy
5. /guides/fair-betting-odds
