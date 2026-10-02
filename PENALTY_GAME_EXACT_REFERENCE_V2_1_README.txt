THE UNDER OVER CLUB — PENALTY GAME EXACT REFERENCE V2.1

This is a small visual correction on top of v2.0.

FIXED
-----
1. Goalkeeper:
   - standing keeper moved down so his boots sit on the goal line
   - bottom-left / bottom-right dives also finish on the line
   - top dives start from a slightly lower position

2. Directions:
   - TOP LEFT
   - TOP RIGHT
   - CENTRE
   - BOTTOM LEFT
   - BOTTOM RIGHT

The labels are now live HTML overlays, so they remain visible even when the
reference artwork scales differently on another screen.

UNCHANGED
---------
- exact approved stadium/goal picture
- shot storage
- server-side result
- EXP
- daily limits
- leaderboard
- prizes
- Supabase
- API routes

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_exact_reference_v2_1.mjs
npm run build

If build passes:
vercel deploy --prod

Then hard-refresh /game.

No SQL.
