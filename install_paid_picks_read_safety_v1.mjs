import fs from "node:fs";
import path from "node:path";

const project =
  "C:\\Users\\Marty\\Desktop\\theunderoverclub";

const recommendationsPath =
  path.join(
    project,
    "src",
    "lib",
    "analysis",
    "recommendations.ts",
  );

const publicPaidPicksPath =
  path.join(
    project,
    "src",
    "lib",
    "paid-picks",
    "public-paid-picks.ts",
  );

for (const target of [
  recommendationsPath,
  publicPaidPicksPath,
]) {
  if (!fs.existsSync(target)) {
    throw new Error(
      `Required file not found: ${target}`,
    );
  }

  fs.copyFileSync(
    target,
    `${target}.before-paid-picks-read-safety-v1.bak`,
  );
}

/*
 * 1. Export the SAME anomaly helper already used when official picks
 *    are created. This prevents read-time filtering rules from drifting.
 */
let recommendations =
  fs.readFileSync(
    recommendationsPath,
    "utf8",
  );

if (
  !recommendations.includes(
    "export function oneXTwoAnomalyReason(",
  )
) {
  if (
    !recommendations.includes(
      "function oneXTwoAnomalyReason(",
    )
  ) {
    throw new Error(
      "Could not find oneXTwoAnomalyReason() in recommendations.ts.",
    );
  }

  recommendations =
    recommendations.replace(
      "function oneXTwoAnomalyReason(",
      "export function oneXTwoAnomalyReason(",
    );

  fs.writeFileSync(
    recommendationsPath,
    recommendations,
    "utf8",
  );

  console.log(
    "Exported oneXTwoAnomalyReason from recommendations.ts",
  );
} else {
  console.log(
    "oneXTwoAnomalyReason is already exported.",
  );
}

/*
 * 2. Apply the current official-pick 1X2 anomaly rules again when
 *    customer-facing paid picks are read.
 *
 *    IMPORTANT:
 *    - DB rows are NOT deleted or modified.
 *    - settlement/tracking/calibration remain intact.
 *    - only the customer-facing Paid Picks response is filtered.
 */
let publicPaidPicks =
  fs.readFileSync(
    publicPaidPicksPath,
    "utf8",
  );

if (
  !publicPaidPicks.includes(
    '@/lib/analysis/recommendations',
  )
) {
  const importMarker =
`import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";`;

  if (
    !publicPaidPicks.includes(
      importMarker,
    )
  ) {
    throw new Error(
      "Could not find Supabase import marker in public-paid-picks.ts.",
    );
  }

  publicPaidPicks =
    publicPaidPicks.replace(
      importMarker,
`${importMarker}
import {
  oneXTwoAnomalyReason,
} from "@/lib/analysis/recommendations";`,
    );
}

if (
  !publicPaidPicks.includes(
    "const visibleRows =",
  )
) {
  const rowsMarker =
`  const rows =
    (
      recommendationData ??
      []
    ) as RecommendationRow[];`;

  if (
    !publicPaidPicks.includes(
      rowsMarker,
    )
  ) {
    throw new Error(
      "Could not find recommendation rows marker in public-paid-picks.ts.",
    );
  }

  const replacement =
`${rowsMarker}

  const visibleRows =
    rows.filter(
      (
        row:
          RecommendationRow,
      ) => {
        const modelProbability =
          Number(
            row.model_probability,
          );

        const bookmakerProbability =
          row.fair_bookmaker_probability ===
          null
            ? null
            : Number(
                row.fair_bookmaker_probability,
              );

        const valueEdge =
          row.fair_value_edge ===
          null
            ? null
            : Number(
                row.fair_value_edge,
              );

        return (
          oneXTwoAnomalyReason({
            market:
              String(
                row.market,
              ) as
                | "ou25"
                | "btts"
                | "double_chance"
                | "one_x_two",
            modelProbability,
            bookmakerProbability,
            valueEdge,
          }) ===
          null
        );
      },
    );`;

  publicPaidPicks =
    publicPaidPicks.replace(
      rowsMarker,
      replacement,
    );
}

/*
 * Only replace the two downstream read uses:
 * - fixture ID collection
 * - PaidPick[] mapping
 */
if (
  publicPaidPicks.includes(
    "visibleRows.map",
  )
) {
  console.log(
    "visibleRows is already used downstream.",
  );
} else {
  const fixtureIdsMarker =
`        rows.map(
          (row) =>
            row.fixture_id,
        ),`;

  if (
    !publicPaidPicks.includes(
      fixtureIdsMarker,
    )
  ) {
    throw new Error(
      "Could not find fixtureIds rows.map marker.",
    );
  }

  publicPaidPicks =
    publicPaidPicks.replace(
      fixtureIdsMarker,
`        visibleRows.map(
          (row) =>
            row.fixture_id,
        ),`,
    );

  const picksMarker =
`    rows.map(
      (
        row:
          RecommendationRow,
      ): PaidPick => {`;

  if (
    !publicPaidPicks.includes(
      picksMarker,
    )
  ) {
    throw new Error(
      "Could not find picks rows.map marker.",
    );
  }

  publicPaidPicks =
    publicPaidPicks.replace(
      picksMarker,
`    visibleRows.map(
      (
        row:
          RecommendationRow,
      ): PaidPick => {`,
    );
}

fs.writeFileSync(
  publicPaidPicksPath,
  publicPaidPicks,
  "utf8",
);

console.log(
  "Patched customer-facing Paid Picks read safety.",
);
console.log("");
console.log(
  "Database rows remain immutable and unchanged.",
);
console.log(
  "Unsafe stored 1X2 recommendations are hidden only from the Paid Picks response.",
);
console.log(
  "Next: npm run build",
);
