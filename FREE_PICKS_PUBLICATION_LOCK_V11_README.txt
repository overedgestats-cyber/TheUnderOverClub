FREE PICKS PUBLICATION LOCK V1.1

WHY THIS PATCH EXISTS
---------------------
The Free Picks model reads live API-Football history.

Before publication, recent match completion or a transient upstream response can
change the analyzed candidate set. That means two separate preview calls can
occasionally produce different candidates or probabilities.

That is acceptable before publication, but an immutable slate must never commit
a different selection than the one that was reviewed.

THIS PATCH ADDS A FINGERPRINT LOCK
----------------------------------
Dry run:
- calculates the current two-pick slate
- prints both team names, selections, model probability and confidence
- calculates a SHA-256 fingerprint of the exact reviewed slate
- saves the reviewed dry run locally

Commit:
- recalculates the live slate
- requires the exact dry-run fingerprint
- if anything changed, commit is BLOCKED
- user must review a fresh dry run
- if fingerprint is identical, the exact reviewed slate is written

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

COMMIT ONLY AFTER REVIEW
------------------------
powershell -ExecutionPolicy Bypass -File .\run_publish_free_picks.ps1 -Date 2026-08-11 -Commit

If the model changed between review and commit, the commit will refuse to write.
