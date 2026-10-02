CLERK USERBUTTON TYPE FIX

Problem:
The installed Clerk version rejects afterSignOutUrl on <UserButton />.

Current Clerk guidance:
- afterSignOutUrl belongs on <ClerkProvider />
- <UserButton /> should be rendered without that deprecated prop

This patch:
1. moves afterSignOutUrl="/" to <ClerkProvider>
2. changes <UserButton afterSignOutUrl="/" /> to <UserButton />
3. places ClerkProvider inside <body>, matching Clerk's current Next.js example

No SQL or environment-variable changes are required.

After extracting:
npm run build
