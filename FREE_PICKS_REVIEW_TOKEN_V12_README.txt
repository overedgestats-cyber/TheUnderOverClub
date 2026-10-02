FREE PICKS REVIEW TOKEN V1.2

PROBLEM FIXED
-------------
The model uses live API-Football history. Re-running the model a few seconds
later can produce a different candidate set when upstream data changes.

The previous fingerprint version correctly blocked that, but it also meant a
reviewed slate could be impossible to publish if the live inputs kept moving.

NEW BEHAVIOR
------------
DRY RUN / REVIEW:
- runs the model once
- produces the two exact picks
- packages the complete immutable publication rows into a signed review token
- the token is HMAC signed server-side
- the local PowerShell script saves the token

COMMIT:
- DOES NOT RERUN THE MODEL
- verifies the server signature on the reviewed token
- verifies the token date
- validates the two rows
- checks both fixtures are still pre-kickoff using the database
- inserts the exact reviewed selections
- uniqueness + immutable DB protections still apply

This means the exact picks the user reviews are the exact picks that are stored.

SECURITY
--------
Signing uses:
FREE_PICKS_SIGNING_SECRET

If that variable is not set, it securely falls back to:
INTERNAL_API_SECRET

No secret is printed into the PowerShell output or review file.

NO SQL MIGRATION REQUIRED.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:
npm run build
npm run dev

REVIEW
------
powershell -ExecutionPolicy Bypass -File .\run_publish_free_picks.ps1 -Date 2026-08-11

Review the exact two picks shown.

COMMIT
------
powershell -ExecutionPolicy Bypass -File .\run_publish_free_picks.ps1 -Date 2026-08-11 -Commit

The commit uses the exact signed reviewed slate and does not recompute it.
