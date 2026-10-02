THE UNDER OVER CLUB — GLOBAL SHELL + GAME V2.2

THIS PACKAGE FIXES TWO THINGS

1. PENALTY DIRECTIONS
The v2.1 HTML labels were sitting on top of the labels already present in the
approved exact artwork. That produced doubled / clipped words.

V2.2 removes the duplicate HTML text. The exact artwork supplies:
- TOP LEFT
- CENTRE
- TOP RIGHT
- BOTTOM LEFT
- BOTTOM RIGHT

The transparent buttons remain clickable above the artwork.

The goalkeeper-on-goal-line correction from v2.1 is kept.

2. GLOBAL SITE SHELL
The existing RetroShell is promoted to the ROOT Next.js layout. Therefore the
same left navigation and top statistics HUD apply across the application,
including /game.

The shell continues to use the existing live database statistics and real
membership entitlement. No screenshot numbers are hard-coded.

Navigation:
HOME
FREE PICKS
PAID PICKS
STATS
GAME
MEMBERSHIP
ACCOUNT

The top HUD keeps:
WIN RATE
UNITS PROFIT
TOTAL PICKS
ROI
STATUS
Clerk avatar

V2.2 adds an explicit:
LOG OUT

The sidebar and HUD are sticky on desktop.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_global_shell_game_v2_2.mjs
npm run build

If build passes:

vercel deploy --prod

Then hard-refresh:
/
 /today
 /paid-picks
 /statistics
 /game
 /subscription
 /account

No SQL.
No secret changes.
No game-rule changes.
