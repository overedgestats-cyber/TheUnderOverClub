THE UNDER OVER CLUB — COMPACT SHARED HERO

This keeps the current shared hero artwork but reduces its height so the page content appears much sooner.

REPLACE:
src/components/retro/RetroHero.module.css

NEW HEIGHTS:
Desktop: 340px
Tablet: 260px
Mobile: 210px

INSTALL:
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub
2. Replace the existing file.
3. Run:
   npm run build
4. If successful:
   git add .
   git commit -m "Reduce shared hero height"
   git push origin main

If GitHub still has a remote error, you can deploy directly with:
npx vercel --prod
