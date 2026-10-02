import "server-only";

import {
  getOddsForFixture,
  getRecentTeamFixtures,
} from "@/lib/api-football/client";
import {
  buildConsensusOdds,
} from "@/lib/analysis/odds";
import {
  scoreOverEdgeFreePick,
  type OverEdgeFreeCandidate,
} from "@/lib/free-picks/overedge-model";
import {
  isEligibleFreeFixture,
} from "@/lib/free-picks/scope";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

type FixtureRow = {
  id: string;
  provider_fixture_id: number;
  provider_league_id:
    number | null;
  competition_name: string;
  competition_country:
    string | null;
  kickoff_at: string;
  home_team_id: number;
  home_team_name: string;
  home_team_logo_url:
    string | null;
  away_team_id: number;
  away_team_name: string;
  away_team_logo_url:
    string | null;
  status: string;
};

type ScoredFixture = {
  fixture: FixtureRow;
  model: OverEdgeFreeCandidate;
};

function db() {
  return createAdminSupabaseClient() as any;
}

async function mapWithConcurrency<
  Input,
  Output,
>(
  values: Input[],
  concurrency: number,
  worker:
    (value: Input) =>
      Promise<Output>,
) {
  const results:
    Output[] = [];

  let index = 0;

  async function runWorker() {
    while (true) {
      const current =
        index;

      index += 1;

      if (
        current >=
        values.length
      ) {
        return;
      }

      results[current] =
        await worker(
          values[current],
        );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            concurrency,
            values.length,
          ),
      },
      () => runWorker(),
    ),
  );

  return results;
}

async function getFixturesForDate(
  date: string,
) {
  const client = db();

  const from = new Date(
    `${date}T00:00:00Z`,
  );
  from.setUTCDate(
    from.getUTCDate() - 1,
  );

  const to = new Date(
    `${date}T00:00:00Z`,
  );
  to.setUTCDate(
    to.getUTCDate() + 2,
  );

  const {
    data,
    error,
  } = await client
    .from("fixtures")
    .select(
      [
        "id",
        "provider_fixture_id",
        "provider_league_id",
        "competition_name",
        "competition_country",
        "kickoff_at",
        "home_team_id",
        "home_team_name",
        "home_team_logo_url",
        "away_team_id",
        "away_team_name",
        "away_team_logo_url",
        "status",
      ].join(","),
    )
    .gte(
      "kickoff_at",
      from.toISOString(),
    )
    .lt(
      "kickoff_at",
      to.toISOString(),
    )
    .order(
      "kickoff_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `Could not load fixtures for Free Picks: ${error.message}`,
    );
  }

  return (
    (data ?? []) as FixtureRow[]
  ).filter(
    (fixture) =>
      getSofiaDate(
        new Date(
          fixture.kickoff_at,
        ),
      ) === date,
  );
}

function isPreMatch(
  fixture: FixtureRow,
) {
  const status =
    String(
      fixture.status ?? "",
    ).toUpperCase();

  return ![
    "FT",
    "AET",
    "PEN",
    "1H",
    "HT",
    "2H",
    "ET",
    "P",
    "BT",
  ].includes(status);
}

async function scoreFixture(
  fixture: FixtureRow,
): Promise<ScoredFixture | null> {
  try {
    const [
      homeHistory,
      awayHistory,
    ] = await Promise.all([
      getRecentTeamFixtures(
        fixture.home_team_id,
        24,
      ),
      getRecentTeamFixtures(
        fixture.away_team_id,
        24,
      ),
    ]);

    const model =
      scoreOverEdgeFreePick({
        homeHistory,
        awayHistory,
        homeTeamId:
          fixture.home_team_id,
        awayTeamId:
          fixture.away_team_id,
        fixtureId:
          fixture.provider_fixture_id,
        kickoffAt:
          fixture.kickoff_at,
      });

    if (!model) {
      return null;
    }

    return {
      fixture,
      model,
    };
  } catch (
    error
  ) {
    console.error(
      `Free Pick scoring failed for fixture ${fixture.provider_fixture_id}:`,
      error,
    );

    return null;
  }
}

async function attachOdds(
  scored: ScoredFixture,
) {
  let odds:
    number | null = null;

  let oddsSource:
    "bet365"
    | "market_median_fallback"
    | null = null;

  try {
    const response =
      await getOddsForFixture(
        scored.fixture
          .provider_fixture_id,
      );

    const exactOdds =
      buildConsensusOdds(
        response,
      );

    const selectedOdd =
      exactOdds.find(
        (item) =>
          item.market ===
            "ou25" &&
          item.selection ===
            scored.model
              .selection,
      );

    odds =
      selectedOdd?.odds ??
      null;

    oddsSource =
      selectedOdd?.source ??
      null;
  } catch (
    error
  ) {
    console.error(
      `Free Pick odds lookup failed for fixture ${scored.fixture.provider_fixture_id}:`,
      error,
    );
  }

  return {
    fixtureId:
      scored.fixture
        .provider_fixture_id,
    databaseFixtureId:
      scored.fixture.id,
    competition:
      scored.fixture
        .competition_name,
    country:
      scored.fixture
        .competition_country,
    kickoffAt:
      scored.fixture
        .kickoff_at,
    homeTeam:
      scored.fixture
        .home_team_name,
    awayTeam:
      scored.fixture
        .away_team_name,
    homeLogo:
      scored.fixture
        .home_team_logo_url,
    awayLogo:
      scored.fixture
        .away_team_logo_url,
    market: "ou25" as const,
    selection:
      scored.model.selection,
    displaySelection:
      scored.model
        .displaySelection,
    modelProbability:
      scored.model
        .sideProbability,
    modelProbabilityPct:
      scored.model
        .modelProbabilityPct,
    confidence:
      scored.model.confidence,
    confidencePct:
      scored.model
        .confidencePct,
    priorityBand:
      scored.model
        .confidencePct >= 75
        ? "75_plus"
        : "fallback",
    odds,
    oddsSource,
    modelVersion:
      "overedge-free-v1",
    metrics:
      scored.model.metrics,
  };
}

export async function selectFreePicks(
  date = getSofiaDate(),
) {
  const fixtures =
    await getFixturesForDate(
      date,
    );

  const eligible =
    fixtures.filter(
      (fixture) =>
        isPreMatch(fixture) &&
        isEligibleFreeFixture({
          competitionName:
            fixture
              .competition_name,
          competitionCountry:
            fixture
              .competition_country,
          homeTeamName:
            fixture
              .home_team_name,
          awayTeamName:
            fixture
              .away_team_name,
        }),
    );

  const scored =
    (
      await mapWithConcurrency(
        eligible,
        5,
        scoreFixture,
      )
    ).filter(
      (
        value,
      ): value is ScoredFixture =>
        value !== null,
    );

  scored.sort(
    (first, second) =>
      second.model
        .confidencePct -
        first.model
          .confidencePct ||
      second.model
        .sideProbability -
        first.model
          .sideProbability ||
      first.fixture
        .provider_fixture_id -
        second.fixture
          .provider_fixture_id,
  );

  // Quality first: 75%+ naturally sorts to the top.
  // If fewer than two reach 75%, the next-highest candidates fill the slate.
  // Odds do not influence selection.
  const selected =
    scored.slice(0, 2);

  const picks =
    await Promise.all(
      selected.map(
        attachOdds,
      ),
    );

  return {
    date,
    timezone:
      "Europe/Sofia",
    modelVersion:
      "overedge-free-v1",
    rules: {
      market:
        "Over/Under 2.5 only",
      targetDailyPicks: 2,
      preferredConfidencePct:
        75,
      oddsAffectSelection:
        false,
      ranking:
        "calibrated confidence desc, model probability desc, fixture id asc",
    },
    fixtureCount:
      fixtures.length,
    eligibleFixtureCount:
      eligible.length,
    analyzedFixtureCount:
      scored.length,
    pickCount:
      picks.length,
    hasTwoPicks:
      picks.length === 2,
    picks,
  };
}
