import type { ApiFootballOddsResponse } from "@/lib/api-football/client";
import {
  median,
  round,
} from "@/lib/analysis/math";
import type {
  ConsensusOdd,
  MarketKey,
  MarketSelection,
} from "@/lib/analysis/types";

const BET365_BOOKMAKER_ID = 8;

const MARKET_IDS = {
  oneXTwo: 1,
  overUnder: 5,
  btts: 8,
  doubleChance: 12,
} as const;

type Quote = {
  bookmakerId: number | null;
  bookmakerName: string;
  market: MarketKey;
  selection: MarketSelection;
  odds: number;
};

function normalizeText(
  value: unknown,
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function keyFor(
  market: MarketKey,
  selection: MarketSelection,
): string {
  return `${market}:${selection}`;
}

function normalizeSelection(
  betId: number,
  rawValue: unknown,
): {
  market: MarketKey;
  selection: MarketSelection;
} | null {
  const value =
    normalizeText(rawValue);

  if (betId === MARKET_IDS.oneXTwo) {
    if (
      value === "home" ||
      value === "1"
    ) {
      return {
        market: "one_x_two",
        selection: "home",
      };
    }

    if (
      value === "draw" ||
      value === "x"
    ) {
      return {
        market: "one_x_two",
        selection: "draw",
      };
    }

    if (
      value === "away" ||
      value === "2"
    ) {
      return {
        market: "one_x_two",
        selection: "away",
      };
    }

    return null;
  }

  if (betId === MARKET_IDS.overUnder) {
    if (
      value === "over 2.5" ||
      value === "over 2,5"
    ) {
      return {
        market: "ou25",
        selection: "over_2_5",
      };
    }

    if (
      value === "under 2.5" ||
      value === "under 2,5"
    ) {
      return {
        market: "ou25",
        selection: "under_2_5",
      };
    }

    return null;
  }

  if (betId === MARKET_IDS.btts) {
    if (value === "yes") {
      return {
        market: "btts",
        selection: "yes",
      };
    }

    if (value === "no") {
      return {
        market: "btts",
        selection: "no",
      };
    }

    return null;
  }

  if (
    betId === MARKET_IDS.doubleChance
  ) {
    if (
      [
        "home/draw",
        "home or draw",
        "1x",
        "1 x",
      ].includes(value)
    ) {
      return {
        market: "double_chance",
        selection: "1x",
      };
    }

    if (
      [
        "home/away",
        "home or away",
        "12",
        "1 2",
      ].includes(value)
    ) {
      return {
        market: "double_chance",
        selection: "12",
      };
    }

    if (
      [
        "draw/away",
        "draw or away",
        "x2",
        "x 2",
      ].includes(value)
    ) {
      return {
        market: "double_chance",
        selection: "x2",
      };
    }

    return null;
  }

  return null;
}

function collectQuotes(
  responses: ApiFootballOddsResponse[],
): Quote[] {
  const quotes: Quote[] = [];

  for (const response of responses) {
    for (
      const bookmaker of
      response.bookmakers ?? []
    ) {
      const bookmakerId =
        bookmaker.id ?? null;

      const bookmakerName =
        String(
          bookmaker.name ?? "",
        ).trim();

      for (
        const bet of
        bookmaker.bets ?? []
      ) {
        const betId = Number(
          bet.id,
        );

        if (
          ![
            MARKET_IDS.oneXTwo,
            MARKET_IDS.overUnder,
            MARKET_IDS.btts,
            MARKET_IDS.doubleChance,
          ].includes(
            betId as
              | 1
              | 5
              | 8
              | 12,
          )
        ) {
          continue;
        }

        for (
          const value of
          bet.values ?? []
        ) {
          const normalized =
            normalizeSelection(
              betId,
              value.value,
            );

          const odds = Number(
            value.odd,
          );

          if (
            !normalized ||
            !Number.isFinite(odds) ||
            odds <= 1.01 ||
            odds > 100
          ) {
            continue;
          }

          quotes.push({
            bookmakerId,
            bookmakerName,
            market:
              normalized.market,
            selection:
              normalized.selection,
            odds,
          });
        }
      }
    }
  }

  return quotes;
}

function isBet365(
  quote: Quote,
): boolean {
  return (
    quote.bookmakerId ===
      BET365_BOOKMAKER_ID ||
    normalizeText(
      quote.bookmakerName,
    ) === "bet365"
  );
}

function selectDisplayedQuotes(
  quotes: Quote[],
): Map<
  string,
  {
    market: MarketKey;
    selection: MarketSelection;
    odds: number;
    bookmakerCount: number;
    source:
      | "bet365"
      | "market_median_fallback";
  }
> {
  const result = new Map<
    string,
    {
      market: MarketKey;
      selection: MarketSelection;
      odds: number;
      bookmakerCount: number;
      source:
        | "bet365"
        | "market_median_fallback";
    }
  >();

  const grouped = new Map<
    string,
    Quote[]
  >();

  for (const quote of quotes) {
    const key = keyFor(
      quote.market,
      quote.selection,
    );

    const bucket =
      grouped.get(key) ?? [];

    bucket.push(quote);
    grouped.set(key, bucket);
  }

  for (
    const [key, bucket] of
    grouped
  ) {
    const bet365 =
      bucket.find(isBet365);

    if (bet365) {
      result.set(key, {
        market: bet365.market,
        selection:
          bet365.selection,
        odds: round(bet365.odds),
        bookmakerCount: 1,
        source: "bet365",
      });

      continue;
    }

    const fallbackOdds =
      median(
        bucket.map(
          (quote) => quote.odds,
        ),
      );

    if (fallbackOdds === null) {
      continue;
    }

    result.set(key, {
      market: bucket[0].market,
      selection:
        bucket[0].selection,
      odds: round(fallbackOdds),
      bookmakerCount:
        bucket.length,
      source:
        "market_median_fallback",
    });
  }

  return result;
}

function devigSelections(
  displayed: ReturnType<
    typeof selectDisplayedQuotes
  >,
  selections: Array<{
    market: MarketKey;
    selection: MarketSelection;
  }>,
  source:
    | "devigged_binary_market"
    | "devigged_1x2_market",
) {
  const rows = selections.map(
    ({ market, selection }) =>
      displayed.get(
        keyFor(
          market,
          selection,
        ),
      ),
  );

  if (
    rows.some(
      (row) => !row,
    )
  ) {
    return new Map<
      string,
      {
        fairProbability: number;
        fairProbabilitySource:
          | "devigged_binary_market"
          | "devigged_1x2_market";
      }
    >();
  }

  const valid = rows as Array<
    NonNullable<
      (typeof rows)[number]
    >
  >;

  const raw = valid.map(
    (row) => 1 / row.odds,
  );

  const total = raw.reduce(
    (sum, value) =>
      sum + value,
    0,
  );

  if (total <= 0) {
    return new Map();
  }

  return new Map(
    valid.map((row, index) => [
      keyFor(
        row.market,
        row.selection,
      ),
      {
        fairProbability: round(
          raw[index] / total,
        ),
        fairProbabilitySource:
          source,
      },
    ]),
  );
}

export function buildConsensusOdds(
  responses: ApiFootballOddsResponse[],
): ConsensusOdd[] {
  const quotes =
    collectQuotes(responses);

  const displayed =
    selectDisplayedQuotes(quotes);

  const fair = new Map<
    string,
    {
      fairProbability: number;
      fairProbabilitySource:
        | "devigged_binary_market"
        | "devigged_1x2_market"
        | "devigged_1x2_derived";
    }
  >();

  const binaryMarkets = [
    [
      {
        market: "ou25" as const,
        selection:
          "over_2_5" as const,
      },
      {
        market: "ou25" as const,
        selection:
          "under_2_5" as const,
      },
    ],
    [
      {
        market: "btts" as const,
        selection: "yes" as const,
      },
      {
        market: "btts" as const,
        selection: "no" as const,
      },
    ],
  ];

  for (
    const market of binaryMarkets
  ) {
    const values =
      devigSelections(
        displayed,
        market,
        "devigged_binary_market",
      );

    for (
      const [key, value] of
      values
    ) {
      fair.set(key, value);
    }
  }

  const oneXTwoValues =
    devigSelections(
      displayed,
      [
        {
          market:
            "one_x_two",
          selection: "home",
        },
        {
          market:
            "one_x_two",
          selection: "draw",
        },
        {
          market:
            "one_x_two",
          selection: "away",
        },
      ],
      "devigged_1x2_market",
    );

  for (
    const [key, value] of
    oneXTwoValues
  ) {
    fair.set(key, value);
  }

  const home =
    oneXTwoValues.get(
      keyFor(
        "one_x_two",
        "home",
      ),
    )?.fairProbability;

  const draw =
    oneXTwoValues.get(
      keyFor(
        "one_x_two",
        "draw",
      ),
    )?.fairProbability;

  const away =
    oneXTwoValues.get(
      keyFor(
        "one_x_two",
        "away",
      ),
    )?.fairProbability;

  if (
    home !== undefined &&
    draw !== undefined &&
    away !== undefined
  ) {
    const derived = [
      {
        selection: "1x" as const,
        probability: home + draw,
      },
      {
        selection: "12" as const,
        probability: home + away,
      },
      {
        selection: "x2" as const,
        probability: draw + away,
      },
    ];

    for (const value of derived) {
      const key = keyFor(
        "double_chance",
        value.selection,
      );

      if (
        displayed.has(key)
      ) {
        fair.set(key, {
          fairProbability: round(
            value.probability,
          ),
          fairProbabilitySource:
            "devigged_1x2_derived",
        });
      }
    }
  }

  return Array.from(
    displayed.entries(),
  ).map(([key, value]) => {
    const fairValue =
      fair.get(key);

    return {
      ...value,
      fairProbability:
        fairValue?.fairProbability ??
        null,
      fairProbabilitySource:
        fairValue?.fairProbabilitySource ??
        null,
    };
  });
}
