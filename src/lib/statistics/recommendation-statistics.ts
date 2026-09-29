import "server-only";

import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  sofiaMonthKey,
  summarizePerformance,
  type PerformanceRow,
} from "@/lib/statistics/helpers";

export type StatisticsAccessTier =
  | "free"
  | "paid";

type RecommendationRow =
  PerformanceRow & {
    id: string;
    access_tier:
      StatisticsAccessTier;
    market:
      | "ou25"
      | "btts"
      | "one_x_two"
      | "double_chance";
    selection: string;
  };

function db() {
  return createAdminSupabaseClient() as any;
}

function marketBreakdown(
  rows: RecommendationRow[],
) {
  const markets = [
    "ou25",
    "btts",
    "one_x_two",
    "double_chance",
  ] as const;

  return markets.map(
    (market) => ({
      market,
      ...summarizePerformance(
        rows.filter(
          (row) =>
            row.market ===
            market,
        ),
      ),
    }),
  );
}

function monthBreakdown(
  rows: RecommendationRow[],
) {
  const monthMap =
    new Map<
      string,
      RecommendationRow[]
    >();

  for (const row of rows) {
    const month =
      sofiaMonthKey(
        row.published_at,
      );

    const bucket =
      monthMap.get(month) ??
      [];

    bucket.push(row);

    monthMap.set(
      month,
      bucket,
    );
  }

  return Array.from(
    monthMap.entries(),
  )
    .sort(
      ([first], [second]) =>
        first.localeCompare(second),
    )
    .map(
      ([month, monthRows]) => ({
        month,
        ...summarizePerformance(
          monthRows,
        ),
      }),
    );
}

async function loadPaidRecommendations(): Promise<
  RecommendationRow[]
> {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from("recommendations")
    .select(
      [
        "id",
        "access_tier",
        "market",
        "selection",
        "odds",
        "published_at",
        "result_status",
        "unit_profit",
      ].join(","),
    )
    .eq(
      "access_tier",
      "paid",
    )
    .order(
      "published_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `Could not load paid recommendation statistics: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as RecommendationRow[];
}

async function loadFreePicks(): Promise<
  RecommendationRow[]
> {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "free_pick_publications",
    )
    .select(
      [
        "id",
        "market",
        "selection",
        "odds",
        "published_at",
        "result_status",
        "unit_profit",
      ].join(","),
    )
    .order(
      "published_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `Could not load Free Picks statistics: ${error.message}`,
    );
  }

  return (
    data ?? []
  ).map(
    (row: any) => ({
      ...row,
      access_tier:
        "free" as const,
    }),
  ) as RecommendationRow[];
}

export async function getRecommendationStatistics(
  accessTier:
    StatisticsAccessTier,
) {
  const rows =
    accessTier === "free"
      ? await loadFreePicks()
      : await loadPaidRecommendations();

  return {
    generatedAt:
      new Date().toISOString(),
    timezone:
      "Europe/Sofia",
    accessTier,
    stakingModel:
      "1 unit per pick",
    definitions: {
      winRate:
        "wins / (wins + losses); voids excluded",
      roi:
        "net unit profit / priced settled stakes",
      unitsProfit:
        "win = odds - 1, loss = -1, void = 0; unpriced Free Picks excluded from unit/ROI calculations",
    },
    overall:
      summarizePerformance(rows),
    byMarket:
      marketBreakdown(rows),
    byMonth:
      monthBreakdown(rows),
  };
}

export async function getCombinedStatistics() {
  const [
    freeRows,
    paidRows,
  ] = await Promise.all([
    loadFreePicks(),
    loadPaidRecommendations(),
  ]);

  const rows = [
    ...freeRows,
    ...paidRows,
  ];

  return {
    generatedAt:
      new Date().toISOString(),
    timezone:
      "Europe/Sofia",
    combined:
      summarizePerformance(rows),
    free:
      summarizePerformance(
        freeRows,
      ),
    paid:
      summarizePerformance(
        paidRows,
      ),
    byMonth:
      monthBreakdown(rows),
  };
}
