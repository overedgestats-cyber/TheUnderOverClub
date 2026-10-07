THE UNDER OVER CLUB — RETRO HERO REPLACEMENT

This replaces the current generated stadium hero with the supplied Euro Arcade Bowl image everywhere the RetroHero component is used.

FILES:
1. NEW:
   public/brand/euro-arcade-bowl.jpg

2. REPLACE:
   src/components/retro/RetroHero.tsx
   src/components/retro/RetroHero.module.css

INSTALL:
- Extract this ZIP into:
  C:\Users\Marty\Desktop\theunderoverclub
- Allow Windows to merge folders and replace the two component files.
- Then run:
  npm run build
- If successful:
  git add .
  git commit -m "Replace site hero with Euro Arcade Bowl artwork"
  git push origin main

NOTE:
The existing page heading/title text is still kept in the HTML for SEO and accessibility, but hidden visually so it does not overlap the artwork.
