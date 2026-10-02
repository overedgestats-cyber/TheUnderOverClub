import type {
  ApiFootballFixture,
} from "@/lib/api-football/client";

export type OverEdgeTeamMetrics = {
  games: number;
  avgFor: number;
  avgAg: number;
  over25Rate: number;
  under25Rate: number;
  ppg: number;
  cleanSheetRate: number;
  failToScoreRate: number;
};

export type OverEdgeFreeCandidate = {
  selection:
    | "over_2_5"
    | "under_2_5";
  displaySelection:
    | "Over 2.5"
    | "Under 2.5";
  sideProbability: number;
  modelProbabilityPct: number;
  confidence: number;
  confidencePct: number;
  metrics: {
    home: OverEdgeTeamMetrics;
    away: OverEdgeTeamMetrics;
  };
};

function clamp01(
  value: number,
) {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function pct(
  value: number,
) {
  return Math.round(
    Math.max(
      1,
      Math.min(
        99,
        clamp01(value) * 100,
      ),
    ),
  );
}

function calculateMetrics({
  fixtures,
  teamId,
  targetFixtureId,
  targetKickoff,
  sampleSize = 12,
}: {
  fixtures: ApiFootballFixture[];
  teamId: number;
  targetFixtureId: number;
  targetKickoff: string;
  sampleSize?: number;
}): OverEdgeTeamMetrics {
  const cutoff =
    new Date(
      targetKickoff,
    ).getTime();

  const rows = fixtures
    .filter(
      (fixture) =>
        fixture.fixture.id !==
          targetFixtureId &&
        new Date(
          fixture.fixture.date,
        ).getTime() < cutoff &&
        fixture.goals.home !==
          null &&
        fixture.goals.away !==
          null,
    )
    .sort(
      (first, second) =>
        new Date(
          second.fixture.date,
        ).getTime() -
        new Date(
          first.fixture.date,
        ).getTime(),
    )
    .slice(0, sampleSize);

  let goalsFor = 0;
  let goalsAgainst = 0;
  let over25 = 0;
  let under25 = 0;
  let wins = 0;
  let draws = 0;
  let cleanSheets = 0;
  let failedToScore = 0;

  for (const row of rows) {
    const homeGoals =
      row.goals.home ?? 0;

    const awayGoals =
      row.goals.away ?? 0;

    const isHome =
      row.teams.home.id ===
      teamId;

    const teamGoals =
      isHome
        ? homeGoals
        : awayGoals;

    const opponentGoals =
      isHome
        ? awayGoals
        : homeGoals;

    goalsFor += teamGoals;
    goalsAgainst +=
      opponentGoals;

    if (
      homeGoals + awayGoals >=
      3
    ) {
      over25 += 1;
    }

    if (
      homeGoals + awayGoals <=
      2
    ) {
      under25 += 1;
    }

    if (
      teamGoals >
      opponentGoals
    ) {
      wins += 1;
    } else if (
      teamGoals ===
      opponentGoals
    ) {
      draws += 1;
    }

    if (opponentGoals === 0) {
      cleanSheets += 1;
    }

    if (teamGoals === 0) {
      failedToScore += 1;
    }
  }

  const games = rows.length;

  if (games === 0) {
    return {
      games: 0,
      avgFor: 0,
      avgAg: 0,
      over25Rate: 0,
      under25Rate: 0,
      ppg: 0,
      cleanSheetRate: 0,
      failToScoreRate: 0,
    };
  }

  return {
    games,
    avgFor:
      goalsFor / games,
    avgAg:
      goalsAgainst / games,
    over25Rate:
      over25 / games,
    under25Rate:
      under25 / games,
    ppg:
      (
        wins * 3 +
        draws
      ) / games,
    cleanSheetRate:
      cleanSheets / games,
    failToScoreRate:
      failedToScore / games,
  };
}

// Original OverEdge Free Picks confidence formula.
function calibratedConfidence(
  sideProbability: number,
  home: OverEdgeTeamMetrics,
  away: OverEdgeTeamMetrics,
) {
  const volatility =
    0.5 *
      Math.abs(
        home.avgFor -
          away.avgFor,
      ) +
    0.2 *
      Math.abs(
        home.ppg -
          away.ppg,
      ) +
    0.1 *
      Math.abs(
        home.cleanSheetRate -
          away.cleanSheetRate,
      ) +
    0.1 *
      Math.abs(
        home.failToScoreRate -
          away.failToScoreRate,
      );

  const base =
    0.5 +
    (
      sideProbability -
      0.5
    ) *
      1.35 -
    0.1 * volatility;

  return Math.max(
    0.53,
    Math.min(
      0.9,
      base,
    ),
  );
}

export function scoreOverEdgeFreePick({
  homeHistory,
  awayHistory,
  homeTeamId,
  awayTeamId,
  fixtureId,
  kickoffAt,
}: {
  homeHistory:
    ApiFootballFixture[];
  awayHistory:
    ApiFootballFixture[];
  homeTeamId: number;
  awayTeamId: number;
  fixtureId: number;
  kickoffAt: string;
}): OverEdgeFreeCandidate | null {
  const home =
    calculateMetrics({
      fixtures:
        homeHistory,
      teamId:
        homeTeamId,
      targetFixtureId:
        fixtureId,
      targetKickoff:
        kickoffAt,
    });

  const away =
    calculateMetrics({
      fixtures:
        awayHistory,
      teamId:
        awayTeamId,
      targetFixtureId:
        fixtureId,
      targetKickoff:
        kickoffAt,
    });

  // Require enough historical information to avoid ranking a near-empty sample.
  if (
    home.games < 6 ||
    away.games < 6
  ) {
    return null;
  }

  // Original OverEdge Free Picks O/U model:
  // 50% home O/U rate + 50% away O/U rate.
  const overProbability =
    home.over25Rate * 0.5 +
    away.over25Rate * 0.5;

  const underProbability =
    home.under25Rate * 0.5 +
    away.under25Rate * 0.5;

  const overWins =
    overProbability >=
    underProbability;

  const sideProbability =
    overWins
      ? overProbability
      : underProbability;

  const confidence =
    calibratedConfidence(
      sideProbability,
      home,
      away,
    );

  return {
    selection:
      overWins
        ? "over_2_5"
        : "under_2_5",
    displaySelection:
      overWins
        ? "Over 2.5"
        : "Under 2.5",
    sideProbability,
    modelProbabilityPct:
      pct(sideProbability),
    confidence,
    confidencePct:
      pct(confidence),
    metrics: {
      home,
      away,
    },
  };
}
