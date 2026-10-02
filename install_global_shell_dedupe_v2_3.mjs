import fs from "node:fs";
import path from "node:path";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const appRoot =
  path.join(
    project,
    "src",
    "app",
  );

const rootLayout =
  path.join(
    appRoot,
    "layout.tsx",
  );

if (!fs.existsSync(rootLayout)) {
  throw new Error(
    `Root layout not found: ${rootLayout}`,
  );
}

function allTsxFiles(directory) {
  const output = [];

  for (
    const entry of fs.readdirSync(
      directory,
      {
        withFileTypes: true,
      },
    )
  ) {
    const absolute =
      path.join(
        directory,
        entry.name,
      );

    if (
      entry.isDirectory()
    ) {
      output.push(
        ...allTsxFiles(
          absolute,
        ),
      );
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(
        ".tsx",
      )
    ) {
      output.push(
        absolute,
      );
    }
  }

  return output;
}

function backup(file) {
  const backupPath =
    `${file}.before-global-shell-dedupe-v2-3.bak`;

  if (
    !fs.existsSync(
      backupPath,
    )
  ) {
    fs.copyFileSync(
      file,
      backupPath,
    );
  }
}

function removeRetroShellImport(
  source,
) {
  return source.replace(
    /^import\s+RetroShell\s+from\s+["']@\/components\/retro\/RetroShell["'];?\s*\r?\n/gm,
    "",
  );
}

function removeNestedRetroShell(
  source,
) {
  let next =
    source;

  // Global shell belongs only in src/app/layout.tsx.
  // On every other app file, unwrap RetroShell but preserve all children.
  next =
    next.replace(
      /<RetroShell(?:\s[^>]*)?>/g,
      "",
    );

  next =
    next.replace(
      /<\/RetroShell>/g,
      "",
    );

  next =
    removeRetroShellImport(
      next,
    );

  return next;
}

// ----------------------------------------------------------
// 1. Remove every nested app-level RetroShell.
// ----------------------------------------------------------
const tsxFiles =
  allTsxFiles(
    appRoot,
  );

let cleanedFiles = 0;

for (
  const file of tsxFiles
) {
  if (
    path.resolve(file) ===
    path.resolve(rootLayout)
  ) {
    continue;
  }

  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  if (
    !source.includes(
      "RetroShell",
    )
  ) {
    continue;
  }

  const next =
    removeNestedRetroShell(
      source,
    );

  if (
    next !== source
  ) {
    backup(file);

    fs.writeFileSync(
      file,
      next,
      "utf8",
    );

    cleanedFiles += 1;

    console.log(
      `Removed nested RetroShell: ${path.relative(project, file)}`,
    );
  }
}

// ----------------------------------------------------------
// 2. Normalize the ROOT shell to exactly one wrapper.
// ----------------------------------------------------------
let root =
  fs.readFileSync(
    rootLayout,
    "utf8",
  );

backup(
  rootLayout,
);

// Remove duplicate imports first.
root =
  root.replace(
    /^import\s+RetroShell\s+from\s+["']@\/components\/retro\/RetroShell["'];?\s*\r?\n/gm,
    "",
  );

const importMatches =
  [...root.matchAll(
    /^import .*?;\s*$/gm,
  )];

if (
  importMatches.length === 0
) {
  throw new Error(
    "Could not find root layout import section.",
  );
}

const lastImport =
  importMatches[
    importMatches.length - 1
  ];

const importAt =
  lastImport.index +
  lastImport[0].length;

root =
  `${root.slice(
    0,
    importAt,
  )}\nimport RetroShell from "@/components/retro/RetroShell";${root.slice(
    importAt,
  )}`;

// Remove ALL existing RetroShell tags from root,
// then wrap the single {children} occurrence once.
root =
  root
    .replace(
      /<RetroShell(?:\s[^>]*)?>/g,
      "",
    )
    .replace(
      /<\/RetroShell>/g,
      "",
    );

const childMatches =
  [...root.matchAll(
    /\{children\}/g,
  )];

if (
  childMatches.length !== 1
) {
  throw new Error(
    `Expected exactly one {children} in root layout; found ${childMatches.length}. No unsafe root rewrite performed.`,
  );
}

root =
  root.replace(
    "{children}",
    "<RetroShell>{children}</RetroShell>",
  );

fs.writeFileSync(
  rootLayout,
  root,
  "utf8",
);

console.log(
  "Normalized root layout: exactly one RetroShell wrapper.",
);

// ----------------------------------------------------------
// 3. Verify: only root layout may reference RetroShell.
// ----------------------------------------------------------
const remaining =
  [];

for (
  const file of allTsxFiles(
    appRoot,
  )
) {
  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  if (
    source.includes(
      "RetroShell",
    )
  ) {
    remaining.push(
      path.relative(
        project,
        file,
      ),
    );
  }
}

if (
  remaining.length !== 1 ||
  remaining[0].replaceAll("\\", "/") !==
    "src/app/layout.tsx"
) {
  throw new Error(
    `RetroShell verification failed. Remaining references: ${remaining.join(", ")}`,
  );
}

console.log("");
console.log(
  `DONE. Nested shell files cleaned: ${cleanedFiles}`,
);
console.log(
  "Verified: RetroShell now exists ONLY in src/app/layout.tsx.",
);
console.log(
  "This means every page gets one left sidebar + one top HUD, never two.",
);
console.log(
  "Next: npm run build",
);
