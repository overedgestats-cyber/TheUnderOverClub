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
    "_paid_v3b_opponent_strength_shadow_v1",
  );

function backup(
  target,
) {
  fs.copyFileSync(
    target,
    `${target}.before-paid-v3b-shadow-v1.bak`,
  );
}

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
    backup(
      target,
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
  "src/lib/analysis/shadow-v3b.ts",
);

const clientPath =
  path.join(
    project,
    "src",
    "lib",
    "api-football",
    "client.ts",
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

const previewPath =
  path.join(
    project,
    "src",
    "app",
    "api",
    "admin",
    "analysis-v3-preview",
    "route.ts",
  );

for (
  const target of
  [
    clientPath,
    analysisPath,
    storagePath,
    previewPath,
  ]
) {
  if (
    !fs.existsSync(
      target,
    )
  ) {
    throw new Error(
      `Required target file not found: ${target}`,
    );
  }

  backup(
    target,
  );
}

/*
 * API-Football standings support.
 */
let client =
  fs.readFileSync(
    clientPath,
    "utf8",
  );

if (
  !client.includes(
    "export type ApiFootballStanding =",
  )
) {
  const marker =
    "type ApiFootballStatus = {";

  if (
    !client.includes(
      marker,
    )
  ) {
    throw new Error(
      "Could not find API client type marker.",
    );
  }

  const types =
`export type ApiFootballStanding = {
  rank: number;
  team: {
    id: number;
    name: string;
  };
  points: number;
  goalsDiff?: number;
  all: {
    played: number;
    win?: number;
    draw?: number;
    lose?: number;
    goals?: {
      for?: number;
      against?: number;
    };
  };
};

type ApiFootballStandingsResponse = {
  league?: {
    id?: number;
    name?: string;
    country?: string;
    season?: number;
    standings?: ApiFootballStanding[][];
  };
};

`;

  client =
    client.replace(
      marker,
      `${types}${marker}`,
    );
}

if (
  !client.includes(
    "export async function getStandings(",
  )
) {
  client +=
`

export async function getStandings(
  leagueId: number,
  season: number,
): Promise<ApiFootballStanding[]> {
  const response =
    await apiFootballRequest<
      ApiFootballStandingsResponse[]
    >(
      "/standings",
      {
        league: leagueId,
        season,
      },
    );

  const groups =
    response.flatMap(
      (item) =>
        item.league?.standings ??
        [],
    );

  return groups.flat();
}
`;
}

fs.writeFileSync(
  clientPath,
  client,
  "utf8",
);

console.log(
  "Patched: src/lib/api-football/client.ts",
);

/*
 * Analyze fixture: calculate shadow v3b.
 */
let analysis =
  fs.readFileSync(
    analysisPath,
    "utf8",
  );

if (
  !analysis.includes(
    '@/lib/analysis/shadow-v3b',
  )
) {
  const marker =
    'import { buildPaidV3Shadow } from "@/lib/analysis/shadow-v3";';

  if (
    !analysis.includes(
      marker,
    )
  ) {
    throw new Error(
      "v3a shadow import not found. Install v3a first.",
    );
  }

  analysis =
    analysis.replace(
      marker,
      `${marker}\nimport { buildPaidV3bShadow } from "@/lib/analysis/shadow-v3b";`,
    );
}

if (
  !analysis.includes(
    "const shadowV3b =",
  )
) {
  const marker =
`  const shadowV3 =
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

  if (
    !analysis.includes(
      marker,
    )
  ) {
    throw new Error(
      "Could not find v3a shadow block in analyze-paid-fixture.ts.",
    );
  }

  const replacement =
`${marker}

  const shadowV3b =
    await buildPaidV3bShadow({
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
      targetCompetitionName:
        fixture.competition_name,
      targetCompetitionCountry:
        fixture.competition_country,
      consensusOdds,
    });`;

  analysis =
    analysis.replace(
      marker,
      replacement,
    );
}

if (
  !analysis.includes(
    "shadowV3b,",
  )
) {
  const marker =
`    shadowV3,
    consensusOdds,`;

  if (
    !analysis.includes(
      marker,
    )
  ) {
    throw new Error(
      "Could not find shadowV3 return marker.",
    );
  }

  analysis =
    analysis.replace(
      marker,
`    shadowV3,
    shadowV3b,
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

/*
 * Store shadow v3b in existing JSON snapshot.
 */
let storage =
  fs.readFileSync(
    storagePath,
    "utf8",
  );

if (
  !storage.includes(
    "shadowV3b:",
  )
) {
  const marker =
`          shadowV3:
            analysis.shadowV3,
          home: analysis.home,`;

  if (
    !storage.includes(
      marker,
    )
  ) {
    throw new Error(
      "Could not find v3a storage marker.",
    );
  }

  storage =
    storage.replace(
      marker,
`          shadowV3:
            analysis.shadowV3,
          shadowV3b:
            analysis.shadowV3b,
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

/*
 * Preview endpoint: expose both v3a and v3b.
 */
let preview =
  fs.readFileSync(
    previewPath,
    "utf8",
  );

preview =
  preview.replace(
    `      shadowV3:
        analysis.shadowV3,`,
    `      shadowV3a:
        analysis.shadowV3,
      shadowV3b:
        analysis.shadowV3b,`,
  );

fs.writeFileSync(
  previewPath,
  preview,
  "utf8",
);

console.log(
  "Patched: src/app/api/admin/analysis-v3-preview/route.ts",
);
console.log("");
console.log(
  "Paid v3b opponent-strength shadow installed.",
);
console.log(
  "Production recommendation logic remains unchanged.",
);
console.log(
  "No SQL migration required.",
);
console.log(
  "Next: npm run build",
);
