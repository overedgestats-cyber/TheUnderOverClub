THE UNDER OVER CLUB — GUIDES + ABOUT RESTYLE

This package makes the About page, Guides hub and individual Guide article pages match the main retro dashboard style.

REPLACE THESE FILES:
src/app/about/page.tsx
src/app/about/page.module.css
src/app/guides/page.tsx
src/app/guides/page.module.css
src/app/guides/[slug]/page.tsx
src/app/guides/[slug]/page.module.css

WHAT CHANGES
- About uses the shared RetroHero and dashboard-style stat strip/panels.
- Guides uses the shared RetroHero and the same panel/card language as the rest of the site.
- Individual guide articles now use retro panel headers, numbered sections and HUD-style side cards.
- About copy focuses on ROI rather than win rate.
- SEO metadata and structured data remain intact.

INSTALL
1. Extract this ZIP into:
   C:\Users\Marty\Desktop\theunderoverclub
2. Allow Windows to merge folders and replace files.
3. Run:
   npm run build
4. If successful:
   git add .
   git commit -m "Restyle Guides and About pages"
   git push origin main

If you also installed the Euro Arcade Bowl RetroHero replacement, these pages will automatically use that new shared hero artwork too.
