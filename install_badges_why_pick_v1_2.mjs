import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const scriptDir =
  path.dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const packageRoot =
  path.join(
    scriptDir,
    "_badges_why_pick_v1_2_payload",
  );

const recommendationsPath =
  path.join(
    project,
    "src",
    "lib",
    "analysis",
    "recommendations.ts",
  );

if (!fs.existsSync(recommendationsPath)) {
  throw new Error(
    `Required file not found: ${recommendationsPath}`,
  );
}

let recommendations =
  fs.readFileSync(
    recommendationsPath,
    "utf8",
  );

if (
  !recommendations.includes(
    "oneXTwoSanityReason(",
  )
) {
  throw new Error(
    "Current oneXTwoSanityReason helper was not found. No files were changed.",
  );
}

if (
  !recommendations.includes(
    "export function oneXTwoSanityReason(",
  )
) {
  fs.copyFileSync(
    recommendationsPath,
    `${recommendationsPath}.before-badges-why-pick-v1-2.bak`,
  );

  recommendations =
    recommendations.replace(
      "function oneXTwoSanityReason(",
      "export function oneXTwoSanityReason(",
    );

  fs.writeFileSync(
    recommendationsPath,
    recommendations,
    "utf8",
  );

  console.log(
    "Exported existing oneXTwoSanityReason helper.",
  );
}

const files = [
  "src/lib/free-picks/public-free-picks.ts",
  "src/lib/paid-picks/public-paid-picks.ts",
  "src/components/free-picks/TodayFreePicks.tsx",
  "src/components/free-picks/TodayFreePicks.module.css",
  "src/components/paid-picks/PaidPicksBoard.tsx",
  "src/components/paid-picks/PaidPicksBoard.module.css",
];

for (const relative of files) {
  const source =
    path.join(
      packageRoot,
      `${relative}.payload`,
    );

  const target =
    path.join(
      project,
      relative,
    );

  if (!fs.existsSync(source)) {
    throw new Error(
      `Package payload missing: ${source}`,
    );
  }

  if (fs.existsSync(target)) {
    fs.copyFileSync(
      target,
      `${target}.before-badges-why-pick-v1-2.bak`,
    );
  }

  fs.mkdirSync(
    path.dirname(target),
    { recursive: true },
  );

  fs.copyFileSync(
    source,
    target,
  );

  console.log(
    `Installed: ${relative}`,
  );
}

fs.rmSync(
  packageRoot,
  {
    recursive: true,
    force: true,
  },
);

console.log("");
console.log(
  "Badges + WHY THIS PICK v1.2 installed.",
);
console.log(
  "Used the actual oneXTwoSanityReason helper.",
);
console.log(
  "Installer payload removed automatically.",
);
console.log(
  "No SQL migration required.",
);
console.log(
  "No immutable published rows changed.",
);
console.log("");
console.log(
  "Next: npm run build",
);
