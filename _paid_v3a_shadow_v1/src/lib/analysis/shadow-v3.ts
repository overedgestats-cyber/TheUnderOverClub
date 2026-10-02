import "server-only";

import type {
  ApiFootballFixture,
} from "@/lib/api-football/client";
import {
  clamp,
  normalizeThree,
  round,
} from "@/lib/analysis/math";
import type {
  ConsensusOdd,
  OneXTwoProbabilities,
} from "@/lib/analysis/types";

type Perspective = {
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result:
    | "win"
    | "draw"
    | "loss";
  competition: string;
  country: string | null;
  competitionStrength: number;
  recencyWeight: number;
};

type StrengthMetrics = {
  sampleSize: number;
  goalsForAverage: number;
  goalsAgainstAverage: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  pointsPerGame: number;
  averageCompetitionStrength: number;
};

type TeamStrengthView = {
  overall: StrengthMetrics;
  venue: StrengthMetrics;
};

const SAMPLE_SIZE = 12;

/*
 * Conservative competition-context coefficients.
 *
 * These are NOT Elo ratings and do not pretend to measure individual
 * opponent quality. They are deliberately modest because v3a is shadow-only.
 * The purpose is to stop treating every historical result as if it came
 * from an identical competitive environment.
 */
function competitionStrength(
  fixture: ApiFootballFixture,
): number {
  const name =
    fixture.league.name
      .toLowerCase()
      .replace(/[–—]/g, "-");

  const country =
    (
      fixture.league.country ??
      ""
    ).toLowerCase();

  if (
    name.includes(
      "champions league",
    )
  ) {
    return 1.08;
  }

  if (
    name.includes(
      "europa league",
    ) &&
    !name.includes(
      "conference",
    )
  ) {
    return 1.04;
  }

  if (
    name.includes(
      "conference league",
    )
  ) {
    return 1.01;
  }

  if (
    name.includes(
      "super cup",
    )
  ) {
    return 1.03;
  }

  const topFive =
    (
      country === "england" &&
      name ===
        "premier league"
    ) ||
    (
      country === "spain" &&
      (
        name === "la liga" ||
        name === "laliga"
      )
    ) ||
    (
      country === "italy" &&
      name === "serie a"
    ) ||
    (
      country === "germany" &&
      name === "bundesliga"
    ) ||
    (
      country === "france" &&
      name === "ligue 1"
    );

  if (topFive) {
    return 1.06;
  }

  const secondTier =
    (
      country === "england" &&
      name.includes(
        "championship",
      )
    ) ||
    (
      country === "spain" &&
      (
        name.includes(
          "segunda",
        ) ||
        name.includes(
          "la liga 2",
        )
      )
    ) ||
    (
      country === "italy" &&
      name === "serie b"
    ) ||
    (
      country === "germany" &&
      (
        name.includes(
          "2. bundesliga",
        ) ||
        name.includes(
          "2 bundesliga",
        )
      )
    ) ||
    (
      country === "france" &&
      name === "ligue 2"
    );

  if (secondTier) {
    return 0.92;
  }

  if (
    name.includes(
      "libertadores",
    )
  ) {
    return 1.02;
  }

  if (
    name.includes(
      "world cup",
    ) ||
    name.includes(
      "euro championship",
    ) ||
    name.includes(
      "european championship",
    ) ||
    name.includes(
      "copa america",
    )
  ) {
    return 1.04;
  }

  /*
   * Domestic cups and unknown competitions stay neutral.
   * We do not infer opponent strength from the competition name alone.
   */
  return 1;
}

function resultFor(
  goalsFor: number,
  goalsAgainst: number,
): Perspective["result"] {
  if (
    goalsFor >
    goalsAgainst
  ) {
    return "win";
  }

  if (
    goalsFor ===
    goalsAgainst
  ) {
    return "draw";
  }

  return "loss";
}

function buildPerspectives({
  fixtures,
  teamId,
  targetFixtureId,
  targetKickoff,
}: {
  fixtures: ApiFootballFixture[];
  teamId: number;
  targetFixtureId: number;
  targetKickoff: string;
}): Perspective[] {
  const cutoff =
    new Date(
      targetKickoff,
    ).getTime();

  const eligible =
    fixtures
      .filter(
        (fixture) =>
          fixture.fixture.id !==
            targetFixtureId &&
          new Date(
            fixture.fixture.date,
          ).getTime() <
            cutoff &&
          fixture.goals.home !==
            null &&
          fixture.goals.away !==
            null,
      )
      .sort(
        (
          first,
          second,
        ) =>
          new Date(
            second.fixture.date,
          ).getTime() -
          new Date(
            first.fixture.date,
          ).getTime(),
      )
      .slice(
        0,
        SAMPLE_SIZE,
      );

  const rows:
    Perspective[] =
    [];

  eligible.forEach(
    (
      fixture,
      index,
    ) => {
      const isHome =
        fixture.teams.home
          .id ===
        teamId;

      const isAway =
        fixture.teams.away
          .id ===
        teamId;

      if (
        !isHome &&
        !isAway
      ) {
        return;
      }

      const homeGoals =
        fixture.goals.home as number;

      const awayGoals =
        fixture.goals.away as number;

      const goalsFor =
        isHome
          ? homeGoals
          : awayGoals;

      const goalsAgainst =
        isHome
          ? awayGoals
          : homeGoals;

      /*
       * Most recent fixture = 1.00.
       * Each older fixture loses 4% of weight.
       * At match 12 the weight is still ~0.64, so this is intentionally mild.
       */
      const recencyWeight =
        0.96 ** index;

      rows.push({
        isHome,
        goalsFor,
        goalsAgainst,
        result:
          resultFor(
            goalsFor,
            goalsAgainst,
          ),
        competition:
          fixture.league.name,
        country:
          fixture.league.country ??
          null,
        competitionStrength:
          competitionStrength(
            fixture,
          ),
        recencyWeight,
      });
    },
  );

  return rows;
}

function emptyMetrics():
  StrengthMetrics {
  return {
    sampleSize:
      0,
    goalsForAverage:
      0,
    goalsAgainstAverage:
      0,
    winRate:
      0,
    drawRate:
      0,
    lossRate:
      0,
    pointsPerGame:
      0,
    averageCompetitionStrength:
      1,
  };
}

function strengthMetrics(
  rows:
    Perspective[],
): StrengthMetrics {
  if (
    rows.length ===
    0
  ) {
    return emptyMetrics();
  }

  let denominator =
    0;

  let goalsFor =
    0;

  let goalsAgainst =
    0;

  let winSignal =
    0;

  let drawSignal =
    0;

  let lossSignal =
    0;

  let pointsSignal =
    0;

  let competitionSignal =
    0;

  for (
    const row of
    rows
  ) {
    const recency =
      row.recencyWeight;

    const strength =
      row.competitionStrength;

    denominator +=
      recency;

    /*
     * Scoring in a stronger environment receives a small boost.
     * Conceding in a stronger environment receives a small discount.
     * The reverse applies to weaker competition.
     */
    goalsFor +=
      row.goalsFor *
      strength *
      recency;

    goalsAgainst +=
      (
        row.goalsAgainst /
        strength
      ) *
      recency;

    competitionSignal +=
      strength *
      recency;

    if (
      row.result ===
      "win"
    ) {
      winSignal +=
        strength *
        recency;

      pointsSignal +=
        3 *
        strength *
        recency;
    } else if (
      row.result ===
      "draw"
    ) {
      drawSignal +=
        recency;

      pointsSignal +=
        recency;
    } else {
      /*
       * A loss in weaker competition is slightly more damaging.
       */
      lossSignal +=
        (
          1 /
          strength
        ) *
        recency;
    }
  }

  const winRate =
    clamp(
      winSignal /
        denominator,
      0,
      1,
    );

  const drawRate =
    clamp(
      drawSignal /
        denominator,
      0,
      1,
    );

  const lossRate =
    clamp(
      lossSignal /
        denominator,
      0,
      1,
    );

  const normalized =
    normalizeThree(
      winRate,
      drawRate,
      lossRate,
    );

  return {
    sampleSize:
      rows.length,
    goalsForAverage:
      round(
        goalsFor /
          denominator,
      ),
    goalsAgainstAverage:
      round(
        goalsAgainst /
          denominator,
      ),
    winRate:
      round(
        normalized.home,
      ),
    drawRate:
      round(
        normalized.draw,
      ),
    lossRate:
      round(
        normalized.away,
      ),
    pointsPerGame:
      round(
        clamp(
          pointsSignal /
            denominator,
          0,
          3,
        ),
      ),
    averageCompetitionStrength:
      round(
        competitionSignal /
          denominator,
      ),
  };
}

function teamView({
  fixtures,
  teamId,
  targetFixtureId,
  targetKickoff,
  venue,
}: {
  fixtures: ApiFootballFixture[];
  teamId: number;
  targetFixtureId: number;
  targetKickoff: string;
  venue:
    | "home"
    | "away";
}): TeamStrengthView {
  const rows =
    buildPerspectives({
      fixtures,
      teamId,
      targetFixtureId,
      targetKickoff,
    });

  const venueRows =
    rows.filter(
      (row) =>
        venue ===
        "home"
          ? row.isHome
          : !row.isHome,
    );

  const overall =
    strengthMetrics(
      rows,
    );

  const venueMetrics =
    strengthMetrics(
      venueRows,
    );

  return {
    overall,
    venue:
      venueMetrics
        .sampleSize >=
      3
        ? venueMetrics
        : overall,
  };
}

function factorial(
  value: number,
): number {
  if (
    value <=
    1
  ) {
    return 1;
  }

  let result =
    1;

  for (
    let current =
      2;
    current <=
      value;
    current +=
      1
  ) {
    result *=
      current;
  }

  return result;
}

function poissonProbability(
  goals: number,
  expectedGoals: number,
): number {
  return (
    Math.exp(
      -expectedGoals,
    ) *
    expectedGoals **
      goals /
    factorial(
      goals,
    )
  );
}

function poissonOneXTwo(
  homeExpectedGoals: number,
  awayExpectedGoals: number,
): OneXTwoProbabilities {
  let totalMass =
    0;

  let homeWin =
    0;

  let draw =
    0;

  let awayWin =
    0;

  for (
    let homeGoals =
      0;
    homeGoals <=
      8;
    homeGoals +=
      1
  ) {
    for (
      let awayGoals =
        0;
      awayGoals <=
        8;
      awayGoals +=
        1
    ) {
      const probability =
        poissonProbability(
          homeGoals,
          homeExpectedGoals,
        ) *
        poissonProbability(
          awayGoals,
          awayExpectedGoals,
        );

      totalMass +=
        probability;

      if (
        homeGoals >
        awayGoals
      ) {
        homeWin +=
          probability;
      } else if (
        homeGoals ===
        awayGoals
      ) {
        draw +=
          probability;
      } else {
        awayWin +=
          probability;
      }
    }
  }

  return normalizeThree(
    homeWin /
      totalMass,
    draw /
      totalMass,
    awayWin /
      totalMass,
  );
}

function marketPrior(
  odds:
    ConsensusOdd[],
): OneXTwoProbabilities | null {
  const home =
    odds.find(
      (odd) =>
        odd.market ===
          "one_x_two" &&
        odd.selection ===
          "home",
    )
      ?.fairProbability ??
    null;

  const draw =
    odds.find(
      (odd) =>
        odd.market ===
          "one_x_two" &&
        odd.selection ===
          "draw",
    )
      ?.fairProbability ??
    null;

  const away =
    odds.find(
      (odd) =>
        odd.market ===
          "one_x_two" &&
        odd.selection ===
          "away",
    )
      ?.fairProbability ??
    null;

  if (
    home ===
      null ||
    draw ===
      null ||
    away ===
      null
  ) {
    return null;
  }

  return normalizeThree(
    home,
    draw,
    away,
  );
}

function maxDifference(
  first:
    OneXTwoProbabilities,
  second:
    OneXTwoProbabilities,
) {
  return Math.max(
    Math.abs(
      first.home -
        second.home,
    ),
    Math.abs(
      first.draw -
        second.draw,
    ),
    Math.abs(
      first.away -
        second.away,
    ),
  );
}

export function buildPaidV3Shadow({
  homeHistory,
  awayHistory,
  homeTeamId,
  awayTeamId,
  targetFixtureId,
  targetKickoff,
  consensusOdds,
}: {
  homeHistory:
    ApiFootballFixture[];
  awayHistory:
    ApiFootballFixture[];
  homeTeamId:
    number;
  awayTeamId:
    number;
  targetFixtureId:
    number;
  targetKickoff:
    string;
  consensusOdds:
    ConsensusOdd[];
}) {
  const home =
    teamView({
      fixtures:
        homeHistory,
      teamId:
        homeTeamId,
      targetFixtureId,
      targetKickoff,
      venue:
        "home",
    });

  const away =
    teamView({
      fixtures:
        awayHistory,
      teamId:
        awayTeamId,
      targetFixtureId,
      targetKickoff,
      venue:
        "away",
    });

  const homeAttack =
    home.venue
      .goalsForAverage *
      0.65 +
    home.overall
      .goalsForAverage *
      0.35;

  const awayDefence =
    away.venue
      .goalsAgainstAverage *
      0.65 +
    away.overall
      .goalsAgainstAverage *
      0.35;

  const awayAttack =
    away.venue
      .goalsForAverage *
      0.65 +
    away.overall
      .goalsForAverage *
      0.35;

  const homeDefence =
    home.venue
      .goalsAgainstAverage *
      0.65 +
    home.overall
      .goalsAgainstAverage *
      0.35;

  const expectedHome =
    round(
      clamp(
        (
          homeAttack *
            0.55 +
          awayDefence *
            0.45
        ) *
          1.08,
        0.2,
        3.8,
      ),
    );

  const expectedAway =
    round(
      clamp(
        (
          awayAttack *
            0.55 +
          homeDefence *
            0.45
        ) *
          0.94,
        0.2,
        3.5,
      ),
    );

  const poisson =
    poissonOneXTwo(
      expectedHome,
      expectedAway,
    );

  const empirical =
    normalizeThree(
      (
        home.venue
          .winRate +
        away.venue
          .lossRate
      ) /
        2,
      (
        home.venue
          .drawRate +
        away.venue
          .drawRate
      ) /
        2,
      (
        away.venue
          .winRate +
        home.venue
          .lossRate
      ) /
        2,
    );

  const raw =
    normalizeThree(
      poisson.home *
        0.78 +
        empirical.home *
          0.22,
      poisson.draw *
        0.78 +
        empirical.draw *
          0.22,
      poisson.away *
        0.78 +
        empirical.away *
          0.22,
    );

  const prior =
    marketPrior(
      consensusOdds,
    );

  let marketWeight =
    0;

  let calibrated =
    raw;

  let divergence:
    number | null =
    null;

  if (prior) {
    divergence =
      maxDifference(
        raw,
        prior,
      );

    /*
     * Start with a conservative 20% market prior.
     * Extreme disagreements receive more shrinkage, capped at 55%.
     * This is SHADOW calibration only and never changes production picks.
     */
    marketWeight =
      clamp(
        0.2 +
          Math.max(
            0,
            divergence -
              0.12,
          ) *
            1.5,
        0.2,
        0.55,
      );

    calibrated =
      normalizeThree(
        raw.home *
          (
            1 -
            marketWeight
          ) +
          prior.home *
            marketWeight,
        raw.draw *
          (
            1 -
            marketWeight
          ) +
          prior.draw *
            marketWeight,
        raw.away *
          (
            1 -
            marketWeight
          ) +
          prior.away *
            marketWeight,
      );
  }

  return {
    modelVersion:
      "paid-confidence-v3a-shadow",
    productionImpact:
      "none",
    purpose:
      "Shadow-only 1X2 strength/context calibration",
    sampleMatches:
      SAMPLE_SIZE,
    competitionContextVersion:
      "competition-context-v1",
    recencyDecay:
      0.96,
    expectedGoals: {
      home:
        expectedHome,
      away:
        expectedAway,
      total:
        round(
          expectedHome +
            expectedAway,
        ),
    },
    home,
    away,
    oneXTwo: {
      poisson: {
        home:
          round(
            poisson.home,
          ),
        draw:
          round(
            poisson.draw,
          ),
        away:
          round(
            poisson.away,
          ),
      },
      empirical: {
        home:
          round(
            empirical.home,
          ),
        draw:
          round(
            empirical.draw,
          ),
        away:
          round(
            empirical.away,
          ),
      },
      rawStrengthAdjusted: {
        home:
          round(
            raw.home,
          ),
        draw:
          round(
            raw.draw,
          ),
        away:
          round(
            raw.away,
          ),
      },
      bookmakerPrior:
        prior
          ? {
              home:
                round(
                  prior.home,
                ),
              draw:
                round(
                  prior.draw,
                ),
              away:
                round(
                  prior.away,
                ),
            }
          : null,
      marketPriorWeight:
        round(
          marketWeight,
        ),
      maximumMarketDivergence:
        divergence ===
        null
          ? null
          : round(
              divergence,
            ),
      calibratedShadow: {
        home:
          round(
            calibrated.home,
          ),
        draw:
          round(
            calibrated.draw,
          ),
        away:
          round(
            calibrated.away,
          ),
      },
    },
  };
}
