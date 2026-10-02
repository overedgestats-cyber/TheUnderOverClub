import "server-only";

import { createPublicSupabaseClient } from "@/lib/supabase/public";

type Fixture = {
  id: string;
  provider_fixture_id: number;
  provider_league_id: number | null;
  competition_name: string;
  competition_country: string | null;
  competition_round: string | null;
  kickoff_at: string;
  home_team_name: string;
  home_team_logo_url: string | null;
  away_team_name: string;
  away_team_logo_url: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
};

type BoardFixture = {
  league_display_order: number;
  fixture_display_order: number;
  has_value_pick: boolean;
  fixtures: Fixture | Fixture[] | null;
};

function unwrapFixture(
  value: BoardFixture["fixtures"],
): Fixture | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export async function getPaidBoard(
  date: string,
) {
  const supabase =
    createPublicSupabaseClient();

  const { data: run, error: runError } =
    await supabase
      .from("publication_runs")
      .select(
        [
          "id",
          "publication_date",
          "published_at",
          "published_late",
          "fixture_count",
          "recommendation_count",
        ].join(","),
      )
      .eq("board_kind", "paid")
      .eq("publication_date", date)
      .eq("status", "published")
      .maybeSingle();

  if (runError) {
    throw new Error(
      `Could not read paid board run: ${runError.message}`,
    );
  }

  if (!run) {
    return null;
  }

  const runRow = run as unknown as {
    id: string;
    publication_date: string;
    published_at: string | null;
    published_late: boolean | null;
    fixture_count: number;
    recommendation_count: number;
  };

  const {
    data: rows,
    error: rowsError,
  } = await supabase
    .from("daily_board_fixtures")
    .select(
      `
        league_display_order,
        fixture_display_order,
        has_value_pick,
        fixtures (
          id,
          provider_fixture_id,
          provider_league_id,
          competition_name,
          competition_country,
          competition_round,
          kickoff_at,
          home_team_name,
          home_team_logo_url,
          away_team_name,
          away_team_logo_url,
          status,
          home_score,
          away_score
        )
      `,
    )
    .eq("publication_run_id", runRow.id)
    .order(
      "league_display_order",
      {
        ascending: true,
      },
    )
    .order(
      "fixture_display_order",
      {
        ascending: true,
      },
    );

  if (rowsError) {
    throw new Error(
      `Could not read paid board fixtures: ${rowsError.message}`,
    );
  }

  const leagues = new Map<
    string,
    {
      competitionName: string;
      competitionCountry: string | null;
      fixtures: Array<
        Fixture & {
          hasValuePick: boolean;
        }
      >;
    }
  >();

  for (const row of (rows ?? []) as unknown as BoardFixture[]) {
    const fixture =
      unwrapFixture(row.fixtures);

    if (!fixture) {
      continue;
    }

    const key = [
      fixture.provider_league_id ??
        fixture.competition_name,
      fixture.competition_name,
    ].join(":");

    if (!leagues.has(key)) {
      leagues.set(key, {
        competitionName:
          fixture.competition_name,
        competitionCountry:
          fixture.competition_country,
        fixtures: [],
      });
    }

    leagues.get(key)?.fixtures.push({
      ...fixture,
      hasValuePick:
        row.has_value_pick,
    });
  }

  return {
    ...runRow,
    leagues: Array.from(
      leagues.values(),
    ),
  };
}


