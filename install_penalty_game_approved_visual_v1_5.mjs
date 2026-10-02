import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const scriptDir =
  path.dirname(fileURLToPath(import.meta.url));

const packageRoot =
  path.join(
    scriptDir,
    "_penalty_game_approved_visual_v1_5_payload",
  );

const files = [
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
];

for (const relative of files) {
  const source =
    path.join(packageRoot, `${relative}.payload`);

  const target =
    path.join(project, relative);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing package payload: ${source}`);
  }

  if (!fs.existsSync(target)) {
    throw new Error(
      `Existing Penalty Game file not found: ${target}`,
    );
  }

  fs.copyFileSync(
    target,
    `${target}.before-approved-visual-v1-5.bak`,
  );

  fs.copyFileSync(source, target);

  console.log(`Updated: ${relative}`);
}

fs.rmSync(
  packageRoot,
  { recursive: true, force: true },
);

console.log("");
console.log("Approved Penalty Game visual v1.5 installed.");
console.log("Backend, SQL, game limits, EXP and leaderboard logic were not changed.");
console.log("Next: npm run build");
