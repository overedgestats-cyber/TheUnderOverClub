THE UNDER OVER CLUB — ANALYTICS PURCHASE ATTRIBUTION V4

Fixes the v3 PowerShell installer prompt:
Join-Path -> Supply values for Path[0]

V4 uses $PSCommandPath plus System.IO.Path.Combine instead of the problematic
Join-Path expression.

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
powershell -ExecutionPolicy Bypass -File .\install_analytics_purchase_v4.ps1
npm run build

The actual TypeScript changes are the same as v3:
- Stripe success URL includes plan + Checkout Session ID
- cancel URL includes plan
- GA4/Meta purchase attribution
- browser-side duplicate purchase-event protection

No SQL changes.
No Stripe entitlement changes.
No webhook changes.
