export type PickResult =
  | "pending"
  | "won"
  | "lost"
  | "void";

export type PerformanceRow = {
  odds: number | null;
  result_status: PickResult;
  unit_profit: number | null;
  published_at: string;
};

export type PerformanceSummary = {
  totalPicks: number;
  settledPicks: number;
  resolvedPicks: number;
  pendingPicks: number;
  won: number;
  lost: number;
  void: number;
  winRatePct: number;
  unitsProfit: number;
  roiPct: number;
  averageOdds: number | null;
  currentStreak: {
    result: "won" | "lost" | null;
    count: number;
  };
};

export function round(
  value: number,
  digits = 2,
): number {
  const multiplier = 10 ** digits;

  return (
    Math.round(
      (value + Number.EPSILON) *
        multiplier,
    ) / multiplier
  );
}

export function sofiaMonthKey(
  isoDate: string,
): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/Sofia",
        year: "numeric",
        month: "2-digit",
      },
    ).formatToParts(
      new Date(isoDate),
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value ?? "0000";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "00";

  return `${year}-${month}`;
}

function currentStreak(
  rows: PerformanceRow[],
) {
  const resolved = rows
    .filter(
      (row) =>
        row.result_status ===
          "won" ||
        row.result_status ===
          "lost",
    )
    .sort(
      (first, second) =>
        new Date(
          second.published_at,
        ).getTime() -
        new Date(
          first.published_at,
        ).getTime(),
    );

  if (resolved.length === 0) {
    return {
      result: null,
      count: 0,
    } as const;
  }

  const result =
    resolved[0].result_status as
      | "won"
      | "lost";

  let count = 0;

  for (const row of resolved) {
    if (
      row.result_status !== result
    ) {
      break;
    }

    count += 1;
  }

  return {
    result,
    count,
  };
}

export function summarizePerformance(
  rows: PerformanceRow[],
): PerformanceSummary {
  const won =
    rows.filter(
      (row) =>
        row.result_status ===
        "won",
    ).length;

  const lost =
    rows.filter(
      (row) =>
        row.result_status ===
        "lost",
    ).length;

  const voidCount =
    rows.filter(
      (row) =>
        row.result_status ===
        "void",
    ).length;

  const pending =
    rows.filter(
      (row) =>
        row.result_status ===
        "pending",
    ).length;

  const settled =
    won + lost + voidCount;

  const resolved =
    won + lost;

  const settledRows =
    rows.filter(
      (row) =>
        row.result_status !==
        "pending",
    );

  const pricedSettled =
    settledRows.filter(
      (row) =>
        row.odds !== null &&
        row.unit_profit !== null,
    );

  const unitsProfit =
    pricedSettled.reduce(
      (sum, row) =>
        sum +
        Number(
          row.unit_profit ?? 0,
        ),
      0,
    );

  const totalStakeUnits =
    pricedSettled.length;

  const oddsRows =
    rows.filter(
      (row) =>
        row.odds !== null,
    );

  const averageOdds =
    oddsRows.length > 0
      ? oddsRows.reduce(
          (sum, row) =>
            sum +
            Number(row.odds),
          0,
        ) / oddsRows.length
      : null;

  return {
    totalPicks: rows.length,
    settledPicks: settled,
    resolvedPicks: resolved,
    pendingPicks: pending,
    won,
    lost,
    void: voidCount,
    winRatePct:
      resolved > 0
        ? round(
            (won / resolved) *
              100,
          )
        : 0,
    unitsProfit:
      round(unitsProfit),
    roiPct:
      totalStakeUnits > 0
        ? round(
            (unitsProfit /
              totalStakeUnits) *
              100,
          )
        : 0,
    averageOdds:
      averageOdds === null
        ? null
        : round(
            averageOdds,
          ),
    currentStreak:
      currentStreak(rows),
  };
}
