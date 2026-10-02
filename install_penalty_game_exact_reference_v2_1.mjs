import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const scriptDir =
  path.dirname(
    fileURLToPath(import.meta.url),
  );

const packageRoot =
  path.join(
    scriptDir,
    "_penalty_game_exact_reference_v2_1_payload",
  );

const files = [
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
  "public/game/penalty-scene-exact.png",
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
      `Missing package payload: ${source}`,
    );
  }

  if (fs.existsSync(target)) {
    fs.copyFileSync(
      target,
      `${target}.before-exact-reference-v2-1.bak`,
    );
  }

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
    },
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
  "Penalty Game exact-reference v2.1 installed.",
);
console.log(
  "Fix 1: goalkeeper moved down onto the goal line.",
);
console.log(
  "Fix 2: all five direction labels are now live overlays and stay visible.",
);
console.log(
  "No SQL or backend changes.",
);
console.log(
  "Next: npm run build",
);
