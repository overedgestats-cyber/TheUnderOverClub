THE UNDER OVER CLUB — ANALYTICS + CONVERSION V2

WHY V2
------
The v1 PowerShell installer had invalid multiline command syntax around
Split-Path. PowerShell stopped while parsing it, so v1 did not modify the
project.

V2 uses simple PowerShell statements and full frontend replacements matched to
the current Retro UI v1 structure.

V2 INSTALLS
-----------
- consent-gated analytics provider
- GA4 support
- Meta Pixel support
- route/funnel events
- plan click events
- checkout_started event
- retro consent banner
- tracked checkout forms on the current Subscription page

V2 DOES NOT YET MODIFY
----------------------
src/app/api/billing/checkout/route.ts

We will inspect that route before adding purchase-success attribution rather
than guessing its current Stripe logic.

INSTALL
-------
Extract ZIP directly into:
C:\Users\Marty\Desktop\theunderoverclub

Keep the _analytics_v2 folder.

Then:
powershell -ExecutionPolicy Bypass -File .\install_analytics_conversion_v2.ps1
npm run build

Environment variables, when ready:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

Without either variable, no consent banner or analytics scripts are loaded.

After build succeeds, send:
Get-Content .\src\app\api\billing\checkout\route.ts -First 260

We will then add successful-purchase attribution safely.
