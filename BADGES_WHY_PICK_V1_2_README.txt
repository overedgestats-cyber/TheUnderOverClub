THE UNDER OVER CLUB — BADGES + WHY THIS PICK V1.2

This version fixes both installer issues encountered in v1/v1.1:

1. The live project uses:
   oneXTwoSanityReason()
   not oneXTwoAnomalyReason().

2. Installer source files use .payload extensions and the payload directory is
   deleted automatically after installation, so Next.js cannot type-check the
   staging package.

It also avoids assuming a fixture_id column in free_pick_publications. Free Pick
badges are resolved using the immutable provider fixture ID already stored in
analysis_snapshot.fixtureId.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Run:
cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_badges_why_pick_v1_2.mjs

VERIFY
------
Select-String -Path .\src\components\free-picks\TodayFreePicks.tsx -Pattern 'WHY THIS PICK|homeLogo|MODEL PROB'
Select-String -Path .\src\lib\free-picks\public-free-picks.ts -Pattern 'homeLogo|awayLogo|analysisReasons'
Select-String -Path .\src\lib\paid-picks\public-paid-picks.ts -Pattern 'oneXTwoSanityReason|analysisReasons|homeLogo'

Then:
npm run build

If build passes:
vercel deploy --prod

No SQL migration.
No immutable pick mutation.
Current +12pp 1X2 safety logic is reused on the customer-facing read path.
