THE UNDER OVER CLUB — LAUNCH HOMEPAGE V1

FILES
-----
src/app/page.tsx
src/app/home.module.css

DATA
----
The homepage uses the existing live project functions:

getPublicFreePicks()
getCombinedStatistics()

No duplicate prediction logic is introduced.

The page:
- shows the real currently published Free Picks
- shows real combined performance statistics
- shows neutral zero/no-data states
- never fabricates historical performance
- never loads or leaks customer-only paid recommendations
- detects Clerk sign-in state server-side for SIGN IN vs ACCOUNT

MARKETING
---------
Static plan labels reflect the agreed live pricing:
Daily Pass €2.49
Weekly €6.99
Monthly €17.99
Yearly €119.99

PAID PICKS
----------
The homepage does NOT query the protected Paid Picks backend.
It only links to /paid-picks and /subscription.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then:

cd C:\Users\Marty\Desktop\theunderoverclub
npm run build

If the build succeeds:

npm run dev

Test:
http://localhost:3000/

Then deploy:
vercel deploy --prod

NO SQL CHANGES.
