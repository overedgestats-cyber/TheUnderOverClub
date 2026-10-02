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
    "_paid_v3a_shadow_v1",
  );

function installFile(
  relative,
) {
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
      `${target}.before-paid-v3a-shadow-v1.bak`,
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

installFile(
  "src/lib/analysis/shadow-v3.ts",
);

installFile(
  "src/app/api/admin/analysis-v3-preview/route.ts",
);

const analysisPath =
  path.join(
    project,
    "src",
    "lib",
    "analysis",
    "analyze-paid-fixture.ts",
  );

const storagePath =
  path.join(
    project,
    "src",
    "lib",
    "analysis",
    "store-paid-analysis.ts",
  );

for (
  const target of
  [
    analysisPath,
    storagePath,
  ]
) {
  if (
    !fs.existsSync(
      target,
    )
  ) {
    throw new Error(
      `Target file not found: ${target}`,
    );
  }

  fs.copyFileSync(
    target,
    `${target}.before-paid-v3a-shadow-v1.bak`,
  );
}

let analysis =
  fs.readFileSync(
    analysisPath,
    "utf8",
  );

if (
  !analysis.includes(
    '@/lib/analysis/shadow-v3',
  )
) {
  const importMarker =
    'import { analyzeTeamForm } from "@/lib/analysis/team-form";';

  if (
    !analysis.includes(
      importMarker,
    )
  ) {
    throw new Error(
      "Could not find analyzeTeamForm import marker.",
    );
  }

  analysis =
    analysis.replace(
      importMarker,
      `${importMarker}\nimport { buildPaidV3Shadow } from "@/lib/analysis/shadow-v3";`,
    );
}

if (
  !analysis.includes(
    "const shadowV3 =",
  )
) {
  const marker =
    `  const consensusOdds =\n    buildConsensusOdds(oddsResponse);`;

  if (
    !analysis.includes(
      marker,
    )
  ) {
    throw new Error(
      "Could not find consensusOdds marker in analyze-paid-fixture.ts.",
    );
  }

  const addition =
`${marker}

  const shadowV3 =
    buildPaidV3Shadow({
      homeHistory,
      awayHistory,
      homeTeamId:
        fixture.home_team_id,
      awayTeamId:
        fixture.away_team_id,
      targetFixtureId:
        fixture.provider_fixture_id,
      targetKickoff:
        fixture.kickoff_at,
      consensusOdds,
    });`;

  analysis =
    analysis.replace(
      marker,
      addition,
    );
}

if (
  !analysis.includes(
    "shadowV3,",
  )
) {
  const returnMarker =
`    probabilityComponents:
      components,
    consensusOdds,`;

  if (
    !analysis.includes(
      returnMarker,
    )
  ) {
    throw new Error(
      "Could not find return marker in analyze-paid-fixture.ts.",
    );
  }

  analysis =
    analysis.replace(
      returnMarker,
`    probabilityComponents:
      components,
    shadowV3,
    consensusOdds,`,
    );
}

fs.writeFileSync(
  analysisPath,
  analysis,
  "utf8",
);

console.log(
  "Patched: src/lib/analysis/analyze-paid-fixture.ts",
);

let storage =
  fs.readFileSync(
    storagePath,
    "utf8",
  );

if (
  !storage.includes(
    "shadowV3: analysis.shadowV3",
  )
) {
  const marker =
`          probabilityComponents:
            analysis.probabilityComponents,
          home: analysis.home,`;

  if (
    !storage.includes(
      marker,
    )
  ) {
    throw new Error(
      "Could not find analysis_snapshot marker in store-paid-analysis.ts.",
    );
  }

  storage =
    storage.replace(
      marker,
`          probabilityComponents:
            analysis.probabilityComponents,
          shadowV3:
            analysis.shadowV3,
          home: analysis.home,`,
    );
}

fs.writeFileSync(
  storagePath,
  storage,
  "utf8",
);

console.log(
  "Patched: src/lib/analysis/store-paid-analysis.ts",
);
console.log("");
console.log(
  "Paid v3a shadow installed.",
);
console.log(
  "Production recommendations are NOT changed.",
);
console.log(
  "No SQL migration is required.",
);
console.log(
  "Next: npm run build",
);
