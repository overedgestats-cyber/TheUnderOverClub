THE UNDER OVER CLUB — PRE-KICKOFF STORAGE GUARD V3

This replaces only the existing ensurePreKickoff() implementation.

Why v3
------
The v2 installer was too strict when searching for the exact
getPublishedBoard(date) formatting. It stopped before writing any file.

v3 does not touch getPublishedBoard() at all.

Behavior
--------
When storePaidAnalysis() calls:

ensurePreKickoff(fixtures)

the function now:

- keeps only fixtures whose kickoff is still in the future
- skips already-started fixtures
- skips malformed/invalid kickoff timestamps conservatively
- logs skipped fixtures
- mutates the existing fixtures array in place so all downstream storage
  automatically processes only valid pre-kickoff fixtures
- still refuses the operation when EVERY fixture has already started

This preserves the look-ahead-bias protection.

Important
---------
Do NOT retroactively commit an old day's analysis after matches have started.
Use this guard for future morning publication cycles.

Install
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:

powershell -ExecutionPolicy Bypass -File .\apply_pre_kickoff_storage_guard_v3.ps1
npm run build

No SQL changes.
No model changes.
No qualification-threshold changes.
