THE UNDER OVER CLUB — PENALTY GAME FINAL VISUAL V1.6

WHY THIS VERSION IS DIFFERENT
-----------------------------
Previous versions tried to recreate the entire stadium and pitch using CSS
rectangles and gradients. That is why the live game looked flatter than the
approved preview.

V1.6 replaces the playing-scene background with a dedicated pixel-art SVG
asset. The dynamic gameplay remains normal HTML on top of it.

STATIC ART LAYER
----------------
- night stadium
- floodlights
- crowd
- supporter banners
- STATS.GOALS.PROFIT.
- THE UNDER OVER CLUB
- pitch-side boards
- perspective football pitch
- correctly proportioned goal
- goal net
- penalty-area perspective

DYNAMIC LAYER
-------------
- 5 clickable target zones
- goalkeeper
- goalkeeper dives
- football
- football shot animation
- GOAL / SAVED result
- real daily attempts
- real EXP
- real monthly stats
- real leaderboard
- real prizes UI

There are NO fake stats baked into the stadium artwork.

BACKEND
-------
No SQL change.
No API change.
No storage change.
No EXP change.
No daily-limit change.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_final_visual_v1_6.mjs
npm run build

If build passes:
vercel deploy --prod

Then hard refresh /game.
