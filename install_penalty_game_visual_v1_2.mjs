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
    "_penalty_game_visual_v1_2_payload",
  );

const files = [
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
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
    `${target}.before-penalty-game-visual-v1-2.bak`,
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
  "Penalty Game visual/interaction v1.2 installed.",
);
console.log(
  "Keeper now stands on the goal line.",
);
console.log(
  "Goal overlays cannot block shot-zone clicks.",
);
console.log(
  "The ball reacts immediately when a target is selected.",
);
console.log(
  "Shot errors are now highly visible.",
);
console.log(
  "Next: npm run build",
);
