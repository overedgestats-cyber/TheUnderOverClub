export type Venue = "home" | "away";

export type TeamFormMetrics = {
  sampleSize: number;
  wins: number;
  draws: number;
  losses: number;
  goalsForAverage: number;
  goalsAgainstAverage: number;
  totalGoalsAverage: number;
  over25Rate: number;
  under25Rate: number;
  bttsRate: number;
  scoredRate: number;
  cleanSheetRate: number;
  failedToScoreRate: number;
  pointsPerGame: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  unbeatenRate: number;
};

export type TeamAnalysis = {
  teamId: number;
  teamName: string;
  overall: TeamFormMetrics;
  venue: TeamFormMetrics;
  venueType: Venue;
  dataQuality: number;
};

export type OneXTwoProbabilities = {
  home: number;
  draw: number;
  away: number;
};

export type MatchProbabilities = {
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  oneXTwo: OneXTwoProbabilities;
  doubleChance: {
    oneX: number;
    twelve: number;
    xTwo: number;
  };
};

export type ProbabilityComponents = {
  poisson: MatchProbabilities;
  empirical: MatchProbabilities;
};

export type MarketSelection =
  | "over_2_5"
  | "under_2_5"
  | "yes"
  | "no"
  | "1x"
  | "12"
  | "x2"
  | "home"
  | "draw"
  | "away";

export type MarketKey =
  | "ou25"
  | "btts"
  | "double_chance"
  | "one_x_two";

export type ConsensusOdd = {
  market: MarketKey;
  selection: MarketSelection;
  odds: number;
  bookmakerCount: number;
  source:
    | "bet365"
    | "market_median_fallback";
  fairProbability: number | null;
  fairProbabilitySource:
    | "devigged_binary_market"
    | "devigged_1x2_market"
    | "devigged_1x2_derived"
    | null;
};

export type ConfidenceBreakdown = {
  dataQuality: number;
  modelAgreement: number;
  formConsistency: number;
  headToHeadSupport: number;
};

export type RecommendationCandidate = {
  market: MarketKey;
  selection: MarketSelection;
  modelProbability: number;
  odds: number | null;
  bookmakerProbability: number | null;
  bookmakerProbabilitySource:
    | "devigged_binary_market"
    | "devigged_1x2_market"
    | "devigged_1x2_derived"
    | "raw_implied_fallback"
    | null;
  valueEdge: number | null;
  confidence: number;
  confidenceLabel:
    | "Elite"
    | "Strong"
    | "Good"
    | "Below threshold";
  confidenceBreakdown: ConfidenceBreakdown;
  dataQuality: number;
  qualifies: boolean;
  rejectionReasons: string[];
};
