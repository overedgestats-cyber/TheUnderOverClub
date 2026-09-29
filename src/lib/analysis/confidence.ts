import {
  clamp,
  round,
} from "@/lib/analysis/math";
import type {
  ConfidenceBreakdown,
  MarketKey,
  MarketSelection,
  MatchProbabilities,
  ProbabilityComponents,
  TeamAnalysis,
} from "@/lib/analysis/types";

type HeadToHeadSummary = {
  sampleSize: number;
  homeTeamWinRate: number;
  drawRate: number;
  homeTeamLossRate: number;
  over25Rate: number;
  bttsRate: number;
};

export function probabilityForSelection(
  probabilities: MatchProbabilities,
  market: MarketKey,
  selection: MarketSelection,
): number {
  if (market === "ou25") {
    return selection === "over_2_5"
      ? probabilities.over25
      : probabilities.under25;
  }

  if (market === "btts") {
    return selection === "yes"
      ? probabilities.bttsYes
      : probabilities.bttsNo;
  }

  if (
    market === "double_chance"
  ) {
    if (selection === "1x") {
      return probabilities
        .doubleChance.oneX;
    }

    if (selection === "12") {
      return probabilities
        .doubleChance.twelve;
    }

    return probabilities
      .doubleChance.xTwo;
  }

  if (selection === "home") {
    return probabilities.oneXTwo.home;
  }

  if (selection === "draw") {
    return probabilities.oneXTwo.draw;
  }

  return probabilities.oneXTwo.away;
}

function closeness(
  difference: number,
  maximumDifference: number,
): number {
  return clamp(
    1 -
      difference /
        maximumDifference,
    0,
    1,
  );
}

function formConsistency({
  home,
  away,
  market,
  selection,
}: {
  home: TeamAnalysis;
  away: TeamAnalysis;
  market: MarketKey;
  selection: MarketSelection;
}): number {
  if (market === "ou25") {
    const homeRate =
      selection === "over_2_5"
        ? [
            home.overall.over25Rate,
            home.venue.over25Rate,
          ]
        : [
            home.overall.under25Rate,
            home.venue.under25Rate,
          ];

    const awayRate =
      selection === "over_2_5"
        ? [
            away.overall.over25Rate,
            away.venue.over25Rate,
          ]
        : [
            away.overall.under25Rate,
            away.venue.under25Rate,
          ];

    const difference =
      (
        Math.abs(
          homeRate[0] -
            homeRate[1],
        ) +
        Math.abs(
          awayRate[0] -
            awayRate[1],
        )
      ) / 2;

    return closeness(
      difference,
      0.35,
    );
  }

  if (market === "btts") {
    const difference =
      (
        Math.abs(
          home.overall.bttsRate -
            home.venue.bttsRate,
        ) +
        Math.abs(
          away.overall.bttsRate -
            away.venue.bttsRate,
        )
      ) / 2;

    return closeness(
      difference,
      0.35,
    );
  }

  const oneXTwoConsistency = (
    oneXTwoSelection:
      | "home"
      | "draw"
      | "away",
  ) => {
    let first = 0;
    let second = 0;

    if (
      oneXTwoSelection === "home"
    ) {
      first = Math.abs(
        home.overall.winRate -
          home.venue.winRate,
      );

      second = Math.abs(
        away.overall.lossRate -
          away.venue.lossRate,
      );
    } else if (
      oneXTwoSelection === "draw"
    ) {
      first = Math.abs(
        home.overall.drawRate -
          home.venue.drawRate,
      );

      second = Math.abs(
        away.overall.drawRate -
          away.venue.drawRate,
      );
    } else {
      first = Math.abs(
        away.overall.winRate -
          away.venue.winRate,
      );

      second = Math.abs(
        home.overall.lossRate -
          home.venue.lossRate,
      );
    }

    return closeness(
      (first + second) / 2,
      0.3,
    );
  };

  if (market === "one_x_two") {
    return oneXTwoConsistency(
      selection as
        | "home"
        | "draw"
        | "away",
    );
  }

  if (selection === "1x") {
    return (
      oneXTwoConsistency("home") +
      oneXTwoConsistency("draw")
    ) / 2;
  }

  if (selection === "12") {
    return (
      oneXTwoConsistency("home") +
      oneXTwoConsistency("away")
    ) / 2;
  }

  return (
    oneXTwoConsistency("draw") +
    oneXTwoConsistency("away")
  ) / 2;
}

function headToHeadProbability(
  headToHead: HeadToHeadSummary,
  market: MarketKey,
  selection: MarketSelection,
): number | null {
  if (headToHead.sampleSize < 3) {
    return null;
  }

  if (market === "ou25") {
    return selection === "over_2_5"
      ? headToHead.over25Rate
      : 1 -
          headToHead.over25Rate;
  }

  if (market === "btts") {
    return selection === "yes"
      ? headToHead.bttsRate
      : 1 -
          headToHead.bttsRate;
  }

  if (market === "one_x_two") {
    if (selection === "home") {
      return headToHead.homeTeamWinRate;
    }

    if (selection === "draw") {
      return headToHead.drawRate;
    }

    return headToHead
      .homeTeamLossRate;
  }

  if (selection === "1x") {
    return (
      headToHead.homeTeamWinRate +
      headToHead.drawRate
    );
  }

  if (selection === "12") {
    return (
      headToHead.homeTeamWinRate +
      headToHead.homeTeamLossRate
    );
  }

  return (
    headToHead.drawRate +
    headToHead.homeTeamLossRate
  );
}

export function calculateMarketConfidence({
  market,
  selection,
  modelProbability,
  dataQuality,
  components,
  home,
  away,
  headToHead,
}: {
  market: MarketKey;
  selection: MarketSelection;
  modelProbability: number;
  dataQuality: number;
  components: ProbabilityComponents;
  home: TeamAnalysis;
  away: TeamAnalysis;
  headToHead: HeadToHeadSummary;
}): {
  confidence: number;
  breakdown: ConfidenceBreakdown;
} {
  const poissonProbability =
    probabilityForSelection(
      components.poisson,
      market,
      selection,
    );

  const empiricalProbability =
    probabilityForSelection(
      components.empirical,
      market,
      selection,
    );

  const modelAgreement = closeness(
    Math.abs(
      poissonProbability -
        empiricalProbability,
    ),
    0.2,
  );

  const consistency =
    formConsistency({
      home,
      away,
      market,
      selection,
    });

  const h2hProbability =
    headToHeadProbability(
      headToHead,
      market,
      selection,
    );

  const headToHeadSupport =
    h2hProbability === null
      ? 0.8
      : closeness(
          Math.abs(
            h2hProbability -
              modelProbability,
          ),
          0.35,
        );

  const breakdown = {
    dataQuality: round(dataQuality),
    modelAgreement: round(
      modelAgreement,
    ),
    formConsistency: round(
      consistency,
    ),
    headToHeadSupport: round(
      headToHeadSupport,
    ),
  };

  const confidence = round(
    clamp(
      breakdown.dataQuality *
        0.35 +
        breakdown.modelAgreement *
          0.35 +
        breakdown.formConsistency *
          0.25 +
        breakdown.headToHeadSupport *
          0.05,
      0,
      1,
    ),
  );

  return {
    confidence,
    breakdown,
  };
}
