import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const scriptDir =
  path.dirname(fileURLToPath(import.meta.url));

const packageRoot =
  path.join(scriptDir, "_penalty_game_v1_4_fix_payload");

const files = [
  "supabase/penalty_game_v1_4_rpc_fix.sql",
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
];

for (const relative of files) {
  const source = path.join(packageRoot, `${relative}.payload`);
  const target = path.join(project, relative);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing package payload: ${source}`);
  }

  if (fs.existsSync(target)) {
    fs.copyFileSync(
      target,
      `${target}.before-penalty-game-v1-4-fix.bak`,
    );
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);

  console.log(`Installed: ${relative}`);
}

fs.rmSync(packageRoot, { recursive: true, force: true });

console.log("");
console.log("Penalty Game v1.4 fix installed.");
console.log("IMPORTANT: run supabase/penalty_game_v1_4_rpc_fix.sql in Supabase SQL Editor.");
console.log("Then: npm run build");
