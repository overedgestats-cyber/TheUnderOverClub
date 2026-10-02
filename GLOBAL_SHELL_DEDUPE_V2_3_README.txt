THE UNDER OVER CLUB — GLOBAL SHELL DEDUPE V2.3

PROBLEM
-------
The screenshot shows the shell twice:
- sidebar outside
- another sidebar inside
- top HUD outside
- another top HUD inside

CAUSE
-----
The previous patch correctly added RetroShell to src/app/layout.tsx, but the
application already had one or more page/layout-level RetroShell wrappers.
Therefore React rendered:

ROOT RETROSHELL
  -> EXISTING NESTED RETROSHELL
     -> PAGE

FIX
---
This installer:

1. Scans every .tsx file under src/app.
2. Removes RetroShell wrappers/imports from every app file EXCEPT the root
   src/app/layout.tsx.
3. Preserves the content that was inside each nested RetroShell.
4. Normalizes src/app/layout.tsx to exactly ONE RetroShell wrapper.
5. Verifies after patching that the only remaining RetroShell reference under
   src/app is:
   src/app/layout.tsx

RESULT
------
Every route gets:
- ONE left navigation
- ONE top statistics HUD
- ONE logout button
- normal page content

No duplicate shell.

NO OTHER CHANGES
----------------
No SQL.
No Supabase change.
No game logic change.
No pick model change.
No Stripe change.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_global_shell_dedupe_v2_3.mjs
npm run build

If build passes:

vercel deploy --prod

Then Ctrl+F5 on:
/
 /today
 /paid-picks
 /statistics
 /game
 /subscription
 /account
