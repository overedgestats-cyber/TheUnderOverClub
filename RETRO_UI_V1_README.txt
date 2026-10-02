THE UNDER OVER CLUB — RETRO UI V1

This package rebuilds the main frontend around the 8-bit / retro football-game
reference while preserving the existing live product logic.

ROUTES RESTYLED
---------------
/
 /today
 /paid-picks
 /statistics
 /subscription
 /account

SHARED RETRO SYSTEM
-------------------
- actual Under Over Club pixel logo in the sidebar
- persistent desktop game sidebar
- live top HUD
- pixel-stadium page headers
- hard pixel borders and shadows
- arcade green / red / yellow / blue / purple accents
- mobile bottom navigation
- retro market cards, tables, progress bars and membership cards
- matching legal-page styling
- logo-based favicon
- logo-based 1200x630 social preview image

LIVE DATA ONLY
--------------
The reference images contain demo values and demo football matches. They are
NOT copied into the live product.

The redesign does NOT hard-code fake:
- win rate
- ROI
- units profit
- matches
- paid recommendations
- subscription status
- XP / player level

The HUD reads the existing combined statistics backend.

Free Picks continue to use the existing Free Picks data.

Paid Picks remain protected by requirePaidPageAccess() and use the existing
published Paid Picks backend.

Subscription buttons keep the existing Stripe checkout action.

Account keeps the existing Clerk + entitlement logic.

INSTALL
-------
Extract this ZIP directly into:

C:\Users\Marty\Desktop\theunderoverclub

It will create:
install_retro_ui_v1.ps1
_retro_ui_v1\...

Then run:

cd C:\Users\Marty\Desktop\theunderoverclub

powershell -ExecutionPolicy Bypass -File .\install_retro_ui_v1.ps1

npm run build

IF BUILD PASSES
---------------
npm run dev

Test locally:

http://localhost:3000/
http://localhost:3000/today
http://localhost:3000/paid-picks
http://localhost:3000/statistics
http://localhost:3000/subscription
http://localhost:3000/account

Also test mobile around 375-430px width.

Only after local review:

vercel deploy --prod

BACKUPS
-------
Existing files are backed up beside the originals as:

.before-retro-ui-v1.bak

No SQL changes.
No API-Football changes.
No model changes.
No Stripe configuration changes.
No Clerk permission changes.
