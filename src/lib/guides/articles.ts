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
    related: ["how-to-predict-over-2-5-goals", "under-2-5-goals", "value-betting"],
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
    related: ["btts-strategy", "btts-over-2-5", "over-2-5-goals"],
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
    related: ["how-to-predict-over-2-5-goals", "value-betting", "betting-roi"],
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
    related: ["fair-betting-odds", "bookmaker-margin-overround", "betting-roi"],
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
    related: ["implied-probability", "fair-betting-odds", "bookmaker-margin-overround"],
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
    related: ["fair-betting-odds", "bookmaker-margin-overround", "value-betting"],
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
    related: ["value-betting", "bankroll-management", "fair-betting-odds"],
  },

  /* ---------------------------------------------------------------------- */
  /* SEO BATCH 2 — GUIDES 11–20                                            */
  /* ---------------------------------------------------------------------- */

  {
    slug: "how-to-predict-over-2-5-goals",
    title: "How to Predict Over 2.5 Goals Using Statistics",
    seoTitle: "How to Predict Over 2.5 Goals Using Football Statistics",
    description:
      "Learn how to analyse Over 2.5 goals using recent form, scoring and conceding data, home and away splits, xG, probability and bookmaker odds.",
    category: "GOALS",
    eyebrow: "OVER 2.5 STRATEGY",
    intro:
      "Predicting Over 2.5 goals is not about finding teams with a few recent high scores. A stronger process combines several independent indicators, turns them into an estimated probability and then compares that probability with the market price.",
    sections: [
      {
        heading: "Start with recent goal production",
        paragraphs: [
          "A useful first step is to measure how often each team scores and concedes across a recent sample. Average total goals and the percentage of matches finishing Over 2.5 can reveal whether the teams regularly participate in higher-scoring games.",
          "Recent results should not be treated equally. A 4-2 result against a very strong attack may tell a different story from a 4-2 result against a struggling side, so opponent quality and match context matter.",
        ],
      },
      {
        heading: "Separate home and away performance",
        paragraphs: [
          "Football teams can behave very differently depending on venue. A strong home attack may create much more pressure in its own stadium, while an away side may concede more chances on the road.",
          "For that reason, a home team's home matches and an away team's away matches can be more informative than a single blended season average.",
        ],
      },
      {
        heading: "Combine rates instead of trusting one number",
        paragraphs: [
          "Over 2.5 rate, average goals, scoring frequency, conceding frequency and expected-goal trends can all contribute to the analysis. When several indicators point in the same direction, the case is stronger than when only one statistic looks attractive.",
          "No threshold guarantees a result. The objective is to estimate the chance of three or more goals as accurately as possible.",
        ],
      },
      {
        heading: "Compare your probability with the odds",
        paragraphs: [
          "After estimating a probability, convert the available decimal odds into implied probability. If your estimate is meaningfully higher than the market's implied probability, there may be a value edge.",
          "The Under Over Club uses this probability-versus-price concept when evaluating published selections. A likely outcome is not automatically a good bet if the price is too short.",
        ],
      },
    ],
    related: ["over-2-5-goals", "xg-expected-goals", "implied-probability"],
  },
  {
    slug: "best-leagues-over-2-5-goals",
    title: "Best Leagues for Over 2.5 Goals",
    seoTitle: "Best Leagues for Over 2.5 Goals: What Statistics Matter?",
    description:
      "Learn how to identify high-scoring football leagues for Over 2.5 goals using goal averages, Over 2.5 rates, home and away trends and current-season data.",
    category: "GOALS",
    eyebrow: "LEAGUE ANALYSIS",
    intro:
      "The best league for Over 2.5 goals is not permanently fixed. Goal environments change from season to season, so the most useful approach is to rank competitions using current data rather than relying on reputation.",
    sections: [
      {
        heading: "Use current-season league data",
        paragraphs: [
          "Start with the percentage of league matches finishing with at least three goals and the average number of goals per match. Those two figures provide a broad view of the competition's scoring environment.",
          "A league can change significantly after promotions, relegations, coaching changes or tactical shifts, which is why old rankings should not automatically be carried into a new season.",
        ],
      },
      {
        heading: "Look beyond the league average",
        paragraphs: [
          "A high-scoring league still contains defensive teams and low-scoring fixtures. The league profile should be used as context, not as a reason to back every match.",
          "Team-level home and away data, recent form and matchup characteristics are still necessary before estimating the probability of Over 2.5 in an individual fixture.",
        ],
      },
      {
        heading: "Useful league-ranking metrics",
        paragraphs: [
          "A practical league comparison can use several metrics together instead of relying on total goals alone.",
        ],
        bullets: [
          "Percentage of matches finishing Over 2.5 goals.",
          "Average total goals per match.",
          "Percentage of teams scoring at least once.",
          "BTTS rate across the competition.",
          "Home and away goal averages.",
          "Recent trend compared with the season average.",
        ],
      },
      {
        heading: "High scoring does not automatically mean value",
        paragraphs: [
          "Bookmakers also know which leagues produce goals, and popular high-scoring competitions may have shorter Over prices. The final decision should still compare estimated probability with implied probability.",
        ],
      },
    ],
    related: ["how-to-predict-over-2-5-goals", "over-2-5-goals", "value-betting"],
  },
  {
    slug: "over-1-5-goals",
    title: "What Does Over 1.5 Goals Mean?",
    seoTitle: "What Does Over 1.5 Goals Mean? Football Betting Guide",
    description:
      "Learn what Over 1.5 goals means, which football scores win or lose, how the odds differ from Over 2.5 and what statistics can help analyse the market.",
    category: "GOALS",
    eyebrow: "GOALS MARKET GUIDE",
    intro:
      "Over 1.5 goals means the match needs at least two total goals. It is a lower goal line than Over 2.5, so it will usually have a higher estimated probability and shorter odds.",
    sections: [
      {
        heading: "Over 1.5 score examples",
        paragraphs: [
          "Any result containing two or more total goals settles Over 1.5 as a winner under standard match settlement rules.",
        ],
        bullets: [
          "1-1 = 2 goals, so Over 1.5 wins.",
          "2-0 = 2 goals, so Over 1.5 wins.",
          "2-1 = 3 goals, so Over 1.5 wins.",
          "1-0 = 1 goal, so Over 1.5 loses.",
          "0-0 = 0 goals, so Over 1.5 loses.",
        ],
      },
      {
        heading: "Over 1.5 versus Over 2.5",
        paragraphs: [
          "Over 1.5 only needs two goals, while Over 2.5 needs at least three. Because the lower line covers more possible scorelines, bookmakers normally offer a shorter price for Over 1.5.",
          "Shorter odds are not automatically better value. The price still needs to be compared with the estimated probability.",
        ],
      },
      {
        heading: "What to analyse",
        paragraphs: [
          "Scoring frequency, conceding frequency, recent total-goal averages and the percentage of matches reaching two goals can all help evaluate the market. Home and away splits remain important.",
        ],
      },
    ],
    related: ["over-2-5-goals", "over-3-5-goals", "betting-odds"],
  },
  {
    slug: "over-3-5-goals",
    title: "What Does Over 3.5 Goals Mean?",
    seoTitle: "What Does Over 3.5 Goals Mean? Football Betting Guide",
    description:
      "Understand Over 3.5 goals betting with score examples, probability, odds and the football statistics used to analyse higher-scoring matches.",
    category: "GOALS",
    eyebrow: "GOALS MARKET GUIDE",
    intro:
      "Over 3.5 goals requires at least four total goals in the match. Because four goals occur less often than two or three, the market normally offers higher odds than lower Over lines.",
    sections: [
      {
        heading: "Over 3.5 score examples",
        paragraphs: [
          "The two teams can contribute the goals in any combination. Only the total matters.",
        ],
        bullets: [
          "2-2 = 4 goals, so Over 3.5 wins.",
          "3-1 = 4 goals, so Over 3.5 wins.",
          "4-0 = 4 goals, so Over 3.5 wins.",
          "2-1 = 3 goals, so Over 3.5 loses.",
          "1-1 = 2 goals, so Over 3.5 loses.",
        ],
      },
      {
        heading: "Higher lines need stronger evidence",
        paragraphs: [
          "A fixture can be a reasonable Over 2.5 candidate without being a strong Over 3.5 candidate. Requiring a fourth goal makes attacking quality, defensive vulnerability and game-state dynamics even more important.",
        ],
      },
      {
        heading: "Price and probability",
        paragraphs: [
          "Higher odds can look attractive, but the probability is lower. The useful question is whether the offered price is greater than the fair price implied by your own probability estimate.",
        ],
      },
    ],
    related: ["over-2-5-goals", "over-1-5-goals", "fair-betting-odds"],
  },
  {
    slug: "btts-strategy",
    title: "BTTS Betting Strategy: What Statistics Matter?",
    seoTitle: "BTTS Betting Strategy: What Football Statistics Matter?",
    description:
      "Learn how to analyse Both Teams to Score using scoring frequency, clean sheets, home and away splits, xG and bookmaker implied probability.",
    category: "GOALS",
    eyebrow: "BTTS STRATEGY",
    intro:
      "A BTTS strategy should answer two separate questions: how likely is the home team to score, and how likely is the away team to score? Treating both teams independently produces a clearer view than relying on one combined BTTS percentage.",
    sections: [
      {
        heading: "Measure each team's scoring reliability",
        paragraphs: [
          "Check how often each team has scored recently and how that record changes by venue. A team that scores in most home games may be much less reliable away from home.",
          "The opponent's defensive record matters at the same time. Strong scoring form against a side that regularly keeps clean sheets creates a more complicated matchup than the raw scoring percentage suggests.",
        ],
      },
      {
        heading: "Clean sheets and failed-to-score rates",
        paragraphs: [
          "Clean-sheet percentage and failed-to-score percentage can be especially useful for BTTS because the market fails whenever either team finishes on zero.",
          "A high BTTS rate can be misleading if it comes from a small sample, so recent data should be compared with a broader baseline.",
        ],
      },
      {
        heading: "Use xG as supporting evidence",
        paragraphs: [
          "Expected goals can help distinguish repeated chance creation from a short run of unusually efficient finishing. It can also identify teams that are conceding dangerous chances even when recent scorelines look relatively strong.",
        ],
      },
      {
        heading: "Convert the analysis into a price decision",
        paragraphs: [
          "Once you estimate the probability of both teams scoring, compare that estimate with the implied probability of BTTS Yes or BTTS No. The market with the higher estimated chance is not necessarily the better value.",
        ],
      },
    ],
    related: ["btts-betting", "btts-over-2-5", "xg-expected-goals"],
  },
  {
    slug: "btts-over-2-5",
    title: "BTTS and Over 2.5 Goals Explained",
    seoTitle: "BTTS and Over 2.5 Goals Explained: How the Combo Works",
    description:
      "Learn how BTTS and Over 2.5 goals work together, which scorelines win the combined market and how it differs from betting either market separately.",
    category: "GOALS",
    eyebrow: "COMBINED MARKET GUIDE",
    intro:
      "BTTS and Over 2.5 combines two conditions: both teams must score and the match must contain at least three total goals. A result can satisfy one condition without satisfying the other.",
    sections: [
      {
        heading: "Which scores win?",
        paragraphs: [
          "To win the combined BTTS Yes + Over 2.5 market, each team must score at least once and the total must reach three goals.",
        ],
        bullets: [
          "2-1 = BTTS Yes and Over 2.5 both win.",
          "1-2 = BTTS Yes and Over 2.5 both win.",
          "2-2 = BTTS Yes and Over 2.5 both win.",
          "1-1 = BTTS Yes, but Over 2.5 loses.",
          "3-0 = Over 2.5, but BTTS Yes loses.",
        ],
      },
      {
        heading: "Why the combined odds are higher",
        paragraphs: [
          "The combined selection has more conditions than either standalone market, so its probability is lower. That usually leads to a higher price, but higher odds do not automatically mean better value.",
        ],
      },
      {
        heading: "What statistics matter",
        paragraphs: [
          "Look for evidence that both teams can score and that the match can reach three goals. Scoring frequency, conceding frequency, BTTS rate, Over 2.5 rate, goal averages and xG can all contribute.",
        ],
      },
    ],
    related: ["btts-betting", "btts-strategy", "over-2-5-goals"],
  },
  {
    slug: "xg-expected-goals",
    title: "What Is xG in Football?",
    seoTitle: "What Is xG in Football? Expected Goals Explained Simply",
    description:
      "Learn what expected goals (xG) means, how xG differs from actual goals and how it can add context to football match and betting analysis.",
    category: "BETTING BASICS",
    eyebrow: "FOOTBALL DATA GUIDE",
    intro:
      "Expected goals, usually shortened to xG, is a statistical measure that estimates the quality of scoring chances. It helps describe how dangerous a team's opportunities were, rather than only counting the goals that happened to go in.",
    sections: [
      {
        heading: "What an xG value represents",
        paragraphs: [
          "Each shot is assigned an estimated chance of becoming a goal based on characteristics of the attempt. Those shot values can then be added together to create a team's xG total for the match.",
          "An xG total is an estimate, not a prediction that the team should have scored exactly that number of goals.",
        ],
      },
      {
        heading: "Why xG can add context",
        paragraphs: [
          "Final scores can be noisy. A team can score three goals from a small number of difficult chances, while another team can create many strong chances and finish with zero. xG helps describe the underlying chance quality behind those outcomes.",
        ],
      },
      {
        heading: "xG and goals markets",
        paragraphs: [
          "For Over/Under and BTTS analysis, recent xG for and against can support traditional statistics such as actual goals, scoring frequency and clean sheets. It can help identify whether recent scorelines are broadly supported by chance creation.",
        ],
      },
      {
        heading: "Do not use xG alone",
        paragraphs: [
          "Different xG models can produce different values, and xG does not capture every tactical factor. It is best treated as one input within a broader model rather than a standalone betting signal.",
        ],
      },
    ],
    related: ["how-to-predict-over-2-5-goals", "btts-strategy", "football-betting-tips"],
  },
  {
    slug: "fair-betting-odds",
    title: "How to Calculate Fair Betting Odds",
    seoTitle: "How to Calculate Fair Betting Odds From Probability",
    description:
      "Learn how to convert your estimated probability into fair decimal odds and compare fair price with bookmaker odds when looking for betting value.",
    category: "SMARTER BETTING",
    eyebrow: "ODDS & VALUE GUIDE",
    intro:
      "Fair odds are the decimal price that corresponds to an estimated probability before bookmaker margin. Converting probability into a price makes it easier to compare your analysis directly with the market.",
    sections: [
      {
        heading: "The fair-odds formula",
        paragraphs: [
          "For decimal odds, fair odds = 1 divided by probability expressed as a decimal. A 50% probability corresponds to fair odds of 2.00, while a 60% probability corresponds to approximately 1.67.",
        ],
        bullets: [
          "40% probability = 2.50 fair odds.",
          "50% probability = 2.00 fair odds.",
          "55% probability = about 1.82 fair odds.",
          "60% probability = about 1.67 fair odds.",
          "70% probability = about 1.43 fair odds.",
        ],
      },
      {
        heading: "Compare fair odds with market odds",
        paragraphs: [
          "If your estimated fair price is 1.67 and a bookmaker offers 1.80, the market price is higher than your fair price. That may indicate positive value if your probability estimate is accurate.",
          "If the bookmaker offers 1.55 instead, the price may be too short even though you still consider the outcome likely.",
        ],
      },
      {
        heading: "Fair odds depend on the quality of the estimate",
        paragraphs: [
          "The calculation is simple; estimating probability accurately is the difficult part. Poor probability estimates produce poor fair prices, so fair odds should be supported by disciplined analysis rather than intuition alone.",
        ],
      },
    ],
    related: ["implied-probability", "value-betting", "bookmaker-margin-overround"],
  },
  {
    slug: "bookmaker-margin-overround",
    title: "What Is Bookmaker Margin and Overround?",
    seoTitle: "Bookmaker Margin and Overround Explained",
    description:
      "Learn what bookmaker margin and overround mean, why implied probabilities can add to more than 100% and how margin affects betting prices.",
    category: "SMARTER BETTING",
    eyebrow: "MARKET PRICING GUIDE",
    intro:
      "Bookmaker prices are normally built with a margin. When the implied probabilities of every outcome are added together, the total often exceeds 100%. That excess is commonly called the overround.",
    sections: [
      {
        heading: "A simple two-outcome example",
        paragraphs: [
          "Imagine both sides of a market are priced at decimal odds of 1.90. Each price implies about 52.63%. Added together, the two implied probabilities equal about 105.26% rather than 100%.",
          "The extra percentage reflects the pricing margin embedded in the market, although the bookmaker's real expected margin can differ depending on how money is distributed and how the market moves.",
        ],
      },
      {
        heading: "Why margin matters for value analysis",
        paragraphs: [
          "If you compare a model probability directly with a raw bookmaker probability, you should remember that the bookmaker probability contains margin. Removing or accounting for that margin can make market comparisons more precise.",
        ],
      },
      {
        heading: "Lower margin does not guarantee a winning bet",
        paragraphs: [
          "A more competitive price is useful, but the underlying probability estimate still matters. Price shopping can improve long-run returns without changing the actual football outcome.",
        ],
      },
    ],
    related: ["implied-probability", "fair-betting-odds", "value-betting"],
  },
  {
    slug: "bankroll-management",
    title: "Football Betting Bankroll Management",
    seoTitle: "Football Betting Bankroll Management: A Practical Guide",
    description:
      "Learn the basics of football betting bankroll management, unit staking, variance, record keeping and why stake discipline matters even with a positive strategy.",
    category: "SMARTER BETTING",
    eyebrow: "BANKROLL GUIDE",
    intro:
      "Bankroll management is the process of deciding how much of a dedicated betting fund to risk on each selection. Its purpose is not to make losing bets disappear; it is to control risk so short-term variance does not destroy the entire bankroll.",
    sections: [
      {
        heading: "Use a separate bankroll",
        paragraphs: [
          "Money reserved for betting should be separate from essential living expenses, bills and savings. If losing the bankroll would create financial difficulty, the bankroll is too large.",
        ],
      },
      {
        heading: "Think in units",
        paragraphs: [
          "A unit is a standard stake size expressed as a fraction of the bankroll. Tracking performance in units makes it easier to compare results over time without focusing on the size of individual cash stakes.",
          "The Under Over Club reports performance using a fixed one-unit approach for its published statistics, which keeps the historical record easier to interpret.",
        ],
      },
      {
        heading: "Expect losing sequences",
        paragraphs: [
          "Even a strategy with a genuine long-run edge can experience several losses in a row. Stake sizing should therefore be designed for variance rather than assuming the next selection will recover previous losses.",
          "Increasing stakes aggressively after losses can amplify risk and turn a normal losing run into a major drawdown.",
        ],
      },
      {
        heading: "Track every settled selection",
        paragraphs: [
          "A useful record includes the market, selection, odds, stake, result, return and running bankroll. ROI and units profit can then be evaluated over a meaningful sample rather than by memory.",
        ],
      },
    ],
    related: ["betting-roi", "value-betting", "fair-betting-odds"],
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
