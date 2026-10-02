THE UNDER OVER CLUB — PRICING + DAILY PASS V2

AGREED COMMERCIAL MODEL
-----------------------
Daily Pass: EUR 2.49
- one-time purchase
- grants Paid Picks for the Sofia calendar date captured at Checkout creation
- does not renew

Weekly: EUR 6.99
- recurring weekly subscription

Monthly: EUR 17.99
- recurring monthly subscription
- public badge: MOST POPULAR

Yearly: EUR 119.99
- recurring yearly subscription
- public badge: BEST VALUE

All paid options unlock the SAME Paid Picks.

SECURITY
--------
Daily Pass entitlement is stored only after a verified Stripe webhook reports
the Checkout Session as paid.

A redirect to the Checkout success page does NOT grant access.

The server-side entitlement check now allows:
- active/trialing subscription, OR
- a Daily Pass row matching the requested access date

The paid API checks entitlement for the exact requested date.

DATABASE
--------
Run:
supabase/auth_billing_daily_pass_v2.sql

Creates:
customer_daily_access

RLS is enabled with no public policies.

STRIPE PRICE CONFIGURATION
--------------------------
Create one-time Price:
STRIPE_PRICE_DAILY
EUR 2.49

Create recurring Prices:
STRIPE_PRICE_WEEKLY
EUR 6.99 every week

STRIPE_PRICE_MONTHLY
EUR 17.99 every month

STRIPE_PRICE_YEARLY
EUR 119.99 every year

The app retrieves each configured Stripe Price and verifies:
- currency
- exact amount
- one-time vs recurring
- recurring interval
- active state

A wrongly configured Price ID fails closed instead of silently displaying or
charging the wrong plan.

WEBHOOK EVENTS
--------------
Keep:
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted

Also add:
checkout.session.async_payment_succeeded

The Daily Pass grant is idempotent and unique per Clerk user + access date.

INSTALL
-------
1. Extract into:
C:\Users\Marty\Desktop\theunderoverclub

2. Run migration in Supabase:
supabase/auth_billing_daily_pass_v2.sql

3. Add the four Stripe Price IDs to .env.local after creating them.

4. Run:
npm run build

5. Then local Stripe Checkout/webhook testing.

IMPORTANT
---------
Do not create a recurring "daily subscription".
The EUR 2.49 Daily Pass is a one-time payment.
