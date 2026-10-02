import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  summarizePerformance,
  type PerformanceRow,
} from "@/lib/statistics/helpers";

type TrackingRow = PerformanceRow & {
  market:
    | "ou25"
    | "btts"
    | "one_x_two"
    | "double_chance";
  selection: string;
  model_probability: number;
  fair_bookmaker_probability:
    | number
    | null;
  fair_value_edge:
    | number
    | null;
  confidence: number;
  data_quality_score:
    | number
    | null;
  qualifies: boolean;
  is_official_pick: boolean;
  model_version: string;
};

function db() {
  return createAdminSupabaseClient() as any;
}

function groupSummary(
  rows: TrackingRow[],
  groups: Array<{
    key: string;
    matches:
      (row: TrackingRow) =>
        boolean;
  }>,
) {
  return groups.map(
    (group) => ({
      group: group.key,
      ...summarizePerformance(
        rows.filter(
          group.matches,
        ),
      ),
    }),
  );
}

export async function getModelStatistics() {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "market_analysis_snapshots",
    )
    .select(
      [
        "market",
        "selection",
        "odds",
        "model_probability",
        "fair_bookmaker_probability",
        "fair_value_edge",
        "confidence",
        "data_quality_score",
        "qualifies",
        "is_official_pick",
        "model_version",
        "published_at",
        "result_status",
        "unit_profit",
      ].join(","),
    )
    .order("published_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load model tracking statistics: ${error.message}`,
    );
  }

  const rows =
    (data ?? []) as TrackingRow[];

  const byMarket =
    groupSummary(
      rows,
      [
        "ou25",
        "btts",
        "one_x_two",
        "double_chance",
      ].map(
        (market) => ({
          key: market,
          matches:
            (row: TrackingRow) =>
              row.market === market,
        }),
      ),
    );

  const byQualification =
    groupSummary(
      rows,
      [
        {
          key: "qualified",
          matches:
            (row: TrackingRow) =>
              row.qualifies,
        },
        {
          key: "not_qualified",
          matches:
            (row: TrackingRow) =>
              !row.qualifies,
        },
        {
          key: "official_pick",
          matches:
            (row: TrackingRow) =>
              row.is_official_pick,
        },
      ],
    );

  const byConfidence =
    groupSummary(
      rows,
      [
        {
          key: "below_75",
          matches:
            (row) =>
              row.confidence <
              0.75,
        },
        {
          key: "75_to_80",
          matches:
            (row) =>
              row.confidence >=
                0.75 &&
              row.confidence <
                0.8,
        },
        {
          key: "80_to_90",
          matches:
            (row) =>
              row.confidence >=
                0.8 &&
              row.confidence <
                0.9,
        },
        {
          key: "90_plus",
          matches:
            (row) =>
              row.confidence >=
              0.9,
        },
      ],
    );

  const byValueEdge =
    groupSummary(
      rows,
      [
        {
          key: "negative",
          matches:
            (row) =>
              row.fair_value_edge !==
                null &&
              row.fair_value_edge <
                0,
        },
        {
          key: "0_to_5",
          matches:
            (row) =>
              row.fair_value_edge !==
                null &&
              row.fair_value_edge >=
                0 &&
              row.fair_value_edge <
                0.05,
        },
        {
          key: "5_to_10",
          matches:
            (row) =>
              row.fair_value_edge !==
                null &&
              row.fair_value_edge >=
                0.05 &&
              row.fair_value_edge <
                0.1,
        },
        {
          key: "10_to_15",
          matches:
            (row) =>
              row.fair_value_edge !==
                null &&
              row.fair_value_edge >=
                0.1 &&
              row.fair_value_edge <
                0.15,
        },
        {
          key: "15_plus",
          matches:
            (row) =>
              row.fair_value_edge !==
                null &&
              row.fair_value_edge >=
                0.15,
        },
        {
          key: "no_fair_edge",
          matches:
            (row) =>
              row.fair_value_edge ===
              null,
        },
      ],
    );

  const byOdds =
    groupSummary(
      rows,
      [
        {
          key: "below_1_50",
          matches:
            (row) =>
              row.odds !== null &&
              row.odds < 1.5,
        },
        {
          key: "1_50_to_2_00",
          matches:
            (row) =>
              row.odds !== null &&
              row.odds >= 1.5 &&
              row.odds < 2,
        },
        {
          key: "2_00_to_3_00",
          matches:
            (row) =>
              row.odds !== null &&
              row.odds >= 2 &&
              row.odds < 3,
        },
        {
          key: "3_00_plus",
          matches:
            (row) =>
              row.odds !== null &&
              row.odds >= 3,
        },
        {
          key: "no_odds",
          matches:
            (row) =>
              row.odds === null,
        },
      ],
    );

  const modelVersions =
    Array.from(
      new Set(
        rows.map(
          (row) =>
            row.model_version,
        ),
      ),
    ).sort();

  const byModelVersion =
    groupSummary(
      rows,
      modelVersions.map(
        (version) => ({
          key: version,
          matches:
            (row: TrackingRow) =>
              row.model_version ===
              version,
        }),
      ),
    );

  return {
    generatedAt:
      new Date().toISOString(),
    timezone:
      "Europe/Sofia",
    overall:
      summarizePerformance(
        rows,
      ),
    byMarket,
    byQualification,
    byConfidence,
    byValueEdge,
    byOdds,
    byModelVersion,
  };
}
