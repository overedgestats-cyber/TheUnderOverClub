import fs from "node:fs";
import path from "node:path";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const target =
  path.join(
    project,
    "src",
    "lib",
    "analysis",
    "recommendations.ts",
  );

if (!fs.existsSync(target)) {
  throw new Error(
    `recommendations.ts not found: ${target}`,
  );
}

const backup =
  `${target}.before-1x2-12pp-safety-v1.bak`;

fs.copyFileSync(
  target,
  backup,
);

let source =
  fs.readFileSync(
    target,
    "utf8",
  );

const reason =
  "1X2 model-market disagreement is too extreme for an official pick";

if (!source.includes(reason)) {
  throw new Error(
    "Existing 1X2 sanity guard was not found. Refusing to patch an unexpected file.",
  );
}

const patterns = [
  {
    from:
      "candidate.valueEdge >= 0.18",
    to:
      "candidate.valueEdge >= 0.12",
  },
  {
    from:
      "valueEdge >= 0.18",
    to:
      "valueEdge >= 0.12",
  },
];

let changed =
  false;

for (const pattern of patterns) {
  if (
    source.includes(
      pattern.from,
    )
  ) {
    source =
      source.replace(
        pattern.from,
        pattern.to,
      );

    changed =
      true;

    break;
  }
}

if (!changed) {
  if (
    source.includes(
      "candidate.valueEdge >= 0.12",
    ) ||
    source.includes(
      "valueEdge >= 0.12",
    )
  ) {
    console.log(
      "1X2 +12pp safety ceiling is already installed.",
    );
    process.exit(0);
  }

  throw new Error(
    "Could not find the existing +18pp 1X2 anomaly threshold. No changes were made.",
  );
}

fs.writeFileSync(
  target,
  source,
  "utf8",
);

console.log(
  "Installed 1X2 +12pp official-pick safety ceiling.",
);
console.log(
  "Existing long-shot ratio guard remains unchanged.",
);
console.log(
  `Backup: ${backup}`,
);
console.log("");
console.log(
  "Next: npm run build",
);
