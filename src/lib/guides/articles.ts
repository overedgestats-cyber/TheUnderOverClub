export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: "GOALS" | "BETTING BASICS" | "SMARTER BETTING";
  eyebrow: string;
  intro: string;
  sections: GuideSection[];
  related: string[];
};

export const guideArticles: GuideArticle[] = [
  {
    slug: "over-2-5-goals",
    title: "What Does Over 2.5 Goals Mean?",
    seoTitle: "What Does Over 2.5 Goals Mean? Football Betting Guide",
    description:
      "Learn what Over 2.5 goals means in football betting, how the market is settled, practical score examples, implied probability and the statistics commonly used to analyse it.",
    category: "GOALS",
    eyebrow: "GOALS MARKET GUIDE",
    intro:
      "Over 2.5 goals is one of football's simplest totals markets. You are not predicting the winner. You are predicting whether the match will finish with at least three total goals.",
    sections: [
      {
        heading: "How Over 2.5 goals works",
        paragraphs: [
          "A bet on Over 2.5 goals wins when the two teams score three or more goals combined during the settlement period. The half-goal line removes the possibility of a draw on the total: the match finishes either above or below 2.5 goals.",
          "For standard pre-match football markets, settlement normally uses the score after 90 minutes plus stoppage time. Extra time is usually excluded unless the bookmaker explicitly states otherwise.",
        ],
        bullets: [
          "2-1 = 3 total goals, so Over 2.5 wins.",
          "3-0 = 3 total goals, so Over 2.5 wins.",
          "2-2 = 4 total goals, so Over 2.5 wins.",
          "1-1 = 2 total goals, so Over 2.5 loses.",
          "1-0 = 1 total goal, so Over 2.5 loses.",
        ],
      },
      {
        heading: "What statistics matter?",
        paragraphs: [
          "A useful analysis should look beyond a team's overall league position. Recent scoring and conceding form, home and away splits, average total goals, the percentage of recent matches finishing over 2.5 and the quality of opposition can all add context.",
          "No single statistic guarantees an outcome. The purpose of combining several indicators is to estimate probability more realistically and compare that estimate with the price offered by the market.",
        ],
      },
      {
        heading: "Odds, probability and value",
        paragraphs: [
          "Decimal odds can be converted into an implied probability by dividing 1 by the odds. Odds of 1.80 imply roughly 55.6%. If a model estimates the true probability at 63%, the difference is approximately 7.4 percentage points.",
          "That difference is often called a value edge. A positive edge does not mean the bet will win; it means the estimated probability is higher than the probability implied by the available price.",
        ],
      },
    ],
    related: ["under-2-5-goals", "value-betting", "implied-probability"],
  },
  {
    slug: "under-2-5-goals",
    title: "What Does Under 2.5 Goals Mean?",
    seoTitle: "What Does Under 2.5 Goals Mean? Football Betting Guide",
    description:
      "Understand Under 2.5 goals betting with clear examples, settlement rules, useful football statistics and how probability relates to the available odds.",
    category: "GOALS",
    eyebrow: "GOALS MARKET GUIDE",
    intro:
      "Under 2.5 goals means backing a football match to finish with no more than two total goals. The teams do not need to draw and you do not need to predict which side will win.",
    sections: [
      {
        heading: "How Under 2.5 goals works",
        paragraphs: [
          "Under 2.5 wins when the final total is zero, one or two goals. Once a third goal is scored during the settlement period, the Under 2.5 selection can no longer win.",
        ],
        bullets: [
          "0-0 = Under 2.5 wins.",
          "1-0 = Under 2.5 wins.",
          "1-1 = Under 2.5 wins.",
          "2-0 = Under 2.5 wins.",
          "2-1 = Under 2.5 loses.",
          "3-0 = Under 2.5 loses.",
        ],
      },
      {
        heading: "When can an Under profile appear?",
        paragraphs: [
          "Low recent goal averages, strong defensive records, weaker attacking output, low-scoring home or away splits and a high percentage of recent matches below 2.5 goals can all support an Under case.",
          "Context still matters. Team news, match state, competition format and the quality of previous opponents can make raw historical percentages misleading if they are used in isolation.",
        ],
      },
      {
        heading: "Price matters as much as the pick",
        paragraphs: [
          "A strong-looking Under selection can still be a poor bet if the price is too short. The key question is not only whether Under 2.5 is likely, but whether the offered odds are high enough relative to your estimated probability.",
        ],
      },
    ],
    related: ["over-2-5-goals", "value-betting", "betting-odds"],
  },
  {
    slug: "btts-betting",
    title: "Both Teams to Score (BTTS) Explained",
    seoTitle: "BTTS Betting Explained: Both Teams to Score Guide",
    description:
      "Learn how Both Teams to Score betting works, what BTTS Yes and BTTS No mean, which statistics matter and how to compare the market with estimated probability.",
    category: "GOALS",
    eyebrow: "GOALS MARKET GUIDE",
    intro:
      "BTTS stands for Both Teams to Score. It is a football market focused on whether each team scores at least once, regardless of which side wins the match.",
    sections: [
      {
        heading: "BTTS Yes and BTTS No",
        paragraphs: [
          "BTTS Yes wins when both teams score at least one goal. BTTS No wins when at least one team fails to score. The final winner of the match is irrelevant to the market.",
        ],
        bullets: [
          "1-1 = BTTS Yes wins.",
          "2-1 = BTTS Yes wins.",
          "3-2 = BTTS Yes wins.",
          "1-0 = BTTS No wins.",
          "0-0 = BTTS No wins.",
          "3-0 = BTTS No wins.",
        ],
      },
      {
        heading: "Useful BTTS indicators",
        paragraphs: [
          "Recent scoring frequency, recent conceding frequency, clean-sheet rates, home and away scoring splits, expected-goal trends and the percentage of recent matches where both teams scored can all help build a BTTS view.",
          "It is important to consider both teams independently. A side that scores regularly may still be a weak BTTS candidate if its opponent rarely finds the net.",
        ],
      },
      {
        heading: "BTTS is different from Over 2.5",
        paragraphs: [
          "The two markets are related but not identical. A 3-0 score is Over 2.5 but BTTS No. A 1-1 score is Under 2.5 but BTTS Yes. Treating them as the same market can lead to poor analysis.",
        ],
      },
    ],
    related: ["over-2-5-goals", "under-2-5-goals", "value-betting"],
  },
  {
    slug: "football-betting-tips",
    title: "Football Betting Tips: How to Analyse a Match",
    seoTitle: "Football Betting Tips: How to Analyse a Match With Data",
    description:
      "A practical guide to analysing football matches using form, home and away performance, goals data, probability, odds and value instead of relying on gut feeling.",
    category: "BETTING BASICS",
    eyebrow: "ANALYSIS GUIDE",
    intro:
      "Good football analysis starts by separating prediction from price. The goal is not merely to identify what looks likely to happen, but to decide whether the available odds justify the risk.",
    sections: [
      {
        heading: "Start with the market",
        paragraphs: [
          "Different markets require different evidence. Over/Under analysis should focus heavily on goal production and prevention. BTTS needs evidence that both sides can score. 1X2 and Double Chance need stronger attention to win probability, home and away strength and match control.",
        ],
      },
      {
        heading: "Use recent form carefully",
        paragraphs: [
          "Recent results can be useful, but the score alone does not tell the full story. Consider who the team played, whether the match was home or away, how often chances were created and conceded, and whether the recent sample is representative.",
          "Home and away splits are especially important because some teams perform very differently depending on venue.",
        ],
      },
      {
        heading: "Translate analysis into probability",
        paragraphs: [
          "A betting decision becomes more useful when it is expressed as a probability. That estimate can then be compared with the bookmaker's implied probability to determine whether there may be value.",
          "Even a strong model will lose selections. Consistent record keeping and realistic staking are essential because short-term outcomes can differ significantly from long-run expectations.",
        ],
      },
      {
        heading: "Track results, not just winners",
        paragraphs: [
          "A credible process records wins, losses, voids, odds and profit or loss. ROI is particularly useful because it relates profit to the amount staked rather than focusing only on how often selections win.",
        ],
      },
    ],
    related: ["value-betting", "betting-odds", "betting-roi"],
  },
  {
    slug: "value-betting",
    title: "What Is Value Betting?",
    seoTitle: "What Is Value Betting? Probability, Odds and Value Explained",
    description:
      "Learn what value betting means, how model probability can be compared with bookmaker implied probability, and why a positive edge does not guarantee a winning bet.",
    category: "SMARTER BETTING",
    eyebrow: "VALUE GUIDE",
    intro:
      "Value betting is the idea of looking for prices where your estimated probability of an outcome is higher than the probability implied by the available odds.",
    sections: [
      {
        heading: "Probability first, price second",
        paragraphs: [
          "Suppose decimal odds of 2.00 are offered. Those odds imply a probability of 50% before allowing for bookmaker margin. If your analysis estimates the outcome at 58%, your estimate is eight percentage points higher than the simple implied probability.",
          "That does not mean the bet has a 100% chance of success. A 58% probability still means the outcome could fail frequently. Value is about the relationship between price and probability, not certainty.",
        ],
      },
      {
        heading: "Why favourites are not always value",
        paragraphs: [
          "A team can be very likely to win and still be a poor price. Equally, an underdog can be unlikely to win but still offer value if the odds compensate for the risk. The important comparison is estimated probability versus market price.",
        ],
      },
      {
        heading: "Value requires disciplined tracking",
        paragraphs: [
          "Because individual bets are noisy, value should be assessed over a large sample. Recording the original odds, stake, result and return allows you to calculate ROI and determine whether the process is producing positive results over time.",
        ],
      },
    ],
    related: ["implied-probability", "betting-odds", "betting-roi"],
  },
  {
    slug: "betting-odds",
    title: "How Do Betting Odds Work?",
    seoTitle: "How Do Betting Odds Work? Decimal Odds Explained",
    description:
      "Learn how decimal betting odds work, how to calculate potential returns, how odds relate to probability and why a shorter price does not guarantee a result.",
    category: "BETTING BASICS",
    eyebrow: "ODDS GUIDE",
    intro:
      "Betting odds represent both a potential return and the market's view of probability. In Europe, decimal odds are commonly used because the return calculation is straightforward.",
    sections: [
      {
        heading: "How decimal odds work",
        paragraphs: [
          "With decimal odds, potential total return equals stake multiplied by the odds. A €10 stake at 1.80 produces a potential total return of €18, which includes the original €10 stake and €8 profit.",
        ],
        bullets: [
          "€10 at 1.50 = €15 total return.",
          "€10 at 2.00 = €20 total return.",
          "€10 at 3.20 = €32 total return.",
        ],
      },
      {
        heading: "Odds and implied probability",
        paragraphs: [
          "A simple implied probability can be calculated as 1 divided by decimal odds, then multiplied by 100. Odds of 2.00 imply 50%. Odds of 1.50 imply about 66.7%. Odds of 3.00 imply about 33.3%.",
          "Bookmaker prices also contain margin, so the probabilities across all outcomes in a market usually add up to more than 100%.",
        ],
      },
      {
        heading: "Short odds are not the same as safe bets",
        paragraphs: [
          "Lower odds indicate a higher implied probability, not certainty. A selection at 1.30 can still lose. Evaluating the price against an independent estimate of probability is more informative than simply choosing the shortest odds.",
        ],
      },
    ],
    related: ["implied-probability", "value-betting", "betting-roi"],
  },
  {
    slug: "implied-probability",
    title: "How to Calculate Implied Probability",
    seoTitle: "How to Calculate Implied Probability From Betting Odds",
    description:
      "Learn how to convert decimal odds into implied probability, understand bookmaker margin and compare market probability with your own estimated probability.",
    category: "SMARTER BETTING",
    eyebrow: "PROBABILITY GUIDE",
    intro:
      "Implied probability translates betting odds into a percentage. It is one of the most useful tools for comparing a bookmaker's price with your own assessment of an outcome.",
    sections: [
      {
        heading: "The decimal-odds formula",
        paragraphs: [
          "For decimal odds, the basic formula is: implied probability = (1 / decimal odds) × 100.",
        ],
        bullets: [
          "1.50 odds = 66.7% implied probability.",
          "1.80 odds = 55.6% implied probability.",
          "2.00 odds = 50.0% implied probability.",
          "2.50 odds = 40.0% implied probability.",
          "3.00 odds = 33.3% implied probability.",
        ],
      },
      {
        heading: "Comparing model probability with the market",
        paragraphs: [
          "If odds of 1.80 imply 55.6% and your model estimates 63%, the raw difference is about +7.4 percentage points. That is one way to express a potential value edge.",
          "The model estimate should still be treated as uncertain. A probability is not a promise, and the accuracy of the estimate matters more than the size of the claimed edge.",
        ],
      },
      {
        heading: "Remember bookmaker margin",
        paragraphs: [
          "In a complete market, the bookmaker's implied probabilities often total more than 100%. The amount above 100% is related to the bookmaker's margin. More advanced analysis can remove that margin before comparing probabilities.",
        ],
      },
    ],
    related: ["betting-odds", "value-betting", "betting-roi"],
  },
  {
    slug: "double-chance",
    title: "What Is Double Chance Betting?",
    seoTitle: "What Is Double Chance Betting? 1X, 12 and X2 Explained",
    description:
      "Understand Double Chance football betting, including 1X, 12 and X2, with examples and the statistics that can help analyse each selection.",
    category: "BETTING BASICS",
    eyebrow: "MARKET GUIDE",
    intro:
      "Double Chance combines two of the three possible 1X2 match outcomes into one selection. It reduces the number of ways your bet can lose, but the odds are normally shorter than backing a single 1X2 outcome.",
    sections: [
      {
        heading: "The three Double Chance options",
        paragraphs: [
          "The standard options are 1X, 12 and X2. The numbers refer to the traditional football coupon notation where 1 is the home team, X is the draw and 2 is the away team.",
        ],
        bullets: [
          "1X = home win or draw.",
          "12 = home win or away win; the draw loses.",
          "X2 = draw or away win.",
        ],
      },
      {
        heading: "How to analyse Double Chance",
        paragraphs: [
          "Useful inputs can include home and away win rates, unbeaten runs, points per game, team strength by venue, recent opponent quality and the probability of a draw.",
          "Because two outcomes are covered, Double Chance can look safer than 1X2. The trade-off is price: the odds are usually lower, so the same principle of probability versus price still applies.",
        ],
      },
      {
        heading: "Double Chance is not a guarantee",
        paragraphs: [
          "Covering two outcomes reduces risk but does not eliminate it. A 1X selection still loses if the away team wins, while X2 still loses if the home team wins.",
        ],
      },
    ],
    related: ["1x2-betting", "value-betting", "betting-odds"],
  },
  {
    slug: "1x2-betting",
    title: "What Does 1X2 Mean in Football Betting?",
    seoTitle: "What Does 1X2 Mean in Football Betting? 1, X and 2 Explained",
    description:
      "Learn what 1X2 means in football betting, how home, draw and away selections work, and which statistics can help estimate each outcome.",
    category: "BETTING BASICS",
    eyebrow: "MARKET GUIDE",
    intro:
      "1X2 is the traditional football match-result market. It asks you to choose one of three outcomes after the standard settlement period: home win, draw or away win.",
    sections: [
      {
        heading: "What 1, X and 2 mean",
        paragraphs: [
          "The notation is simple: 1 means the home team wins, X means the match finishes as a draw and 2 means the away team wins.",
        ],
        bullets: [
          "1 = Home win.",
          "X = Draw.",
          "2 = Away win.",
        ],
      },
      {
        heading: "Useful 1X2 statistics",
        paragraphs: [
          "Home and away win rates, points per game, recent form, expected performance, goal difference, team availability, opponent strength and historical home-field performance can all contribute to an estimate.",
          "Head-to-head results can add context, but older meetings should usually carry less weight because squads, managers and playing styles change.",
        ],
      },
      {
        heading: "Compare the estimate with the price",
        paragraphs: [
          "If you estimate a home team has a 55% chance of winning, the fair decimal price before margin would be about 1.82. If the market offers a substantially shorter price, the selection may be unattractive even if you still think the home team is the most likely winner.",
        ],
      },
    ],
    related: ["double-chance", "implied-probability", "value-betting"],
  },
  {
    slug: "betting-roi",
    title: "What Is ROI in Sports Betting?",
    seoTitle: "What Is ROI in Sports Betting? Betting ROI Explained",
    description:
      "Learn what ROI means in sports betting, how to calculate it, why it is different from win rate and how it can be used to evaluate a betting record.",
    category: "SMARTER BETTING",
    eyebrow: "PERFORMANCE GUIDE",
    intro:
      "ROI stands for Return on Investment. In betting analysis, it measures profit or loss relative to the total amount staked and is more informative than win rate alone.",
    sections: [
      {
        heading: "How betting ROI is calculated",
        paragraphs: [
          "A simple formula is: ROI = profit or loss divided by total stake, multiplied by 100. If 100 units are staked and the final profit is 8 units, ROI is +8%. If the result is a 5-unit loss, ROI is -5%.",
        ],
      },
      {
        heading: "Why ROI and win rate are different",
        paragraphs: [
          "Win rate only tells you how often selections win. It does not account for the odds. A strategy can win frequently and still lose money if the prices are too short, while a lower win rate can still be profitable if winning selections pay enough.",
          "That is why a transparent record should include prices, settled results and profit or loss rather than highlighting winning percentages alone.",
        ],
      },
      {
        heading: "Sample size matters",
        paragraphs: [
          "Short-term ROI can move dramatically after only a few results. A larger sample gives a more useful picture of performance, although historical ROI still does not guarantee future results.",
        ],
      },
      {
        heading: "How we use ROI",
        paragraphs: [
          "The Under Over Club tracks published selections and calculates performance from settled priced picks. Pending selections are not treated as wins or losses, and historical records should retain losing picks as well as winning ones.",
        ],
      },
    ],
    related: ["value-betting", "betting-odds", "football-betting-tips"],
  },
];

export const guideBySlug = new Map(
  guideArticles.map((article) => [article.slug, article]),
);

export const guideCategories = [
  "GOALS",
  "BETTING BASICS",
  "SMARTER BETTING",
] as const;
