THE UNDER OVER CLUB — PENALTY GAME VISUAL / INTERACTION V1.2

FIXES
-----
1. Goalkeeper standing position is moved onto the goal line.
2. Goal net, keeper and ball have pointer-events disabled so they cannot block
   clicks on the five shot zones.
3. Shot zones are explicitly high-z-index clickable buttons.
4. The ball reacts immediately after a target is clicked, before the server
   response arrives.
5. "SHOT IN PROGRESS..." is shown during the request.
6. API failures are displayed in a large red error panel instead of appearing
   as if nothing happened.
7. The pitch/goal proportions are tightened to look more like a penalty area.
8. Removes the duplicate decorative football at the penalty spot.
9. Forces readable light text in the game section to override conflicting
   global CSS.

NO BACKEND CHANGE
-----------------
No SQL.
No API logic change.
No EXP rule change.
No daily-limit change.
No leaderboard change.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_visual_v1_2.mjs
npm run build

If build passes:
vercel deploy --prod

TEST
----
Hard refresh /game.
Hover over a shot zone.
Click it.
The ball must react immediately.
Then either GOAL or SAVED must appear.
If the server fails, the exact server/API error will be visible in red.
