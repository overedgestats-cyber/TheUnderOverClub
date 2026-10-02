import "server-only";

import {
  oneXTwoSanityReason,
} from "@/lib/analysis/recommendations";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

export type PaidPick = {
  id: string;
  rank: number;
  fixtureId: number | null;
  competition: string;
  country: string | null;
  kickoffAt: string | null;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  market: string;
  selection: string;
  odds: number;
  bookmakerName: string | null;
  modelProbabilityPct: number;
  fairBookmakerProbabilityPct: number | null;
  confidencePct: number;
  confidenceLabel: string | null;
  fairValueEdgePct: number | null;
  dataQualityPct: number | null;
  expectedGoalsTotal: number | null;
  analysisReasons: string[];
  resultStatus: string;
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  unitProfit: number | null;
};

export type PaidPicksBoard = {
  date: string;
  publishedAt: string | null;
  picks: PaidPick[];
};

type RecommendationRow = {
  id: string;
  fixture_id: string;
  market: string;
  selection: string;
  rank_position: number;
  odds: number | string;
  bookmaker_name: string | null;
  model_probability: number | string;
  fair_bookmaker_probability: number | string | null;
  fair_value_edge: number | string | null;
  confidence: number | string;
  confidence_label: string | null;
  data_quality_score: number | string | null;
  analysis_snapshot: Record<string, unknown> | null;
  result_status: string;
  final_home_score: number | null;
  final_away_score: number | null;
  unit_profit: number | string | null;
  published_at: string;
};

type FixtureRow = {
  id: string;
  provider_fixture_id: number;
  competition_name: string;
  competition_country: string | null;
  kickoff_at: string;
  home_team_name: string;
  away_team_name: string;
  home_team_logo_url: string | null;
  away_team_logo_url: string | null;
};

type PublicationRunRow = {
  id: string;
  publication_date: string;
  published_at: string | null;
};

function db() {
  return createAdminSupabaseClient() as any;
}

function marketLabel(
  market: string,
) {
  const map: Record<string, string> = {
    ou25: "O/U 2.5",
    btts: "BTTS",
    one_x_two: "1X2",
    double_chance: "Double Chance",
  };

  return map[market] ?? market;
}

function selectionLabel(
  selection: string,
) {
  const normalized = selection.toLowerCase();

  const map: Record<string, string> = {
    over_2_5: "Over 2.5",
    under_2_5: "Under 2.5",
    btts_yes: "BTTS Yes",
    btts_no: "BTTS No",
    yes: "BTTS Yes",
    no: "BTTS No",
    home: "Home",
    draw: "Draw",
    away: "Away",
    "1x": "1X",
    "12": "12",
    x2: "X2",
  };

  return map[normalized] ?? selection;
}

function percentage(
  value: number | string,
) {
  return (
    Math.round(
      Number(value) * 1000,
    ) / 10
  );
}

function nullableNumber(
  value: number | string | null,
) {
  if (value === null) {
    return null;
  }

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function nestedNumber(
  value: unknown,
  path: string[],
): number | null {
  let current: unknown = value;

  for (const key of path) {
    if (
      !current ||
      typeof current !== "object" ||
      !(key in current)
    ) {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  const number = Number(current);

  return Number.isFinite(number)
    ? number
    : null;
}

function paidAnalysisReasons({
  market,
  selection,
  modelProbabilityPct,
  fairBookmakerProbabilityPct,
  fairValueEdgePct,
  confidencePct,
  dataQualityPct,
  expectedGoalsTotal,
}: {
  market: string;
  selection: string;
  modelProbabilityPct: number;
  fairBookmakerProbabilityPct: number | null;
  fairValueEdgePct: number | null;
  confidencePct: number;
  dataQualityPct: number | null;
  expectedGoalsTotal: number | null;
}) {
  const reasons: string[] = [];

  reasons.push(
    `Model probability for ${selection}: ${modelProbabilityPct.toFixed(1)}%.`,
  );

  if (
    fairBookmakerProbabilityPct !== null &&
    fairValueEdgePct !== null
  ) {
    reasons.push(
      `Fair market probability is ${fairBookmakerProbabilityPct.toFixed(1)}%, giving a model edge of ${fairValueEdgePct >= 0 ? "+" : ""}${fairValueEdgePct.toFixed(1)} percentage points.`,
    );
  }

  if (
    market === "O/U 2.5" &&
    expectedGoalsTotal !== null
  ) {
    reasons.push(
      `Expected-goals projection: ${expectedGoalsTotal.toFixed(2)} total goals.`,
    );
  }

  reasons.push(
    `Model confidence is ${confidencePct.toFixed(1)}%. Confidence measures model/data consistency; it is not the predicted chance of the bet winning.`,
  );

  if (dataQualityPct !== null) {
    reasons.push(
      `Data-quality score at publication: ${dataQualityPct.toFixed(1)}%.`,
    );
  }

  return reasons.slice(0, 4);
}

async function findRun(
  date: string,
): Promise<PublicationRunRow | null> {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from("publication_runs")
    .select(
      "id,publication_date,published_at",
    )
    .eq("board_kind", "paid")
    .eq("publication_date", date)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load paid publication run: ${error.message}`,
    );
  }

  return (
    data ?? null
  ) as PublicationRunRow | null;
}

export async function getPaidPicks(
  date = getSofiaDate(),
): Promise<PaidPicksBoard> {
  const run = await findRun(date);

  if (!run) {
    return {
      date,
      publishedAt: null,
      picks: [],
    };
  }

  const client = db();

  const {
    data: recommendationData,
    error: recommendationError,
  } = await client
    .from("recommendations")
    .select(
      [
        "id",
        "fixture_id",
        "market",
        "selection",
        "rank_position",
        "odds",
        "bookmaker_name",
        "model_probability",
        "fair_bookmaker_probability",
        "fair_value_edge",
        "confidence",
        "confidence_label",
        "data_quality_score",
        "analysis_snapshot",
        "result_status",
        "final_home_score",
        "final_away_score",
        "unit_profit",
        "published_at",
      ].join(","),
    )
    .eq("publication_run_id", run.id)
    .eq("access_tier", "paid")
    .order(
      "rank_position",
      {
        ascending: true,
      },
    );

  if (recommendationError) {
    throw new Error(
      `Could not load paid recommendations: ${recommendationError.message}`,
    );
  }

  const rows =
    (recommendationData ?? []) as RecommendationRow[];

  /*
   * Re-check the CURRENT 1X2 safety rules on read.
   * Historical immutable rows remain in Supabase for settlement/calibration,
   * but an unsafe old 1X2 recommendation is not shown to customers.
   */
  const visibleRows = rows.filter(
    (row) => {
      const bookmakerProbability =
        row.fair_bookmaker_probability === null
          ? null
          : Number(row.fair_bookmaker_probability);

      const valueEdge =
        row.fair_value_edge === null
          ? null
          : Number(row.fair_value_edge);

      return (
        oneXTwoSanityReason({
          market: String(row.market) as
            | "ou25"
            | "btts"
            | "double_chance"
            | "one_x_two",
          modelProbability: Number(row.model_probability),
          bookmakerProbability,
          valueEdge,
        }) === null
      );
    },
  );

  const fixtureIds = Array.from(
    new Set(
      visibleRows.map(
        (row) => row.fixture_id,
      ),
    ),
  );

  let fixtures: FixtureRow[] = [];

  if (fixtureIds.length > 0) {
    const {
      data: fixtureData,
      error,
    } = await client
      .from("fixtures")
      .select(
        [
          "id",
          "provider_fixture_id",
          "competition_name",
          "competition_country",
          "kickoff_at",
          "home_team_name",
          "away_team_name",
          "home_team_logo_url",
          "away_team_logo_url",
        ].join(","),
      )
      .in("id", fixtureIds);

    if (error) {
      throw new Error(
        `Could not load paid fixtures: ${error.message}`,
      );
    }

    fixtures =
      (fixtureData ?? []) as FixtureRow[];
  }

  const fixtureMap =
    new Map<string, FixtureRow>(
      fixtures.map(
        (fixture) => [
          fixture.id,
          fixture,
        ],
      ),
    );

  const picks: PaidPick[] =
    visibleRows.map(
      (
        row: RecommendationRow,
      ): PaidPick => {
        const fixture =
          fixtureMap.get(
            row.fixture_id,
          );

        const market =
          marketLabel(
            String(row.market),
          );

        const selection =
          selectionLabel(
            String(row.selection),
          );

        const modelProbabilityPct =
          percentage(
            row.model_probability,
          );

        const fairBookmakerProbabilityPct =
          row.fair_bookmaker_probability === null
            ? null
            : percentage(
                row.fair_bookmaker_probability,
              );

        const fairValueEdgePct =
          row.fair_value_edge === null
            ? null
            : percentage(
                row.fair_value_edge,
              );

        const confidencePct =
          percentage(
            row.confidence,
          );

        const dataQualityPct =
          row.data_quality_score === null
            ? null
            : percentage(
                row.data_quality_score,
              );

        const expectedGoalsTotal =
          nestedNumber(
            row.analysis_snapshot,
            [
              "expectedGoals",
              "total",
            ],
          );

        return {
          id: row.id,
          rank:
            Number(
              row.rank_position,
            ),
          fixtureId:
            fixture?.provider_fixture_id ??
            null,
          competition:
            fixture?.competition_name ??
            "Competition",
          country:
            fixture?.competition_country ??
            null,
          kickoffAt:
            fixture?.kickoff_at ??
            null,
          home:
            fixture?.home_team_name ??
            "Home",
          away:
            fixture?.away_team_name ??
            "Away",
          homeLogo:
            fixture?.home_team_logo_url ??
            null,
          awayLogo:
            fixture?.away_team_logo_url ??
            null,
          market,
          selection,
          odds:
            Number(
              row.odds,
            ),
          bookmakerName:
            row.bookmaker_name ??
            null,
          modelProbabilityPct,
          fairBookmakerProbabilityPct,
          confidencePct,
          confidenceLabel:
            row.confidence_label ??
            null,
          fairValueEdgePct,
          dataQualityPct,
          expectedGoalsTotal,
          analysisReasons:
            paidAnalysisReasons({
              market,
              selection,
              modelProbabilityPct,
              fairBookmakerProbabilityPct,
              fairValueEdgePct,
              confidencePct,
              dataQualityPct,
              expectedGoalsTotal,
            }),
          resultStatus:
            row.result_status,
          finalHomeScore:
            row.final_home_score,
          finalAwayScore:
            row.final_away_score,
          unitProfit:
            nullableNumber(
              row.unit_profit,
            ),
        };
      },
    );

  return {
    date,
    publishedAt:
      run.published_at ??
      null,
    picks,
  };
}
