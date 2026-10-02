THE UNDER OVER CLUB — TODAY / FREE PICKS PAGE V1

ROUTES
------
/today
/free-picks -> redirects to /today

PUBLIC API
----------
GET /api/free-picks

Optional exact date:
GET /api/free-picks?date=2026-08-12

DATA SOURCE
-----------
The page NEVER runs the model.

It only reads already-published rows from:
public.free_pick_publications

This protects the immutable daily slate.

DATE BEHAVIOR
-------------
If today's Free Picks exist:
- /today shows today's published slate.

If today has no published picks but a future slate exists:
- /today shows the nearest future published slate as "Next Free Picks".

This is useful when tomorrow's picks are published the evening before.

DISPLAY
-------
Each card shows:
- rank
- competition
- home / away
- Sofia kickoff time
- O/U 2.5 selection
- model probability
- confidence
- captured odds if available
- pending / win / loss / void
- final score after settlement

If odds are not yet captured:
- card shows "—"
- footer says "Odds pending"

No fake odds or results are inserted.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build

If successful:
npm run dev

Open:
http://localhost:3000/today

No SQL migration is required.
