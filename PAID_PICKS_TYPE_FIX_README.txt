PAID PICKS TYPE FIX V1

Problem:
Because the Supabase admin client is intentionally typed as `any`,
TypeScript widened the paid board result and `pick` became implicit `any`
inside paid-picks/page.tsx.

Fix:
- adds explicit PaidPick and PaidPicksBoard types
- explicitly types Supabase recommendation / fixture rows
- getPaidPicks() now returns Promise<PaidPicksBoard>
- paid page imports and uses PaidPick explicitly

No SQL changes.
No environment-variable changes.
No behavior/security changes.

After extracting:
npm run build
