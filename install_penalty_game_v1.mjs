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
    "_penalty_game_v1_payload",
  );

const files = [
  "supabase/penalty_game_v1.sql",
  "src/lib/game/config.ts",
  "src/lib/game/server.ts",
  "src/app/api/game/state/route.ts",
  "src/app/api/game/shoot/route.ts",
  "src/app/api/game/leaderboard/route.ts",
  "src/app/game/page.tsx",
  "src/app/game/layout.tsx",
  "src/components/game/PenaltyGame.tsx",
  "src/components/game/PenaltyGame.module.css",
  "src/components/retro/RetroNavigation.tsx",
];

for (
  const relative of
  files
) {
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

  if (
    !fs.existsSync(
      source,
    )
  ) {
    throw new Error(
      `Missing package payload: ${source}`,
    );
  }

  if (
    fs.existsSync(
      target,
    )
  ) {
    fs.copyFileSync(
      target,
      `${target}.before-penalty-game-v1.bak`,
    );
  }

  fs.mkdirSync(
    path.dirname(
      target,
    ),
    {
      recursive:
        true,
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
  "Penalty Game v1 installed.",
);
console.log(
  "IMPORTANT: run supabase/penalty_game_v1.sql in the Supabase SQL editor BEFORE deploying.",
);
console.log(
  "Then run: npm run build",
);
