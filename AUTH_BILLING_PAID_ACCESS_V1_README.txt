THE UNDER OVER CLUB — AUTH + BILLING + PAID ACCESS V1

SECURITY MODEL
--------------
Paid Picks are protected in two places:

1. /paid-picks
   Server Component calls requirePaidPageAccess() before paid data is loaded.

2. /api/paid-picks AND legacy /api/paid-board
   Route Handler calls requirePaidApiAccess() before paid data is returned.

Client-side hiding is NOT used as the security boundary.

ACCESS RULE
-----------
Allowed:
- active
- trialing

Denied:
- signed out
- no subscription
- incomplete
- incomplete_expired
- past_due
- unpaid
- canceled
- paused

We can add a grace-period policy later if desired.

DATABASE
--------
Run:
supabase/auth_billing_v1.sql

Creates server-only:
- customer_accounts
- customer_subscriptions

RLS is enabled and no public policies are created.

CLERK
-----
Adds:
- ClerkProvider in src/app/layout.tsx
- src/proxy.ts using clerkMiddleware()
- /sign-in
- /sign-up
- /account

For Next.js 16, Clerk currently uses proxy.ts rather than middleware.ts.

STRIPE
------
Adds:
- Stripe customer creation linked by Clerk user ID
- Stripe-hosted subscription Checkout
- signed Stripe webhook endpoint
- customer Billing Portal redirect
- live Stripe Price lookup for the Subscription page

WEBHOOK URL
-----------
Production endpoint:

https://YOUR-PRODUCTION-DOMAIN/api/stripe/webhook

Subscribe at minimum to:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

The webhook secret from that exact endpoint becomes:
STRIPE_WEBHOOK_SECRET

PAID PICKS
----------
/paid-picks reads the existing immutable paid publication from Supabase.

/api/paid-picks is protected.

/api/paid-board is replaced with a protected backward-compatible endpoint so
an old public paid-board API cannot leak member-only recommendations.

INSTALL
-------
1. Extract package into:
   C:\Users\Marty\Desktop\theunderoverclub

2. Run migration in Supabase SQL Editor:
   supabase/auth_billing_v1.sql

3. Install packages:
   npm install @clerk/nextjs stripe

4. Build:
   npm run build

5. Start local:
   npm run dev

6. Test authentication:
   http://localhost:3000/sign-up
   http://localhost:3000/sign-in
   http://localhost:3000/account

7. Signed-out test:
   http://localhost:3000/paid-picks
   Must NOT expose paid picks.

8. Signed-in non-subscriber test:
   /paid-picks must redirect to /subscription.

STRIPE CONFIGURATION
--------------------
Create recurring Stripe Prices in the Stripe Dashboard.

Add Price IDs to .env.local:
STRIPE_PRICE_WEEKLY=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_QUARTERLY=price_...
STRIPE_PRICE_YEARLY=price_...

You may configure fewer than four plans.
Only configured plans are rendered.

Set:
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

PRODUCTION
----------
Add the same required variables to Vercel Production, then create a NEW
production deployment because environment-variable changes apply to new
deployments.

NO FAKE ENTITLEMENTS
--------------------
This package does not create a fake subscription for testing.
A user receives paid access only after the Stripe webhook stores an active or
trialing subscription.
