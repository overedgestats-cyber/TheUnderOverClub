THE UNDER OVER CLUB — TRUST / LEGAL V1

Routes added
------------
/terms
/privacy
/responsible-play
/contact

Contact email used
------------------
theunderoverclub@gmail.com

Important
---------
These pages are practical launch drafts, not a substitute for legal advice.

Before scaling paid traffic, confirm and add:
- legal name of the operator
- business / correspondence address
- company registration details if applicable
- VAT details if applicable
- confirmed data-controller identity
- any jurisdiction-specific consumer information required for your business
- a compliant cookie/consent mechanism before optional advertising/analytics
  cookies are enabled

EU consumer note
----------------
The Terms deliberately do NOT claim "no refunds" or that statutory withdrawal
rights never apply. Consumer rights can depend on jurisdiction and on how
immediate digital access/consent is implemented at checkout.

Install
-------
Extract ZIP into:
C:\Users\Marty\Desktop\theunderoverclub

Then run:
powershell -ExecutionPolicy Bypass -File .\apply_trust_legal_v1.ps1
npm run build

If build passes:
npm run dev

Check:
http://localhost:3000/terms
http://localhost:3000/privacy
http://localhost:3000/responsible-play
http://localhost:3000/contact

Then deploy:
vercel deploy --prod

No SQL changes.
No backend changes.
