import type { ApiFootballFixture } from "@/lib/api-football/client";
import {
  clamp,
  round,
} from "@/lib/analysis/math";
import type {
  TeamAnalysis,
  TeamFormMetrics,
  Venue,
} from "@/lib/analysis/types";

type MatchPerspective = {
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
};

function emptyMetrics(): TeamFormMetrics {
  return {
    sampleSize: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsForAverage: 0,
    goalsAgainstAverage: 0,
    totalGoalsAverage: 0,
    over25Rate: 0,
    under25Rate: 0,
    bttsRate: 0,
    scoredRate: 0,
    cleanSheetRate: 0,
    failedToScoreRate: 0,
    pointsPerGame: 0,
    winRate: 0,
    drawRate: 0,
    lossRate: 0,
    unbeatenRate: 0,
  };
}

function getPerspective(
  fixture: ApiFootballFixture,
  teamId: number,
): MatchPerspective | null {
  const homeGoals = fixture.goals.home;
  const awayGoals = fixture.goals.away;

  if (
    homeGoals === null ||
    awayGoals === null
  ) {
    return null;
  }

  if (fixture.teams.home.id === teamId) {
    return {
      isHome: true,
      goalsFor: homeGoals,
      goalsAgainst: awayGoals,
    };
  }

  if (fixture.teams.away.id === teamId) {
    return {
      isHome: false,
      goalsFor: awayGoals,
      goalsAgainst: homeGoals,
    };
  }

  return null;
}

function calculateMetrics(
  perspectives: MatchPerspective[],
): TeamFormMetrics {
  if (perspectives.length === 0) {
    return emptyMetrics();
  }

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let over25 = 0;
  let btts = 0;
  let scored = 0;
  let cleanSheets = 0;
  let failedToScore = 0;
  let points = 0;

  for (const match of perspectives) {
    goalsFor += match.goalsFor;
    goalsAgainst += match.goalsAgainst;

    if (
      match.goalsFor + match.goalsAgainst >
      2
    ) {
      over25 += 1;
    }

    if (
      match.goalsFor > 0 &&
      match.goalsAgainst > 0
    ) {
      btts += 1;
    }

    if (match.goalsFor > 0) {
      scored += 1;
    } else {
      failedToScore += 1;
    }

    if (match.goalsAgainst === 0) {
      cleanSheets += 1;
    }

    if (match.goalsFor > match.goalsAgainst) {
      wins += 1;
      points += 3;
    } else if (
      match.goalsFor ===
      match.goalsAgainst
    ) {
      draws += 1;
      points += 1;
    } else {
      losses += 1;
    }
  }

  const sampleSize = perspectives.length;

  return {
    sampleSize,
    wins,
    draws,
    losses,
    goalsForAverage: round(
      goalsFor / sampleSize,
    ),
    goalsAgainstAverage: round(
      goalsAgainst / sampleSize,
    ),
    totalGoalsAverage: round(
      (goalsFor + goalsAgainst) /
        sampleSize,
    ),
    over25Rate: round(
      over25 / sampleSize,
    ),
    under25Rate: round(
      1 - over25 / sampleSize,
    ),
    bttsRate: round(
      btts / sampleSize,
    ),
    scoredRate: round(
      scored / sampleSize,
    ),
    cleanSheetRate: round(
      cleanSheets / sampleSize,
    ),
    failedToScoreRate: round(
      failedToScore / sampleSize,
    ),
    pointsPerGame: round(
      points / sampleSize,
    ),
    winRate: round(wins / sampleSize),
    drawRate: round(draws / sampleSize),
    lossRate: round(losses / sampleSize),
    unbeatenRate: round(
      (wins + draws) / sampleSize,
    ),
  };
}

export function analyzeTeamForm({
  fixtures,
  teamId,
  teamName,
  targetFixtureId,
  targetKickoff,
  venue,
  sampleSize = 12,
}: {
  fixtures: ApiFootballFixture[];
  teamId: number;
  teamName: string;
  targetFixtureId: number;
  targetKickoff: string;
  venue: Venue;
  sampleSize?: number;
}): TeamAnalysis {
  const cutoff =
    new Date(targetKickoff).getTime();

  const eligible = fixtures
    .filter(
      (fixture) =>
        fixture.fixture.id !==
          targetFixtureId &&
        new Date(
          fixture.fixture.date,
        ).getTime() < cutoff,
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
    .map((fixture) =>
      getPerspective(fixture, teamId),
    )
    .filter(
      (
        perspective,
      ): perspective is MatchPerspective =>
        perspective !== null,
    );

  const overallPerspectives =
    eligible.slice(0, sampleSize);

  const venuePerspectives =
    eligible
      .filter((match) =>
        venue === "home"
          ? match.isHome
          : !match.isHome,
      )
      .slice(0, sampleSize);

  const overall = calculateMetrics(
    overallPerspectives,
  );

  const venueMetrics =
    calculateMetrics(venuePerspectives);

  const overallCoverage = clamp(
    overall.sampleSize / sampleSize,
    0,
    1,
  );

  const venueCoverage = clamp(
    venueMetrics.sampleSize /
      Math.max(6, sampleSize / 2),
    0,
    1,
  );

  const dataQuality = round(
    overallCoverage * 0.7 +
      venueCoverage * 0.3,
  );

  return {
    teamId,
    teamName,
    overall,
    venue:
      venueMetrics.sampleSize >= 3
        ? venueMetrics
        : overall,
    venueType: venue,
    dataQuality,
  };
}
