THE UNDER OVER CLUB — SEO + SOCIAL SHARING V1

No /public directory is required.

This package uses native Next.js App Router metadata files.

Adds / updates
--------------
src/app/layout.tsx
src/app/icon.svg
src/app/opengraph-image.tsx
src/app/robots.ts
src/app/sitemap.ts
src/app/manifest.ts

Route-specific metadata:
src/app/today/layout.tsx
src/app/statistics/layout.tsx
src/app/subscription/layout.tsx
src/app/paid-picks/layout.tsx
src/app/account/layout.tsx

What it provides
----------------
- canonical https://theunderoverclub.com
- improved site title and description
- Facebook/Open Graph metadata
- X/Twitter large image metadata
- generated 1200x630 branded social-sharing image
- UO browser favicon
- robots.txt
- sitemap.xml
- web manifest
- public-page SEO metadata
- noindex for /paid-picks and /account

Install
-------
Extract the ZIP directly into:

C:\Users\Marty\Desktop\theunderoverclub

Allow it to overwrite src/app/layout.tsx.

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
npm run build

If build passes:
npm run dev

Verify locally:
http://localhost:3000/icon.svg
http://localhost:3000/opengraph-image
http://localhost:3000/robots.txt
http://localhost:3000/sitemap.xml
http://localhost:3000/manifest.webmanifest

Then:
vercel deploy --prod

After production deployment verify:
https://theunderoverclub.com/opengraph-image
https://theunderoverclub.com/robots.txt
https://theunderoverclub.com/sitemap.xml

NOTE
----
Facebook and other social platforms may cache an older preview for a URL.
After deployment, use the platform's sharing/debug tool to request a fresh
scrape if an old preview remains cached.
