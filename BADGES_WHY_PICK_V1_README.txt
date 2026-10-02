THE UNDER OVER CLUB — TEAM BADGES + WHY THIS PICK V1

WHAT THIS PACKAGE DOES
----------------------
1. Shows real API-Football team badges on Free Picks.
2. Shows real API-Football team badges on Paid Picks.
3. Adds a visible WHY THIS PICK? analysis panel under every Free Pick.
4. Adds a visible WHY THIS PICK? analysis panel under every Paid Pick.
5. Clearly separates:
   - MODEL PROBABILITY
   - CONFIDENCE
   - FAIR MARKET PROBABILITY
   - VALUE EDGE
   - DATA QUALITY
6. Keeps the existing current-rule 1X2 read-time safety filter.

FREE PICKS
----------
Existing published Free Pick rows already reference the fixture row, so badges
are read from fixtures.home_team_logo_url / away_team_logo_url. No historical
publication is modified.

The explanation uses immutable publication facts:
- model probability
- confidence
- rank in the two-pick slate
- publication odds
- whether odds influenced selection

It does NOT invent team-form claims when the exact metric is not exposed.

PAID PICKS
----------
Paid recommendations already contain frozen analysis_snapshot JSON. The public
reader exposes expected-goals total when available and combines it with:
- model probability
- fair bookmaker probability
- value edge
- confidence
- data quality

Confidence is explicitly described as a model/data-consistency metric, not the
predicted probability of the bet winning.

DATABASE
--------
No SQL migration.
No stored pick is rewritten.
No immutable publication is changed.
No settlement logic is changed.
No Free Pick selection logic is changed.
No Paid Pick model logic is changed.

INSTALL
-------
Extract the ZIP into:

C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_badges_why_pick_v1.mjs
npm run build

If build passes:

vercel deploy --prod

VERIFY
------
After deployment:
- /today shows real club badges where API-Football has them.
- /paid-picks shows real club badges.
- every displayed pick has a WHY THIS PICK? panel.
- Coventry @ 15.00 remains hidden if it violates the current 1X2 safety rules.
- no fake values are displayed.


V1.1 INSTALLER FIX
------------------
The installer payload files now use .payload extensions and the installer
automatically removes its payload folder after copying the real files.
This prevents Next.js/TypeScript from compiling installer staging files.
