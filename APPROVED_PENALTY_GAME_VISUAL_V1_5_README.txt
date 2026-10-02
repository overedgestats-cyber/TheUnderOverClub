THE UNDER OVER CLUB — APPROVED PENALTY GAME VISUAL V1.5

This package implements the approved preview direction.

KEY VISUALS
-----------
- classic penalty-game camera from behind the ball
- large ball in the foreground
- goal directly ahead
- goalkeeper standing on the goal line
- stadium crowd around and behind the goal
- floodlights
- retro advertising boards
- top banners:
  FOOTBALL BANNERS
  STATS.GOALS.PROFIT.
  THE UNDER OVER CLUB
- pitch-side football banners
- dark arcade HUD
- right-side YOUR MONTH / SCORING / MONTHLY PRIZES rail
- GOAL / SAVED result bar
- daily attempt history
- leaderboard below

IMPORTANT
---------
The game still has the product's real 5 shot zones:
top left, top right, centre, bottom left, bottom right.

The image preview contained extra visual subdivisions, but this implementation
keeps the actual five-zone game logic unchanged.

NO BACKEND CHANGES
------------------
- no SQL
- no API changes
- no daily-limit changes
- no EXP changes
- no leaderboard changes
- no Stripe changes

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_penalty_game_approved_visual_v1_5.mjs
npm run build

If build passes:
vercel deploy --prod

Then hard refresh /game.
