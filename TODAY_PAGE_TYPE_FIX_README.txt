Replace src/lib/free-picks/public-free-picks.ts with this version.
It adds an explicit PublicFreePicksData return type so TypeScript preserves dateMode as "today" | "future" | "past" | "none" instead of widening it to string.
Then run: npm run build
