THE UNDER OVER CLUB — SITE-WIDE MOBILE RESPONSIVE PASS

This package adds ONE centralized mobile override stylesheet so your existing
desktop design and business logic stay untouched.

FILES
1. REPLACE:
   src/app/globals.css

2. NEW:
   src/app/mobile-overrides.css

WHAT IT FIXES
- Shared mobile shell and safe screen width
- Corrects bottom navigation from 5 columns to 6 rendered items
- Makes the top HUD easier to swipe on phones
- Compacts the shared stadium hero on mobile
- Home pick cards and widgets
- Today's Free Picks cards and premium gate
- Paid Picks filters, fixture rows and analysis blocks
- Statistics cards and horizontally scrollable data table
- Membership plans and comparison rows
- Account cards and buttons
- Penalty Game scene, attempts and leaderboard
- About and Guides narrow-phone layouts
- Terms, Privacy, Contact and Responsible Play pages
- Clerk sign-in/sign-up width
- Long team names, emails and URLs no longer force horizontal overflow
- Better touch targets

INSTALL
1. Extract into:
   C:\Users\Marty\Desktop\theunderoverclub
2. Allow Windows to merge/replace files.
3. Run:
   npm run build
4. Check locally with:
   npm run dev
5. In Chrome, press F12 -> Toggle device toolbar and test:
   - iPhone SE / ~375px
   - iPhone 14/15 / ~390px
   - Android / ~412px
6. If good:
   git add .
   git commit -m "Make site mobile responsive"
   git push origin main

If GitHub still returns the remote Internal Server Error, use:
npx vercel --prod

IMPORTANT
This package does NOT change algorithms, picks, settlement, Stripe, Clerk,
statistics calculations, SEO metadata or desktop layouts. It is responsive CSS only.
