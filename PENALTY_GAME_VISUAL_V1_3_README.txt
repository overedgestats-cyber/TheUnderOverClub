THE UNDER OVER CLUB — PENALTY GAME VISUAL V1.3

DESIGN DIRECTION
----------------
This version follows a classic browser penalty-game camera:
- player POV behind the ball
- large football in the foreground
- goal directly ahead
- goalkeeper standing centrally on the goal line
- crowd and advertising boards behind the goal
- green pitch filling the foreground
- five target zones inside the goal

Everything is rendered in the site's retro / 8-bit visual language.

INTERACTION
-----------
Click one of the five goal targets.
The ball immediately travels from the large foreground position toward that
target.
The server then returns GOAL or SAVED and the goalkeeper moves to its resolved
zone.

NO BACKEND CHANGES
------------------
No SQL.
No API changes.
No EXP changes.
No daily-limit changes.
No leaderboard changes.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_visual_v1_3.mjs
npm run build

If build passes:
vercel deploy --prod

Then hard-refresh /game.
