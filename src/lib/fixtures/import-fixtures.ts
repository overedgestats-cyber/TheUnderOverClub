import "server-only";

import {
  getFixturesByDate,
  type ApiFootballFixture,
} from "@/lib/api-football/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const PROVIDER = "api-football";
const BATCH_SIZE = 200;

type FixtureInsert = {
  provider: string;
  provider_fixture_id: number;
  provider_league_id: number;
  competition_name: string;
  competition_country: string | null;
  competition_round: string | null;
  kickoff_at: string;
  home_team_id: number;
  home_team_name: string;
  home_team_logo_url: string | null;
  away_team_id: number;
  away_team_name: string;
  away_team_logo_url: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  is_paid_scope: boolean;
  provider_payload: ApiFootballFixture;
  last_synced_at: string;
  updated_at: string;
};

function splitIntoBatches<T>(
  rows: T[],
  size: number,
): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < rows.length; index += size) {
    batches.push(rows.slice(index, index + size));
  }

  return batches;
}

export async function importFixturesForDate(
  date: string,
) {
  const supabase = createAdminSupabaseClient();

  const [
    fixtures,
    approvedCompetitionResult,
  ] = await Promise.all([
    getFixturesByDate(date, "Europe/Sofia"),
    supabase
      .from("approved_competitions")
      .select("provider_league_id")
      .eq("enabled", true)
      .not("provider_league_id", "is", null),
  ]);

  if (approvedCompetitionResult.error) {
    throw new Error(
      `Could not read approved competitions: ${
        approvedCompetitionResult.error.message
      }`,
    );
  }

  const approvedLeagueIds = new Set(
    (approvedCompetitionResult.data ?? [])
      .map((row) => Number(row.provider_league_id))
      .filter(Number.isFinite),
  );

  const syncedAt = new Date().toISOString();

  const rows: FixtureInsert[] = fixtures.map(
    (item) => ({
      provider: PROVIDER,
      provider_fixture_id: item.fixture.id,
      provider_league_id: item.league.id,
      competition_name: item.league.name,
      competition_country:
        item.league.country ?? null,
      competition_round:
        item.league.round ?? null,
      kickoff_at: item.fixture.date,

      home_team_id: item.teams.home.id,
      home_team_name: item.teams.home.name,
      home_team_logo_url:
        item.teams.home.logo ?? null,

      away_team_id: item.teams.away.id,
      away_team_name: item.teams.away.name,
      away_team_logo_url:
        item.teams.away.logo ?? null,

      status:
        item.fixture.status?.short ??
        item.fixture.status?.long ??
        "scheduled",

      home_score: item.goals.home,
      away_score: item.goals.away,

      is_paid_scope: approvedLeagueIds.has(
        item.league.id,
      ),

      provider_payload: item,
      last_synced_at: syncedAt,
      updated_at: syncedAt,
    }),
  );

  let importedCount = 0;

  for (const batch of splitIntoBatches(
    rows,
    BATCH_SIZE,
  )) {
    const { error } = await supabase
      .from("fixtures")
      .upsert(batch, {
        onConflict:
          "provider,provider_fixture_id",
        ignoreDuplicates: false,
      });

    if (error) {
      throw new Error(
        `Fixture database upsert failed: ${
          error.message
        }`,
      );
    }

    importedCount += batch.length;
  }

  return {
    date,
    timezone: "Europe/Sofia",
    received: fixtures.length,
    imported: importedCount,
    paidScopeFixtures: rows.filter(
      (row) => row.is_paid_scope,
    ).length,
  };
}
