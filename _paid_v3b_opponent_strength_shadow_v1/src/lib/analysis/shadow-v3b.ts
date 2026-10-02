import "server-only";

import {
  getStandings,
  type ApiFootballFixture,
  type ApiFootballStanding,
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

type Venue =
  | "home"
  | "away";

type OpponentStrengthLookup =
  Map<number, number>;

type ContextPerspective = {
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result:
    | "win"
    | "draw"
    | "loss";
  competitionStrength: number;
  opponentStrength: number;
  combinedContext: number;
  recencyWeight: number;
  standingAvailable: boolean;
};

type ContextMetrics = {
  sampleSize: number;
  goalsForAverage: number;
  goalsAgainstAverage: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  pointsPerGame: number;
  averageCompetitionStrength: number;
  averageOpponentStrength: number;
  standingsCoverage: number;
};

type TeamContextView = {
  overall: ContextMetrics;
  venue: ContextMetrics;
};

const SAMPLE_SIZE =
  12;

const RECENCY_DECAY =
  0.96;

const standingsCache =
  new Map<
    string,
    Promise<
      OpponentStrengthLookup |
      null
    >
  >();

function competitionStrengthFromName(
  nameRaw: string,
  countryRaw:
    string |
    null |
    undefined,
): number {
  const name =
    nameRaw
      .toLowerCase()
      .replace(
        /[–—]/g,
        "-",
      );

  const country =
    (
      countryRaw ??
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

  if (
    (
      country ===
        "england" &&
      name ===
        "premier league"
    ) ||
    (
      country ===
        "spain" &&
      (
        name ===
          "la liga" ||
        name ===
          "laliga"
      )
    ) ||
    (
      country ===
        "italy" &&
      name ===
        "serie a"
    ) ||
    (
      country ===
        "germany" &&
      name ===
        "bundesliga"
    ) ||
    (
      country ===
        "france" &&
      name ===
        "ligue 1"
    )
  ) {
    return 1.06;
  }

  if (
    (
      country ===
        "england" &&
      name.includes(
        "championship",
      )
    ) ||
    (
      country ===
        "spain" &&
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
      country ===
        "italy" &&
      name ===
        "serie b"
    ) ||
    (
      country ===
        "germany" &&
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
      country ===
        "france" &&
      name ===
        "ligue 2"
    )
  ) {
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

  return 1;
}

function standingsSupported(
  fixture:
    ApiFootballFixture,
) {
  const name =
    fixture.league.name
      .toLowerCase();

  return !(
    name.includes(
      "cup",
    ) ||
    name.includes(
      "pokal",
    ) ||
    name.includes(
      "copa del rey",
    ) ||
    name.includes(
      "champions league",
    ) ||
    name.includes(
      "europa league",
    ) ||
    name.includes(
      "conference league",
    ) ||
    name.includes(
      "libertadores",
    ) ||
    name.includes(
      "super cup",
    )
  );
}

function standingStrengthMap(
  standings:
    ApiFootballStanding[],
): OpponentStrengthLookup {
  const valid =
    standings
      .filter(
        (row) =>
          Number.isFinite(
            row.rank,
          ) &&
          row.team?.id &&
          Number.isFinite(
            row.all?.played,
          ) &&
          Number.isFinite(
            row.points,
          ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.rank -
          second.rank,
      );

  const result =
    new Map<
      number,
      number
    >();

  if (
    valid.length ===
    0
  ) {
    return result;
  }

  const ppgValues =
    valid.map(
      (row) =>
        row.all.played >
        0
          ? row.points /
            row.all.played
          : 0,
    );

  const minPpg =
    Math.min(
      ...ppgValues,
    );

  const maxPpg =
    Math.max(
      ...ppgValues,
    );

  const lastIndex =
    Math.max(
      1,
      valid.length -
        1,
    );

  valid.forEach(
    (
      row,
      index,
    ) => {
      const rankScore =
        1 -
        index /
          lastIndex;

      const ppg =
        row.all.played >
        0
          ? row.points /
            row.all.played
          : 0;

      const ppgScore =
        maxPpg >
        minPpg
          ? (
              ppg -
              minPpg
            ) /
            (
              maxPpg -
              minPpg
            )
          : 0.5;

      /*
       * Range is deliberately modest:
       * bottom side ~0.82, top side ~1.18.
       */
      const strength =
        clamp(
          0.82 +
            0.36 *
              (
                rankScore *
                  0.6 +
                ppgScore *
                  0.4
              ),
          0.82,
          1.18,
        );

      result.set(
        row.team.id,
        round(
          strength,
        ),
      );
    },
  );

  return result;
}

async function standingsForFixture(
  fixture:
    ApiFootballFixture,
): Promise<
  OpponentStrengthLookup |
  null
> {
  const leagueId =
    fixture.league.id;

  const season =
    fixture.league.season;

  if (
    !leagueId ||
    !season ||
    !standingsSupported(
      fixture,
    )
  ) {
    return null;
  }

  const key =
    `${leagueId}:${season}`;

  const existing =
    standingsCache.get(
      key,
    );

  if (existing) {
    return existing;
  }

  const promise =
    getStandings(
      leagueId,
      season,
    )
      .then(
        (
          standings,
        ) => {
          const map =
            standingStrengthMap(
              standings,
            );

          return map.size >
            0
            ? map
            : null;
        },
      )
      .catch(
        (
          error,
        ) => {
          console.warn(
            `[v3b] standings unavailable for league ${leagueId}, season ${season}:`,
            error instanceof
              Error
              ? error.message
              : error,
          );

          return null;
        },
      );

  standingsCache.set(
    key,
    promise,
  );

  return promise;
}

function resultFor(
  goalsFor:
    number,
  goalsAgainst:
    number,
):
  ContextPerspective["result"] {
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

async function buildPerspectives({
  fixtures,
  teamId,
  targetFixtureId,
  targetKickoff,
}: {
  fixtures:
    ApiFootballFixture[];
  teamId:
    number;
  targetFixtureId:
    number;
  targetKickoff:
    string;
}): Promise<
  ContextPerspective[]
> {
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
    ContextPerspective[] =
    [];

  for (
    let index =
      0;
    index <
      eligible.length;
    index +=
      1
  ) {
    const fixture =
      eligible[index];

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
      continue;
    }

    const opponentId =
      isHome
        ? fixture.teams
            .away.id
        : fixture.teams
            .home.id;

    const standings =
      await standingsForFixture(
        fixture,
      );

    const standingStrength =
      standings?.get(
        opponentId,
      );

    const opponentStrength =
      standingStrength ??
      1;

    const competitionStrength =
      competitionStrengthFromName(
        fixture.league
          .name,
        fixture.league
          .country,
      );

    /*
     * Opponent strength gets more influence than broad competition level.
     * sqrt keeps this deliberately conservative.
     */
    const combinedContext =
      clamp(
        Math.sqrt(
          competitionStrength *
            opponentStrength,
        ),
        0.78,
        1.24,
      );

    const homeGoals =
      fixture.goals
        .home as number;

    const awayGoals =
      fixture.goals
        .away as number;

    const goalsFor =
      isHome
        ? homeGoals
        : awayGoals;

    const goalsAgainst =
      isHome
        ? awayGoals
        : homeGoals;

    rows.push({
      isHome,
      goalsFor,
      goalsAgainst,
      result:
        resultFor(
          goalsFor,
          goalsAgainst,
        ),
      competitionStrength,
      opponentStrength,
      combinedContext,
      recencyWeight:
        RECENCY_DECAY **
        index,
      standingAvailable:
        standingStrength !==
        undefined,
    });
  }

  return rows;
}

function emptyMetrics():
  ContextMetrics {
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
    averageOpponentStrength:
      1,
    standingsCoverage:
      0,
  };
}

function metricsFor(
  rows:
    ContextPerspective[],
):
  ContextMetrics {
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

  let wins =
    0;

  let draws =
    0;

  let losses =
    0;

  let points =
    0;

  let competition =
    0;

  let opponents =
    0;

  let standingWeight =
    0;

  for (
    const row of
    rows
  ) {
    const w =
      row.recencyWeight;

    const context =
      row.combinedContext;

    denominator +=
      w;

    /*
     * Strong-opponent performances are worth more.
     * Poor results against weak opponents are worth less.
     */
    goalsFor +=
      row.goalsFor *
      context *
      w;

    goalsAgainst +=
      (
        row.goalsAgainst /
        context
      ) *
      w;

    competition +=
      row.competitionStrength *
      w;

    opponents +=
      row.opponentStrength *
      w;

    if (
      row.standingAvailable
    ) {
      standingWeight +=
        w;
    }

    if (
      row.result ===
      "win"
    ) {
      wins +=
        context *
        w;

      points +=
        3 *
        context *
        w;
    } else if (
      row.result ===
      "draw"
    ) {
      draws +=
        w;

      points +=
        w;
    } else {
      losses +=
        (
          1 /
          context
        ) *
        w;
    }
  }

  const normalized =
    normalizeThree(
      wins /
        denominator,
      draws /
        denominator,
      losses /
        denominator,
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
          points /
            denominator,
          0,
          3,
        ),
      ),
    averageCompetitionStrength:
      round(
        competition /
          denominator,
      ),
    averageOpponentStrength:
      round(
        opponents /
          denominator,
      ),
    standingsCoverage:
      round(
        standingWeight /
          denominator,
      ),
  };
}

async function teamView({
  fixtures,
  teamId,
  targetFixtureId,
  targetKickoff,
  venue,
}: {
  fixtures:
    ApiFootballFixture[];
  teamId:
    number;
  targetFixtureId:
    number;
  targetKickoff:
    string;
  venue:
    Venue;
}): Promise<
  TeamContextView
> {
  const rows =
    await buildPerspectives({
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
    metricsFor(
      rows,
    );

  const venueMetrics =
    metricsFor(
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
  value:
    number,
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
  goals:
    number,
  expectedGoals:
    number,
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
  homeExpected:
    number,
  awayExpected:
    number,
):
  OneXTwoProbabilities {
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
          homeExpected,
        ) *
        poissonProbability(
          awayGoals,
          awayExpected,
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

function bookmakerPrior(
  odds:
    ConsensusOdd[],
):
  OneXTwoProbabilities |
  null {
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

function maximumDifference(
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

export async function buildPaidV3bShadow({
  homeHistory,
  awayHistory,
  homeTeamId,
  awayTeamId,
  targetFixtureId,
  targetKickoff,
  targetCompetitionName,
  targetCompetitionCountry,
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
  targetCompetitionName:
    string;
  targetCompetitionCountry:
    string |
    null;
  consensusOdds:
    ConsensusOdd[];
}) {
  const [
    home,
    away,
  ] =
    await Promise.all([
      teamView({
        fixtures:
          homeHistory,
        teamId:
          homeTeamId,
        targetFixtureId,
        targetKickoff,
        venue:
          "home",
      }),
      teamView({
        fixtures:
          awayHistory,
        teamId:
          awayTeamId,
        targetFixtureId,
        targetKickoff,
        venue:
          "away",
      }),
    ]);

  const targetCompetitionStrength =
    competitionStrengthFromName(
      targetCompetitionName,
      targetCompetitionCountry,
    );

  const homeHistoryStrength =
    (
      home.overall
        .averageCompetitionStrength +
      home.venue
        .averageCompetitionStrength
    ) /
      2;

  const awayHistoryStrength =
    (
      away.overall
        .averageCompetitionStrength +
      away.venue
        .averageCompetitionStrength
    ) /
      2;

  /*
   * Convert historical production to the environment of the target match.
   * A team stepping up from weaker historical competition receives a
   * conservative attack penalty; a team stepping down gets a small lift.
   */
  const homeEnvironmentAttackScale =
    clamp(
      Math.sqrt(
        homeHistoryStrength /
          targetCompetitionStrength,
      ),
      0.84,
      1.12,
    );

  const awayEnvironmentAttackScale =
    clamp(
      Math.sqrt(
        awayHistoryStrength /
          targetCompetitionStrength,
      ),
      0.84,
      1.12,
    );

  const homeEnvironmentDefenceScale =
    clamp(
      Math.sqrt(
        targetCompetitionStrength /
          homeHistoryStrength,
      ),
      0.9,
      1.18,
    );

  const awayEnvironmentDefenceScale =
    clamp(
      Math.sqrt(
        targetCompetitionStrength /
          awayHistoryStrength,
      ),
      0.9,
      1.18,
    );

  const homeAttack =
    (
      home.venue
        .goalsForAverage *
        0.65 +
      home.overall
        .goalsForAverage *
        0.35
    ) *
    homeEnvironmentAttackScale;

  const awayDefence =
    (
      away.venue
        .goalsAgainstAverage *
        0.65 +
      away.overall
        .goalsAgainstAverage *
        0.35
    ) *
    awayEnvironmentDefenceScale;

  const awayAttack =
    (
      away.venue
        .goalsForAverage *
        0.65 +
      away.overall
        .goalsForAverage *
        0.35
    ) *
    awayEnvironmentAttackScale;

  const homeDefence =
    (
      home.venue
        .goalsAgainstAverage *
        0.65 +
      home.overall
        .goalsAgainstAverage *
        0.35
    ) *
    homeEnvironmentDefenceScale;

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
        0.8 +
        empirical.home *
          0.2,
      poisson.draw *
        0.8 +
        empirical.draw *
          0.2,
      poisson.away *
        0.8 +
        empirical.away *
          0.2,
    );

  const prior =
    bookmakerPrior(
      consensusOdds,
    );

  let priorWeight =
    0;

  let divergence:
    number |
    null =
    null;

  let calibrated =
    raw;

  if (prior) {
    divergence =
      maximumDifference(
        raw,
        prior,
      );

    /*
     * The market remains a calibration prior, not the primary model.
     * Extreme disagreements get more shrinkage.
     */
    priorWeight =
      clamp(
        0.15 +
          Math.max(
            0,
            divergence -
              0.1,
          ) *
            1.6,
        0.15,
        0.55,
      );

    calibrated =
      normalizeThree(
        raw.home *
          (
            1 -
            priorWeight
          ) +
          prior.home *
            priorWeight,
        raw.draw *
          (
            1 -
            priorWeight
          ) +
          prior.draw *
            priorWeight,
        raw.away *
          (
            1 -
            priorWeight
          ) +
          prior.away *
            priorWeight,
      );
  }

  return {
    modelVersion:
      "paid-confidence-v3b-shadow",
    productionImpact:
      "none",
    purpose:
      "Opponent-strength + competition-context shadow calibration for 1X2",
    sampleMatches:
      SAMPLE_SIZE,
    recencyDecay:
      RECENCY_DECAY,
    opponentStrengthMethod:
      "standings rank + points-per-game, cached by league and season",
    targetCompetitionStrength:
      round(
        targetCompetitionStrength,
      ),
    environmentAdjustment: {
      homeHistoryCompetitionStrength:
        round(
          homeHistoryStrength,
        ),
      awayHistoryCompetitionStrength:
        round(
          awayHistoryStrength,
        ),
      homeAttackScale:
        round(
          homeEnvironmentAttackScale,
        ),
      awayAttackScale:
        round(
          awayEnvironmentAttackScale,
        ),
      homeDefenceScale:
        round(
          homeEnvironmentDefenceScale,
        ),
      awayDefenceScale:
        round(
          awayEnvironmentDefenceScale,
        ),
    },
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
      rawOpponentAdjusted: {
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
          priorWeight,
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
