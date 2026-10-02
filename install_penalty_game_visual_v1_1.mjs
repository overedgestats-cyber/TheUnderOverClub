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
    "_penalty_game_visual_v1_1_payload",
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
      `Existing Penalty Game file not found: ${target}. Install Game v1 first.`,
    );
  }

  fs.copyFileSync(
    target,
    `${target}.before-penalty-game-visual-v1-1.bak`,
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
  "Penalty Game visual v1.1 installed.",
);
console.log(
  "Backend, SQL, attempts and leaderboard logic were not changed.",
);
console.log(
  "Next: npm run build",
);
