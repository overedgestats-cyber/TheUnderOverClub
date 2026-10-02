THE UNDER OVER CLUB — PENALTY GAME VISUAL V1.1

WHY
---
Game v1 was technically functional, but the playing area looked like a generic
green panel with a rectangle rather than a recognizable football penalty scene.

V1.1 REDESIGNS THE PLAYING AREA
-------------------------------
- Real green striped football pitch
- White touch lines
- Penalty area
- Six-yard box
- Penalty arc
- Penalty spot
- Stadium stands
- Floodlights
- Advertising board
- Proper white goal frame
- Visible goal depth/shadow
- Football net pattern
- Goalkeeper standing on/near the goal line
- Football shown at the penalty spot
- Five target zones remain inside the goal
- Existing shot/keeper animation still works
- Better dark-theme text contrast

NO BACKEND CHANGES
------------------
- no SQL
- no API changes
- no EXP changes
- no daily-limit changes
- no leaderboard changes

INSTALL
-------
Extract into:

C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_visual_v1_1.mjs
npm run build

If build passes:

vercel deploy --prod

Then hard refresh /game.
