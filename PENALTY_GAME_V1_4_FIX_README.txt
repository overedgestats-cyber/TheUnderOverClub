THE UNDER OVER CLUB — PENALTY GAME V1.4 FIX

ROOT CAUSE OF SHOT FAILURE
--------------------------
The screenshot error:
  column reference "lifetime_goals" is ambiguous

comes from the PostgreSQL RPC function, not from the browser animation.
Because the RPC transaction fails:
- no attempt is inserted,
- EXP is not updated,
- attempts do not decrease,
- the server never returns a keeper result,
- therefore the keeper cannot animate.

The included SQL replaces the RPC with explicitly-qualified table aliases.

VISUAL REDESIGN
---------------
The game layout is also rebuilt:
- compact header instead of oversized hero
- no large white/empty area beside the game
- controlled two-column layout
- player POV from behind the ball
- goal directly ahead
- keeper's boots sit on the goal line
- crowd + ad boards behind goal
- large foreground ball
- five clickable goal targets
- game and leaderboard stay inside the site's content width
- responsive side cards

INSTALL
-------
1. Extract into:
C:\Users\Marty\Desktop\theunderoverclub

2. Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_v1_4_fix.mjs

3. Copy the SQL patch to clipboard:
Get-Content .\supabase\penalty_game_v1_4_rpc_fix.sql -Raw | Set-Clipboard

4. Paste it into Supabase SQL Editor and click Run.

5. Build:
npm run build

6. Deploy if build passes:
vercel deploy --prod

TEST
----
After deployment hard-refresh /game.

Take ONE shot.

Expected:
- ball moves immediately to selected target
- server returns result
- keeper moves to resolved zone
- GOAL or SAVED banner appears
- shots left decreases by 1
- attempt #1 becomes GOAL/SAVE
- refresh page: shot remains stored
- leaderboard / EXP update

Do not test multiple shots until the first one survives a refresh.
