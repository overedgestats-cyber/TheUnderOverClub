import type { ApiFootballFixture } from "@/lib/api-football/client";
import { round } from "@/lib/analysis/math";

export function calculateHeadToHeadSummary({
  fixtures,
  homeTeamId,
  targetFixtureId,
  targetKickoff,
}: {
  fixtures: ApiFootballFixture[];
  homeTeamId: number;
  targetFixtureId: number;
  targetKickoff: string;
}) {
  const cutoff =
    new Date(targetKickoff).getTime();

  let homeTeamWins = 0;
  let draws = 0;
  let homeTeamLosses = 0;
  let over25 = 0;
  let btts = 0;

  const eligible = fixtures
    .filter(
      (fixture) =>
        fixture.fixture.id !==
          targetFixtureId &&
        new Date(
          fixture.fixture.date,
        ).getTime() < cutoff &&
        fixture.goals.home !== null &&
        fixture.goals.away !== null,
    )
    .slice(0, 5);

  for (const fixture of eligible) {
    const isHome =
      fixture.teams.home.id ===
      homeTeamId;

    const homeGoals =
      fixture.goals.home ?? 0;
    const awayGoals =
      fixture.goals.away ?? 0;

    const goalsFor = isHome
      ? homeGoals
      : awayGoals;

    const goalsAgainst = isHome
      ? awayGoals
      : homeGoals;

    if (goalsFor > goalsAgainst) {
      homeTeamWins += 1;
    } else if (
      goalsFor === goalsAgainst
    ) {
      draws += 1;
    } else {
      homeTeamLosses += 1;
    }

    if (homeGoals + awayGoals > 2) {
      over25 += 1;
    }

    if (
      homeGoals > 0 &&
      awayGoals > 0
    ) {
      btts += 1;
    }
  }

  const sampleSize = eligible.length;

  return {
    sampleSize,
    homeTeamWinRate:
      sampleSize > 0
        ? round(
            homeTeamWins / sampleSize,
          )
        : 0,
    drawRate:
      sampleSize > 0
        ? round(draws / sampleSize)
        : 0,
    homeTeamLossRate:
      sampleSize > 0
        ? round(
            homeTeamLosses / sampleSize,
          )
        : 0,
    over25Rate:
      sampleSize > 0
        ? round(over25 / sampleSize)
        : 0,
    bttsRate:
      sampleSize > 0
        ? round(btts / sampleSize)
        : 0,
  };
}
