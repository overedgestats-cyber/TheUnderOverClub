THE UNDER OVER CLUB — SEO GUIDES PACKAGE

WHAT THIS ADDS
- /guides hub page
- 10 indexable SEO article URLs:
  /guides/over-2-5-goals
  /guides/under-2-5-goals
  /guides/btts-betting
  /guides/football-betting-tips
  /guides/value-betting
  /guides/betting-odds
  /guides/implied-probability
  /guides/double-chance
  /guides/1x2-betting
  /guides/betting-roi
- Unique metadata for every article
- Article structured data
- Breadcrumb structured data
- Internal links to Free Picks, Statistics and Membership
- Updated sitemap.xml
- Updated robots.txt
- GUIDES item in desktop navigation

HOW TO INSTALL
1. Unzip this package.
2. Copy the included src folder into your project root.
3. Allow Windows to MERGE folders and REPLACE files when asked.
4. These files are NEW:
   src/lib/guides/articles.ts
   src/app/guides/page.tsx
   src/app/guides/page.module.css
   src/app/guides/[slug]/page.tsx
   src/app/guides/[slug]/page.module.css
5. These files REPLACE existing files:
   src/app/sitemap.ts
   src/app/robots.ts
   src/components/retro/RetroNavigation.tsx
6. Run:
   npm run build
7. If build succeeds, deploy/push as normal.

AFTER DEPLOYMENT
Open:
https://www.theunderoverclub.com/guides
https://www.theunderoverclub.com/sitemap.xml

Then in Google Search Console:
- Submit/resubmit sitemap.xml
- Inspect /guides and request indexing
- Inspect the first few article URLs and request indexing

NOTE
The mobile bottom navigation is intentionally unchanged so it stays compact. GUIDES appears in the desktop/sidebar navigation and is reachable through internal links.
