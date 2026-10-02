THE UNDER OVER CLUB — PENALTY GAME EXACT REFERENCE V2.0

This package stops redrawing the approved game concept from scratch.

Instead, it uses the exact approved generated scene as the stadium / goal /
pitch artwork, with the baked-in goalkeeper and football removed so the real
interactive keeper and football can animate on top.

STATIC ART LAYER
----------------
- exact approved stadium style
- correct real football goal
- net depth
- correct pitch perspective
- crowd
- floodlights
- FOOTBALL BANNERS
- STATS.GOALS.PROFIT.
- THE UNDER OVER CLUB
- target graphics

LIVE DYNAMIC LAYER
------------------
- 5 clickable target zones
- goalkeeper movement
- ball movement
- real server result
- attempts
- EXP
- monthly stats
- monthly leaderboard
- prizes
- Sofia clock

No fake production stats are baked into the live UI.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_exact_reference_v2_0.mjs
npm run build

If build passes:
vercel deploy --prod

Then hard-refresh /game.

No SQL.
No backend changes.
