THE UNDER OVER CLUB — PENALTY GAME V1

WHAT V1 INCLUDES
----------------
- /game authenticated page
- 8-bit penalty shootout UI
- 5 target zones:
  top left, top right, centre, bottom left, bottom right
- 5 daily attempts for free members
- 7 daily attempts for active recurring subscribers and admin
- Daily reset based on Europe/Sofia date
- Server-side 27% save / 73% goal resolution
- If saved, goalkeeper goes to the same zone
- If goal, goalkeeper goes to a different zone
- Goal: +4 EXP
- Save: -2 EXP
- Monthly EXP cannot fall below 0
- Lifetime EXP cannot fall below 0
- Monthly leaderboard sorted by EXP, then goals
- Monthly prize display:
  1st: free Premium month
  2nd: free Premium week
  3rd: +100 EXP
- Attempt history for the current day
- Server-side anti-cheat / concurrency protection via PostgreSQL advisory lock
- Game navigation entry on desktop and mobile
- No cash value / no effect on football-pick selection

NOT IN V1
---------
- €0.99 +5 shot pack
- automatic prize entitlement granting
These belong in Game v2 after the core game is proven.

IMPORTANT RULE ABOUT DAILY PASS
-------------------------------
Daily Pass unlocks Paid Picks but is not treated as a recurring Premium
subscription for the 7-shot game allowance. Daily Pass users receive 5 shots.
Active recurring subscribers and admin receive 7.

INSTALL
-------
1. Extract the ZIP into:

C:\Users\Marty\Desktop\theunderoverclub

2. Run:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_v1.mjs

3. BEFORE deploying, open Supabase -> SQL Editor and run the complete file:

supabase\penalty_game_v1.sql

4. Then run:

npm run build

5. If build passes:

vercel deploy --prod

VERIFY
------
- Sign in.
- Open /game.
- Free account should show 5 daily attempts.
- Active recurring subscriber/admin should show 7.
- Take one shot.
- Result appears immediately.
- Refresh page: the attempt remains stored.
- Monthly EXP/goals and leaderboard update.
- Rapid concurrent calls cannot exceed the daily allowance.

SECURITY
--------
The browser never decides whether a shot is a goal.
The POST /api/game/shoot route generates the result server-side.
Database RPC serialises attempts for each user/day and enforces the daily limit.

SQL tables have RLS enabled with no public policies. The app's server-side
Supabase service-role client is the intended access path.
