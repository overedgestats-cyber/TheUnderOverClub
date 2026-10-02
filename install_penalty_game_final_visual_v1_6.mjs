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
    "_penalty_game_final_visual_v1_6_payload",
  );

const files = [
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
  "public/game/penalty-stadium-v1.svg",
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
      `${target}.before-final-visual-v1-6.bak`,
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
  "Penalty Game final visual v1.6 installed.",
);
console.log(
  "The stadium/pitch is now a dedicated pixel-art SVG asset, not CSS geometry.",
);
console.log(
  "Live targets, keeper, ball, attempts, EXP and leaderboard remain dynamic HTML.",
);
console.log(
  "No SQL or backend changes.",
);
console.log(
  "Next: npm run build",
);
