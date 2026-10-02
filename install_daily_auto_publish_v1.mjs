import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    "_daily_auto_publish_v1",
  );

const files = [
  "src/lib/automation/daily-publish.ts",
  "src/app/api/cron/daily-publish/route.ts",
];

for (const relative of files) {
  const source =
    path.join(
      packageRoot,
      relative,
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
      `Missing package file: ${source}`,
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

  if (
    fs.existsSync(
      target,
    )
  ) {
    fs.copyFileSync(
      target,
      `${target}.before-daily-auto-publish-v1.bak`,
    );
  }

  fs.copyFileSync(
    source,
    target,
  );

  console.log(
    `Installed: ${relative}`,
  );
}

const vercelPath =
  path.join(
    project,
    "vercel.json",
  );

let config = {
  $schema:
    "https://openapi.vercel.sh/vercel.json",
};

if (
  fs.existsSync(
    vercelPath,
  )
) {
  fs.copyFileSync(
    vercelPath,
    `${vercelPath}.before-daily-auto-publish-v1.bak`,
  );

  const raw =
    fs.readFileSync(
      vercelPath,
      "utf8",
    );

  config =
    JSON.parse(
      raw,
    );
}

const currentCrons =
  Array.isArray(
    config.crons,
  )
    ? config.crons
    : [];

config.crons = [
  ...currentCrons.filter(
    (cron) =>
      cron?.path !==
      "/api/cron/daily-publish",
  ),
  {
    path:
      "/api/cron/daily-publish",
    schedule:
      "0 3 * * *",
  },
];

if (
  !config.$schema
) {
  config.$schema =
    "https://openapi.vercel.sh/vercel.json";
}

fs.writeFileSync(
  vercelPath,
  `${JSON.stringify(
    config,
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  "Updated: vercel.json",
);
console.log("");
console.log(
  "Daily auto-publish installed.",
);
console.log(
  "Schedule: 03:00 UTC every day.",
);
console.log(
  "Next: npm run build",
);
