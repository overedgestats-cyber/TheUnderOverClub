import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getSofiaDate,
  getSofiaPublicationDeadline,
} from "@/lib/time/sofia";

type FixtureRow = {
  id: string;
  provider_fixture_id: number;
  provider_league_id: number | null;
  competition_name: string;
  competition_country: string | null;
  kickoff_at: string;
  home_team_name: string;
  away_team_name: string;
};

type ExistingRun = {
  id: string;
  status: "preparing" | "published" | "failed";
  fixture_count: number;
  recommendation_count: number;
  published_at: string | null;
  published_late: boolean | null;
};

function compareFixtures(
  first: FixtureRow,
  second: FixtureRow,
): number {
  const competitionComparison =
    first.competition_name.localeCompare(
      second.competition_name,
      "en",
      {
        sensitivity: "base",
      },
    );

  if (competitionComparison !== 0) {
    return competitionComparison;
  }

  const kickoffComparison =
    new Date(first.kickoff_at).getTime() -
    new Date(second.kickoff_at).getTime();

  if (kickoffComparison !== 0) {
    return kickoffComparison;
  }

  return (
    first.provider_fixture_id -
    second.provider_fixture_id
  );
}

function buildBoardRows(
  publicationRunId: string,
  fixtures: FixtureRow[],
) {
  let currentCompetition = "";
  let leagueDisplayOrder = -1;
  let fixtureDisplayOrder = 0;

  return fixtures.map((fixture) => {
    if (
      fixture.competition_name !==
      currentCompetition
    ) {
      currentCompetition =
        fixture.competition_name;
      leagueDisplayOrder += 1;
      fixtureDisplayOrder = 0;
    }

    const row = {
      publication_run_id: publicationRunId,
      fixture_id: fixture.id,
      league_display_order:
        leagueDisplayOrder,
      fixture_display_order:
        fixtureDisplayOrder,
      has_value_pick: false,
    };

    fixtureDisplayOrder += 1;

    return row;
  });
}

async function getPaidFixturesForDate(
  date: string,
): Promise<FixtureRow[]> {
  const supabase = createAdminSupabaseClient();

  const from = new Date(
    `${date}T00:00:00Z`,
  );
  from.setUTCDate(from.getUTCDate() - 1);

  const to = new Date(
    `${date}T00:00:00Z`,
  );
  to.setUTCDate(to.getUTCDate() + 2);

  const { data, error } = await supabase
    .from("fixtures")
    .select(
      [
        "id",
        "provider_fixture_id",
        "provider_league_id",
        "competition_name",
        "competition_country",
        "kickoff_at",
        "home_team_name",
        "away_team_name",
      ].join(","),
    )
    .eq("is_paid_scope", true)
    .gte("kickoff_at", from.toISOString())
    .lt("kickoff_at", to.toISOString());

  if (error) {
    throw new Error(
      `Could not read paid fixtures: ${error.message}`,
    );
  }

  return ((data ?? []) as FixtureRow[])
    .filter(
      (fixture) =>
        getSofiaDate(
          new Date(fixture.kickoff_at),
        ) === date,
    )
    .sort(compareFixtures);
}

export async function publishPaidBoard(
  date: string,
) {
  const supabase = createAdminSupabaseClient();

  const {
    data: existingRunData,
    error: existingRunError,
  } = await supabase
    .from("publication_runs")
    .select(
      [
        "id",
        "status",
        "fixture_count",
        "recommendation_count",
        "published_at",
        "published_late",
      ].join(","),
    )
    .eq("board_kind", "paid")
    .eq("publication_date", date)
    .maybeSingle();

  if (existingRunError) {
    throw new Error(
      `Could not read the paid publication run: ${existingRunError.message}`,
    );
  }

  const existingRun =
    existingRunData as ExistingRun | null;

  if (
    existingRun?.status === "published"
  ) {
    return {
      created: false,
      immutable: true,
      publicationRunId: existingRun.id,
      date,
      fixtureCount:
        existingRun.fixture_count,
      recommendationCount:
        existingRun.recommendation_count,
      publishedAt:
        existingRun.published_at,
      publishedLate:
        existingRun.published_late ?? false,
    };
  }

  const fixtures =
    await getPaidFixturesForDate(date);

  const deadlineAt =
    getSofiaPublicationDeadline(date);

  let publicationRunId =
    existingRun?.id ?? null;

  if (!publicationRunId) {
    const { data, error } = await supabase
      .from("publication_runs")
      .insert({
        board_kind: "paid",
        publication_date: date,
        timezone: "Europe/Sofia",
        deadline_at: deadlineAt,
        status: "preparing",
        config_snapshot: {
          approvedCompetitionScope: true,
          maximumRecommendationsPerFixture: 3,
          publicationTime: "07:30",
          timezone: "Europe/Sofia",
          stage: "fixture_board_only",
        },
        fixture_count: 0,
        recommendation_count: 0,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(
        `Could not create the paid publication run: ${error.message}`,
      );
    }

    publicationRunId = data.id;
  } else {
    const { error } = await supabase
      .from("daily_board_fixtures")
      .delete()
      .eq(
        "publication_run_id",
        publicationRunId,
      );

    if (error) {
      throw new Error(
        `Could not reset the unpublished paid board: ${error.message}`,
      );
    }
  }

  const boardRows = buildBoardRows(
    publicationRunId,
    fixtures,
  );

  if (boardRows.length > 0) {
    const { error } = await supabase
      .from("daily_board_fixtures")
      .insert(boardRows);

    if (error) {
      throw new Error(
        `Could not store paid board fixtures: ${error.message}`,
      );
    }
  }

  const publishedAt =
    new Date().toISOString();

  const { data: publishedRun, error } =
    await supabase
      .from("publication_runs")
      .update({
        status: "published",
        published_at: publishedAt,
        fixture_count: fixtures.length,
        recommendation_count: 0,
        error_message: null,
      })
      .eq("id", publicationRunId)
      .select(
        [
          "id",
          "fixture_count",
          "recommendation_count",
          "published_at",
          "published_late",
        ].join(","),
      )
      .single();

  if (error) {
    throw new Error(
      `Could not publish the paid board: ${error.message}`,
    );
  }

  return {
    created: true,
    immutable: true,
    publicationRunId:
      publishedRun.id,
    date,
    fixtureCount:
      publishedRun.fixture_count,
    recommendationCount:
      publishedRun.recommendation_count,
    publishedAt:
      publishedRun.published_at,
    publishedLate:
      publishedRun.published_late ?? false,
  };
}
