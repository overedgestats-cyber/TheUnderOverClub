import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing file: ${rel}`);
  }
  return fs.readFileSync(full, "utf8");
}

function write(rel, content) {
  const full = path.join(root, rel);
  const backup = `${full}.bak-v2_5`;
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(full, backup);
  }
  fs.writeFileSync(full, content, "utf8");
  console.log(`Patched: ${rel}`);
}

function replaceOnce(content, regex, replacement, label) {
  const matches = content.match(new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`));
  if (!matches || matches.length !== 1) {
    throw new Error(`${label}: expected exactly 1 match, found ${matches ? matches.length : 0}`);
  }
  return content.replace(regex, replacement);
}

// 1) HOME PAGE: use the real badge URLs already supplied by getPublicFreePicks().
{
  const rel = "src/app/page.tsx";
  let s = read(rel);

  s = replaceOnce(
    s,
    /<span className=\{styles\.teamBadge\}>\s*\{teams\.home\.slice\(0,\s*2\)\.toUpperCase\(\)\}\s*<\/span>/,
`<span className={styles.teamBadge}>
                        {pick.homeLogo ? (
                          <img
                            className={styles.teamLogo}
                            src={stringValue(pick.homeLogo)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        ) : (
                          teams.home.slice(0, 2).toUpperCase()
                        )}
                      </span>`,
    "home badge"
  );

  s = replaceOnce(
    s,
    /<span className=\{styles\.teamBadge\}>\s*\{teams\.away\.slice\(0,\s*2\)\.toUpperCase\(\)\}\s*<\/span>/,
`<span className={styles.teamBadge}>
                        {pick.awayLogo ? (
                          <img
                            className={styles.teamLogo}
                            src={stringValue(pick.awayLogo)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        ) : (
                          teams.away.slice(0, 2).toUpperCase()
                        )}
                      </span>`,
    "away badge"
  );

  write(rel, s);
}

// Home badge image styling. We append only if it is not already present.
{
  const rel = "src/app/home.module.css";
  let s = read(rel);

  if (!s.includes(".teamLogo")) {
    s += `

/* v2.5 — real club badges on Home Free Pick cards */
.teamLogo {
  display: block;
  width: 30px;
  height: 30px;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: auto;
}
`;
  }

  write(rel, s);
}

// 2) GAME: the word CENTRE is baked into penalty-scene-exact.png.
// Add a small masked live label inside the existing centre hitbox so it is
// optically centred without changing the approved stadium/goal artwork.
{
  const rel = "src/components/game/PenaltyGame.tsx";
  let s = read(rel);

  s = replaceOnce(
    s,
    /aria-label=\{`Shoot \$\{zoneLabels\[zone\]\}`\}\s*\/>/,
`aria-label={\`Shoot \${zoneLabels[zone]}\`}
                  >
                    {zone === "center" ? (
                      <span
                        className={styles.centerTargetLabel}
                        aria-hidden="true"
                      >
                        CENTRE
                      </span>
                    ) : null}
                  </button>`,
    "centre target button"
  );

  write(rel, s);
}

{
  const rel = "src/components/game/PenaltyGame.module.css";
  let s = read(rel);

  if (!s.includes(".centerTargetLabel")) {
    s += `

/* v2.5 — visually re-centre the baked CENTRE target label */
.centerTargetLabel {
  position: absolute;
  z-index: 4;
  left: 50%;
  top: 58%;
  transform: translate(-50%, -50%);
  width: 74%;
  height: 62%;
  display: grid;
  place-items: center;
  background: rgba(3, 6, 9, 0.96);
  color: #ffd329;
  font: inherit;
  font-size: clamp(7px, 0.95vw, 14px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.02em;
  text-shadow: 2px 2px 0 #000;
  pointer-events: none;
}
`;
  }

  write(rel, s);
}

// 3) LEADERBOARD: zero-shot placeholder rows should never appear.
// This lets us clear the current test leaderboard and keeps it visually empty
// until a player actually takes a penalty.
{
  const rel = "src/lib/game/server.ts";
  let s = read(rel);

  if (!s.includes('.gt(\n      "shots",\n      0,\n    )')) {
    s = replaceOnce(
      s,
      /\.eq\(\s*"month_key",\s*monthKey,\s*\)\s*\.order\(/,
`.eq(
      "month_key",
      monthKey,
    )
    .gt(
      "shots",
      0,
    )
    .order(`,
      "leaderboard zero-shot filter"
    );
  }

  write(rel, s);
}

console.log("");
console.log("v2.5 patch applied.");
console.log("Backups were created with .bak-v2_5 suffix.");
console.log("");
console.log("Next:");
console.log("  1) npm run build");
console.log("  2) Run reset_current_game_leaderboard.sql in Supabase SQL Editor");
console.log("  3) vercel deploy --prod");
