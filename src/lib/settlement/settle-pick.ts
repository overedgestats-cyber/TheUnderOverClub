export type SupportedMarket =
  | "ou25"
  | "btts"
  | "one_x_two"
  | "double_chance";

export type PickResult =
  | "won"
  | "lost"
  | "void";

export function settleSelection({
  market,
  selection,
  homeScore,
  awayScore,
}: {
  market: SupportedMarket;
  selection: string;
  homeScore: number;
  awayScore: number;
}): PickResult {
  const totalGoals = homeScore + awayScore;

  if (market === "ou25") {
    if (selection === "over_2_5") return totalGoals >= 3 ? "won" : "lost";
    if (selection === "under_2_5") return totalGoals <= 2 ? "won" : "lost";
    throw new Error(`Unsupported O/U 2.5 selection: ${selection}`);
  }

  if (market === "btts") {
    const bothScored = homeScore > 0 && awayScore > 0;
    if (selection === "yes") return bothScored ? "won" : "lost";
    if (selection === "no") return bothScored ? "lost" : "won";
    throw new Error(`Unsupported BTTS selection: ${selection}`);
  }

  if (market === "one_x_two") {
    const outcome = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";
    return outcome === selection ? "won" : "lost";
  }

  if (market === "double_chance") {
    const homeWins = homeScore > awayScore;
    const draw = homeScore === awayScore;
    const awayWins = homeScore < awayScore;
    if (selection === "1x") return homeWins || draw ? "won" : "lost";
    if (selection === "12") return homeWins || awayWins ? "won" : "lost";
    if (selection === "x2") return draw || awayWins ? "won" : "lost";
    throw new Error(`Unsupported Double Chance selection: ${selection}`);
  }

  throw new Error(`Unsupported market: ${market}`);
}

export function unitProfitForResult({ result, odds }: { result: PickResult; odds: number | null; }): number | null {
  if (odds === null) return null;
  if (result === "won") return Number((odds - 1).toFixed(6));
  if (result === "lost") return -1;
  return 0;
}
