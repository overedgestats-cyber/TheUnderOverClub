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

const payloadRoot =
  path.join(
    scriptDir,
    "_global_shell_game_v2_2_payload",
  );

function backup(target, suffix) {
  if (
    fs.existsSync(target)
  ) {
    fs.copyFileSync(
      target,
      `${target}.${suffix}.bak`,
    );
  }
}

function installPayload(relative) {
  const source =
    path.join(
      payloadRoot,
      `${relative}.payload`,
    );

  const target =
    path.join(
      project,
      relative,
    );

  if (
    !fs.existsSync(source)
  ) {
    throw new Error(
      `Missing payload: ${source}`,
    );
  }

  backup(
    target,
    "before-global-shell-game-v2-2",
  );

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

installPayload(
  "src/components/game/PenaltyGame.tsx",
);
installPayload(
  "src/components/game/PenaltyGame.module.css",
);
installPayload(
  "public/game/penalty-scene-exact.png",
);
installPayload(
  "src/components/retro/RetroNavigation.tsx",
);
installPayload(
  "src/components/retro/RetroLogoutButton.tsx",
);
installPayload(
  "src/components/retro/RetroShell.tsx",
);

// ----------------------------------------------------------
// Guarantee RetroShell wraps the whole application.
// ----------------------------------------------------------
const layoutPath =
  path.join(
    project,
    "src/app/layout.tsx",
  );

if (
  !fs.existsSync(layoutPath)
) {
  throw new Error(
    `Root layout not found: ${layoutPath}`,
  );
}

let layout =
  fs.readFileSync(
    layoutPath,
    "utf8",
  );

backup(
  layoutPath,
  "before-global-shell-game-v2-2",
);

if (
  !layout.includes(
    '@/components/retro/RetroShell',
  )
) {
  const importLines =
    [...layout.matchAll(
      /^import .*?;\s*$/gm,
    )];

  if (
    importLines.length === 0
  ) {
    throw new Error(
      "Could not find import section in src/app/layout.tsx",
    );
  }

  const last =
    importLines[
      importLines.length - 1
    ];

  const insertAt =
    last.index +
    last[0].length;

  layout =
    `${layout.slice(
      0,
      insertAt,
    )}\nimport RetroShell from "@/components/retro/RetroShell";${layout.slice(
      insertAt,
    )}`;
}

if (
  !/<RetroShell[\s>]/.test(
    layout,
  )
) {
  const childMatches =
    [...layout.matchAll(
      /\{children\}/g,
    )];

  if (
    childMatches.length !== 1
  ) {
    throw new Error(
      `Expected exactly one {children} in src/app/layout.tsx, found ${childMatches.length}. Root layout was not changed.`,
    );
  }

  layout =
    layout.replace(
      "{children}",
      "<RetroShell>{children}</RetroShell>",
    );
}

fs.writeFileSync(
  layoutPath,
  layout,
  "utf8",
);

console.log(
  "Patched: src/app/layout.tsx -> RetroShell is global",
);

// ----------------------------------------------------------
// Add only the new shell styles. Existing shell visual CSS
// remains intact.
// ----------------------------------------------------------
const shellCssPath =
  path.join(
    project,
    "src/components/retro/RetroShell.module.css",
  );

if (
  !fs.existsSync(shellCssPath)
) {
  throw new Error(
    `RetroShell.module.css not found: ${shellCssPath}`,
  );
}

let shellCss =
  fs.readFileSync(
    shellCssPath,
    "utf8",
  );

backup(
  shellCssPath,
  "before-global-shell-game-v2-2",
);

const marker =
  "/* GLOBAL SHELL V2.2 */";

if (
  !shellCss.includes(marker)
) {
  shellCss += `

${marker}

.userControls {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.logoutButton {
  min-height: 36px;
  padding: 7px 11px;
  border: 2px solid #5d1d1d;
  background: #1b0909;
  color: #ff5c5c;
  font: inherit;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow:
    inset 0 0 0 1px #080303,
    2px 2px 0 #000;
}

.logoutButton:hover,
.logoutButton:focus-visible {
  outline: none;
  border-color: #ff5c5c;
  background: #2b0b0b;
  color: #ffffff;
}

@media (min-width: 901px) {
  .sidebar {
    position: sticky;
    top: 0;
    align-self: start;
    height: 100vh;
    overflow-y: auto;
    z-index: 80;
  }

  .main {
    min-width: 0;
  }

  .hud {
    position: sticky;
    top: 0;
    z-index: 70;
  }

  .content {
    min-width: 0;
  }
}

@media (max-width: 900px) {
  .logoutButton {
    display: none;
  }
}
`;
}

fs.writeFileSync(
  shellCssPath,
  shellCss,
  "utf8",
);

console.log(
  "Patched: RetroShell.module.css -> sticky desktop shell + explicit logout",
);

fs.rmSync(
  payloadRoot,
  {
    recursive: true,
    force: true,
  },
);

console.log("");
console.log(
  "Global Shell + Penalty Game v2.2 installed.",
);
console.log(
  "- Left navigation is now guaranteed from the root layout.",
);
console.log(
  "- Top live-stat HUD is now guaranteed from the root layout.",
);
console.log(
  "- GAME was added to navigation.",
);
console.log(
  "- Explicit LOG OUT button was added next to the Clerk avatar.",
);
console.log(
  "- Penalty target duplicate labels were removed; exact artwork labels remain.",
);
console.log(
  "- No SQL/database changes.",
);
console.log(
  "Next: npm run build",
);
