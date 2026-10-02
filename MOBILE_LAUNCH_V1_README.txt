THE UNDER OVER CLUB — MOBILE LAUNCH V1

WHAT IT CHANGES
---------------
- Keeps the existing desktop homepage unchanged.
- Hides desktop top navigation on phone-sized screens.
- Adds a fixed five-item mobile bottom navigation:
  HOME / FREE / PAID / STATS / ACCOUNT (or SIGN IN)
- Makes CTA buttons full width.
- Compresses the pixel stadium for mobile.
- Stacks Free Pick cards, statistics, paid membership and explainer sections.
- Reduces spacing and typography for 360–760 px screens.
- Adds bottom page padding so content is never hidden behind mobile navigation.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
powershell -ExecutionPolicy Bypass -File .\apply_mobile_launch_v1.ps1
npm run build

If build passes:
npm run dev

TEST
----
Chrome DevTools:
- iPhone SE / ~375 px
- iPhone 14/15 / ~390–430 px
- Android / ~412 px

Check:
- no horizontal scrolling
- hero title fits
- both CTA buttons are visible
- stadium does not dominate the first screen
- bottom nav never covers content
- Free Pick cards remain readable
- Paid Picks still redirects free users correctly

Then:
vercel deploy --prod

NO SQL CHANGES.
NO BACKEND CHANGES.
