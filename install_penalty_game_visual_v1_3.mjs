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
    "_penalty_game_visual_v1_3_payload",
  );

const files = [
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
];

for (const relative of files) {
  const source = path.join(
    packageRoot,
    `${relative}.payload`,
  );

  const target = path.join(
    project,
    relative,
  );

  if (!fs.existsSync(source)) {
    throw new Error(
      `Missing visual payload: ${source}`,
    );
  }

  if (!fs.existsSync(target)) {
    throw new Error(
      `Existing game file not found: ${target}`,
    );
  }

  fs.copyFileSync(
    target,
    `${target}.before-penalty-game-visual-v1-3.bak`,
  );

  fs.copyFileSync(
    source,
    target,
  );

  console.log(
    `Updated: ${relative}`,
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
  "Penalty Game visual v1.3 installed.",
);
console.log(
  "Camera is now behind a large foreground ball, facing the goal and goalkeeper.",
);
console.log(
  "No backend/game-rule changes were made.",
);
console.log(
  "Next: npm run build",
);
