THE UNDER OVER CLUB — ADMIN / SUPER USER V1

WHAT THIS DOES
--------------
A Clerk user ID listed in ADMIN_CLERK_USER_IDS receives permanent Paid Picks access.

Admin access is enforced server-side in the same entitlement function used by:
- /paid-picks
- /api/paid-picks
- /api/paid-board

An admin does not need a Daily Pass or paid subscription.

ACCOUNT PAGE
------------
Admin account displays:
MEMBERSHIP: ADMIN
ROLE: SUPER USER
PAID PICKS ACCESS: ALWAYS ON

SECURITY
--------
Use Clerk USER IDs, not email addresses.

Example:
ADMIN_CLERK_USER_IDS=user_abc123

Multiple admins:
ADMIN_CLERK_USER_IDS=user_abc123,user_def456

HOW TO FIND YOUR CLERK USER ID
------------------------------
Clerk Dashboard
→ Production instance
→ Users
→ open your user
→ copy User ID beginning with user_

LOCAL
-----
Add to .env.local:
ADMIN_CLERK_USER_IDS=user_YOUR_ID

Restart:
npm run dev

PRODUCTION
----------
Add the same environment variable to Vercel Production:
ADMIN_CLERK_USER_IDS=user_YOUR_ID

Then redeploy:
vercel deploy --prod

No SQL migration is required.
