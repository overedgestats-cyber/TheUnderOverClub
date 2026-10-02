THE UNDER OVER CLUB — LAYOUT PASSTHROUGH FIX V2.4

WHY THE BUILD FAILED
--------------------
The previous dedupe patch correctly removed nested <RetroShell> wrappers.

However, in five route layouts it left this shape:

return (
  {children}
);

Outside JSX, {children} is treated as a JavaScript object literal.

So TypeScript inferred the layout as returning:

{ children: ReactNode }

instead of:

ReactNode

That is exactly what the Next.js validator error shows.

FIXED ROUTES
------------
src/app/account/layout.tsx
src/app/paid-picks/layout.tsx
src/app/statistics/layout.tsx
src/app/subscription/layout.tsx
src/app/today/layout.tsx

Each is changed to:

return children;

The root RetroShell remains untouched.

The installer also deletes the stale .next output so Next regenerates its route
validator types from the repaired source.

INSTALL
-------
Extract into:
C:\Users\Marty\Desktop\theunderoverclub

Then run:

cd C:\Users\Marty\Desktop\theunderoverclub
node .\install_layout_passthrough_fix_v2_4.mjs
npm run build

If build passes:

vercel deploy --prod

No SQL.
No database changes.
No game changes.
No picks/model changes.
