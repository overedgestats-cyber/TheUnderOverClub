import {
  clamp,
  normalizeThree,
  round,
} from "@/lib/analysis/math";
import type {
  MatchProbabilities,
  ProbabilityComponents,
  TeamAnalysis,
} from "@/lib/analysis/types";

function factorial(value: number): number {
  if (value <= 1) {
    return 1;
  }

  let result = 1;

  for (
    let current = 2;
    current <= value;
    current += 1
  ) {
    result *= current;
  }

  return result;
}

function poissonProbability(
  goals: number,
  expectedGoals: number,
): number {
  return (
    Math.exp(-expectedGoals) *
    expectedGoals ** goals /
    factorial(goals)
  );
}

function blend(
  first: number,
  second: number,
  firstWeight: number,
): number {
  return (
    first * firstWeight +
    second * (1 - firstWeight)
  );
}

function buildCompleteProbabilities({
  over25,
  bttsYes,
  oneXTwo,
}: {
  over25: number;
  bttsYes: number;
  oneXTwo: {
    home: number;
    draw: number;
    away: number;
  };
}): MatchProbabilities {
  return {
    over25: round(over25),
    under25: round(1 - over25),
    bttsYes: round(bttsYes),
    bttsNo: round(1 - bttsYes),
    oneXTwo: {
      home: round(oneXTwo.home),
      draw: round(oneXTwo.draw),
      away: round(oneXTwo.away),
    },
    doubleChance: {
      oneX: round(
        oneXTwo.home + oneXTwo.draw,
      ),
      twelve: round(
        oneXTwo.home + oneXTwo.away,
      ),
      xTwo: round(
        oneXTwo.draw + oneXTwo.away,
      ),
    },
  };
}

export function estimateExpectedGoals(
  home: TeamAnalysis,
  away: TeamAnalysis,
) {
  const homeAttack =
    home.venue.goalsForAverage * 0.65 +
    home.overall.goalsForAverage * 0.35;

  const awayDefence =
    away.venue.goalsAgainstAverage * 0.65 +
    away.overall.goalsAgainstAverage * 0.35;

  const awayAttack =
    away.venue.goalsForAverage * 0.65 +
    away.overall.goalsForAverage * 0.35;

  const homeDefence =
    home.venue.goalsAgainstAverage * 0.65 +
    home.overall.goalsAgainstAverage * 0.35;

  const homeExpectedGoals = clamp(
    (
      homeAttack * 0.55 +
      awayDefence * 0.45
    ) * 1.08,
    0.2,
    3.8,
  );

  const awayExpectedGoals = clamp(
    (
      awayAttack * 0.55 +
      homeDefence * 0.45
    ) * 0.94,
    0.2,
    3.5,
  );

  return {
    home: round(homeExpectedGoals),
    away: round(awayExpectedGoals),
    total: round(
      homeExpectedGoals +
        awayExpectedGoals,
    ),
  };
}

export function calculateMatchProbabilities(
  home: TeamAnalysis,
  away: TeamAnalysis,
): {
  expectedGoals: {
    home: number;
    away: number;
    total: number;
  };
  probabilities: MatchProbabilities;
  components: ProbabilityComponents;
} {
  const expectedGoals =
    estimateExpectedGoals(home, away);

  const maximumGoals = 8;
  let totalMass = 0;
  let over25 = 0;
  let bttsYes = 0;
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (
    let homeGoals = 0;
    homeGoals <= maximumGoals;
    homeGoals += 1
  ) {
    for (
      let awayGoals = 0;
      awayGoals <= maximumGoals;
      awayGoals += 1
    ) {
      const probability =
        poissonProbability(
          homeGoals,
          expectedGoals.home,
        ) *
        poissonProbability(
          awayGoals,
          expectedGoals.away,
        );

      totalMass += probability;

      if (homeGoals + awayGoals > 2) {
        over25 += probability;
      }

      if (
        homeGoals > 0 &&
        awayGoals > 0
      ) {
        bttsYes += probability;
      }

      if (homeGoals > awayGoals) {
        homeWin += probability;
      } else if (
        homeGoals === awayGoals
      ) {
        draw += probability;
      } else {
        awayWin += probability;
      }
    }
  }

  const poissonOneXTwo = normalizeThree(
    homeWin / totalMass,
    draw / totalMass,
    awayWin / totalMass,
  );

  const poisson = buildCompleteProbabilities({
    over25: over25 / totalMass,
    bttsYes: bttsYes / totalMass,
    oneXTwo: poissonOneXTwo,
  });

  const empiricalOver25 =
    (
      home.overall.over25Rate +
      home.venue.over25Rate +
      away.overall.over25Rate +
      away.venue.over25Rate
    ) / 4;

  const empiricalBtts =
    (
      home.overall.bttsRate +
      home.venue.bttsRate +
      away.overall.bttsRate +
      away.venue.bttsRate
    ) / 4;

  const empiricalOneXTwo =
    normalizeThree(
      (
        home.venue.winRate +
        away.venue.lossRate
      ) / 2,
      (
        home.venue.drawRate +
        away.venue.drawRate
      ) / 2,
      (
        away.venue.winRate +
        home.venue.lossRate
      ) / 2,
    );

  const empirical = buildCompleteProbabilities({
    over25: empiricalOver25,
    bttsYes: empiricalBtts,
    oneXTwo: empiricalOneXTwo,
  });

  const blendedOver25 = clamp(
    blend(
      poisson.over25,
      empirical.over25,
      0.65,
    ),
    0.03,
    0.97,
  );

  const blendedBtts = clamp(
    blend(
      poisson.bttsYes,
      empirical.bttsYes,
      0.65,
    ),
    0.03,
    0.97,
  );

  const blendedOneXTwo =
    normalizeThree(
      blend(
        poisson.oneXTwo.home,
        empirical.oneXTwo.home,
        0.78,
      ),
      blend(
        poisson.oneXTwo.draw,
        empirical.oneXTwo.draw,
        0.78,
      ),
      blend(
        poisson.oneXTwo.away,
        empirical.oneXTwo.away,
        0.78,
      ),
    );

  const probabilities =
    buildCompleteProbabilities({
      over25: blendedOver25,
      bttsYes: blendedBtts,
      oneXTwo: blendedOneXTwo,
    });

  return {
    expectedGoals,
    probabilities,
    components: {
      poisson,
      empirical,
    },
  };
}
