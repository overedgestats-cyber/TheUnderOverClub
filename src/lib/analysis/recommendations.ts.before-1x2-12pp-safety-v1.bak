import {
  round,
} from "@/lib/analysis/math";
import {
  calculateMarketConfidence,
} from "@/lib/analysis/confidence";
import type {
  ConsensusOdd,
  MarketKey,
  MarketSelection,
  MatchProbabilities,
  ProbabilityComponents,
  RecommendationCandidate,
  TeamAnalysis,
} from "@/lib/analysis/types";

const MINIMUM_CONFIDENCE = 0.75;
const MINIMUM_VALUE_EDGE = 0.05;
const MINIMUM_DATA_QUALITY = 0.65;

/*
 * 1X2 is materially more fragile than O/U or BTTS in the current model
 * because the model uses recent raw team results/goals without an
 * opponent-strength or competition-strength adjustment.
 *
 * Keep extreme disagreements for model calibration/tracking, but do not
 * surface them as official customer-facing recommendations.
 *
 * These are anomaly guards, not replacements for the normal qualification
 * thresholds.
 */
const ONE_X_TWO_EXTREME_EDGE = 0.18;
const ONE_X_TWO_LOW_MARKET_PROBABILITY = 0.18;
const ONE_X_TWO_MAX_MODEL_TO_MARKET_RATIO = 2.25;

type HeadToHeadSummary = {
  sampleSize: number;
  homeTeamWinRate: number;
  drawRate: number;
  homeTeamLossRate: number;
  over25Rate: number;
  bttsRate: number;
};

function confidenceLabel(
  confidence: number,
): RecommendationCandidate["confidenceLabel"] {
  if (confidence >= 0.9) {
    return "Elite";
  }

  if (confidence >= 0.82) {
    return "Strong";
  }

  if (confidence >= 0.75) {
    return "Good";
  }

  return "Below threshold";
}

function selectionProbabilities(
  probabilities: MatchProbabilities,
): Array<{
  market: MarketKey;
  selection: MarketSelection;
  probability: number;
}> {
  return [
    {
      market: "ou25",
      selection: "over_2_5",
      probability:
        probabilities.over25,
    },
    {
      market: "ou25",
      selection: "under_2_5",
      probability:
        probabilities.under25,
    },
    {
      market: "btts",
      selection: "yes",
      probability:
        probabilities.bttsYes,
    },
    {
      market: "btts",
      selection: "no",
      probability:
        probabilities.bttsNo,
    },
    {
      market: "double_chance",
      selection: "1x",
      probability:
        probabilities.doubleChance.oneX,
    },
    {
      market: "double_chance",
      selection: "12",
      probability:
        probabilities.doubleChance.twelve,
    },
    {
      market: "double_chance",
      selection: "x2",
      probability:
        probabilities.doubleChance.xTwo,
    },
    {
      market: "one_x_two",
      selection: "home",
      probability:
        probabilities.oneXTwo.home,
    },
    {
      market: "one_x_two",
      selection: "draw",
      probability:
        probabilities.oneXTwo.draw,
    },
    {
      market: "one_x_two",
      selection: "away",
      probability:
        probabilities.oneXTwo.away,
    },
  ];
}

function strongestPerMarket(
  values: ReturnType<
    typeof selectionProbabilities
  >,
) {
  const grouped = new Map<
    MarketKey,
    (typeof values)[number]
  >();

  for (const value of values) {
    const current = grouped.get(
      value.market,
    );

    if (
      !current ||
      value.probability >
        current.probability
    ) {
      grouped.set(
        value.market,
        value,
      );
    }
  }

  return Array.from(grouped.values());
}

function oneXTwoSanityReason({
  market,
  modelProbability,
  bookmakerProbability,
  valueEdge,
}: {
  market: MarketKey;
  modelProbability: number;
  bookmakerProbability: number | null;
  valueEdge: number | null;
}): string | null {
  if (
    market !==
      "one_x_two" ||
    bookmakerProbability ===
      null ||
    valueEdge ===
      null
  ) {
    return null;
  }

  if (
    valueEdge >=
    ONE_X_TWO_EXTREME_EDGE
  ) {
    return "1X2 model-market disagreement is too extreme for an official pick";
  }

  if (
    bookmakerProbability <
      ONE_X_TWO_LOW_MARKET_PROBABILITY &&
    modelProbability /
      Math.max(
        bookmakerProbability,
        0.0001,
      ) >=
      ONE_X_TWO_MAX_MODEL_TO_MARKET_RATIO
  ) {
    return "1X2 long-shot probability is too far above the market for an official pick";
  }

  return null;
}

export function buildRecommendationCandidates({
  probabilities,
  components,
  consensusOdds,
  dataQuality,
  home,
  away,
  headToHead,
}: {
  probabilities: MatchProbabilities;
  components: ProbabilityComponents;
  consensusOdds: ConsensusOdd[];
  dataQuality: number;
  home: TeamAnalysis;
  away: TeamAnalysis;
  headToHead: HeadToHeadSummary;
}): RecommendationCandidate[] {
  const oddsMap = new Map(
    consensusOdds.map((odd) => [
      `${odd.market}:${odd.selection}`,
      odd,
    ]),
  );

  return strongestPerMarket(
    selectionProbabilities(
      probabilities,
    ),
  )
    .map((selection) => {
      const odd = oddsMap.get(
        `${selection.market}:${selection.selection}`,
      );

      const modelProbability =
        round(selection.probability);

      const confidenceResult =
        calculateMarketConfidence({
          market: selection.market,
          selection:
            selection.selection,
          modelProbability,
          dataQuality,
          components,
          home,
          away,
          headToHead,
        });

      const bookmakerProbability =
        odd
          ? round(
              odd.fairProbability ??
                1 / odd.odds,
            )
          : null;

      const bookmakerProbabilitySource:
        RecommendationCandidate["bookmakerProbabilitySource"] =
        odd
          ? (
              odd.fairProbabilitySource ??
              "raw_implied_fallback"
            )
          : null;

      const valueEdge =
        bookmakerProbability !== null
          ? round(
              modelProbability -
                bookmakerProbability,
            )
          : null;

      const rejectionReasons: string[] =
        [];

      if (!odd) {
        rejectionReasons.push(
          "No valid market odds",
        );
      }

      if (
        dataQuality <
        MINIMUM_DATA_QUALITY
      ) {
        rejectionReasons.push(
          "Insufficient data quality",
        );
      }

      if (
        confidenceResult.confidence <
        MINIMUM_CONFIDENCE
      ) {
        rejectionReasons.push(
          "Confidence below 75%",
        );
      }

      if (
        valueEdge === null ||
        valueEdge <
          MINIMUM_VALUE_EDGE
      ) {
        rejectionReasons.push(
          "Value edge below +5 percentage points",
        );
      }

      const sanityReason =
        oneXTwoSanityReason({
          market:
            selection.market,
          modelProbability,
          bookmakerProbability,
          valueEdge,
        });

      if (sanityReason) {
        rejectionReasons.push(
          sanityReason,
        );
      }

      return {
        market: selection.market,
        selection:
          selection.selection,
        modelProbability,
        odds: odd?.odds ?? null,
        bookmakerProbability,
        bookmakerProbabilitySource,
        valueEdge,
        confidence:
          confidenceResult.confidence,
        confidenceLabel:
          confidenceLabel(
            confidenceResult.confidence,
          ),
        confidenceBreakdown:
          confidenceResult.breakdown,
        dataQuality: round(
          dataQuality,
        ),
        qualifies:
          rejectionReasons.length === 0,
        rejectionReasons,
      };
    })
    .sort((first, second) => {
      const firstEdge =
        first.valueEdge ??
        Number.NEGATIVE_INFINITY;

      const secondEdge =
        second.valueEdge ??
        Number.NEGATIVE_INFINITY;

      if (secondEdge !== firstEdge) {
        return secondEdge - firstEdge;
      }

      return (
        second.confidence -
        first.confidence
      );
    });
}
