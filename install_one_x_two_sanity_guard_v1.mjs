import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const scriptDir =
  path.dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const source =
  path.join(
    scriptDir,
    "_one_x_two_sanity_guard_v1",
    "src",
    "lib",
    "analysis",
    "recommendations.ts",
  );

const target =
  path.join(
    project,
    "src",
    "lib",
    "analysis",
    "recommendations.ts",
  );

if (!fs.existsSync(source)) {
  throw new Error(
    `Missing patch file: ${source}`,
  );
}

if (!fs.existsSync(target)) {
  throw new Error(
    `Target file not found: ${target}`,
  );
}

const backup =
  `${target}.before-one-x-two-sanity-guard-v1.bak`;

fs.copyFileSync(
  target,
  backup,
);

fs.copyFileSync(
  source,
  target,
);

console.log(
  "Installed 1X2 sanity guard.",
);
console.log(
  `Backup: ${backup}`,
);
console.log(
  "Next: npm run build",
);
