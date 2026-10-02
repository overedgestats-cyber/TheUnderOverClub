import fs from "node:fs";
import path from "node:path";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const targets = [
  "src/app/account/layout.tsx",
  "src/app/paid-picks/layout.tsx",
  "src/app/statistics/layout.tsx",
  "src/app/subscription/layout.tsx",
  "src/app/today/layout.tsx",
];

function backup(file) {
  const backupPath =
    `${file}.before-layout-passthrough-fix-v2-4.bak`;

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(file, backupPath);
  }
}

function fixLayout(source, relative) {
  let next = source;

  // The previous shell-dedupe removed <RetroShell> tags but left JSX-style
  // "{children}" inside parentheses. Outside JSX that becomes an object literal,
  // so Next inferred the layout return type as { children: ReactNode }.
  //
  // Convert all common broken passthrough forms into `return children;`.
  const patterns = [
    /return\s*\(\s*\{\s*children\s*\}\s*\)\s*;/m,
    /return\s*\{\s*children\s*\}\s*;/m,
    /return\s*\(\s*\(\s*\{\s*children\s*\}\s*\)\s*\)\s*;/m,
  ];

  let fixed = false;

  for (const pattern of patterns) {
    if (pattern.test(next)) {
      next = next.replace(pattern, "return children;");
      fixed = true;
      break;
    }
  }

  if (!fixed) {
    throw new Error(
      `Could not find the broken {children} passthrough return in ${relative}. No change was made to that file.`,
    );
  }

  return next;
}

let fixedCount = 0;

for (const relative of targets) {
  const file =
    path.join(project, relative);

  if (!fs.existsSync(file)) {
    throw new Error(
      `Expected route layout does not exist: ${file}`,
    );
  }

  const source =
    fs.readFileSync(file, "utf8");

  const next =
    fixLayout(source, relative);

  backup(file);

  fs.writeFileSync(
    file,
    next,
    "utf8",
  );

  fixedCount += 1;

  console.log(
    `Fixed passthrough layout: ${relative}`,
  );
}

// Clear generated Next types so the next build validates only the repaired source.
const nextDir =
  path.join(project, ".next");

if (fs.existsSync(nextDir)) {
  fs.rmSync(
    nextDir,
    {
      recursive: true,
      force: true,
    },
  );

  console.log(
    "Removed stale .next build output.",
  );
}

// Verification
for (const relative of targets) {
  const file =
    path.join(project, relative);

  const source =
    fs.readFileSync(file, "utf8");

  if (
    /return\s*\(\s*\{\s*children\s*\}\s*\)\s*;/m.test(source) ||
    /return\s*\{\s*children\s*\}\s*;/m.test(source)
  ) {
    throw new Error(
      `Verification failed: ${relative} still returns a children object.`,
    );
  }

  if (!/return\s+children\s*;/m.test(source)) {
    throw new Error(
      `Verification failed: ${relative} does not contain "return children;".`,
    );
  }
}

console.log("");
console.log(
  `DONE. Fixed ${fixedCount} route layouts.`,
);
console.log(
  "Each affected nested layout now returns the ReactNode directly.",
);
console.log(
  "Next: npm run build",
);
