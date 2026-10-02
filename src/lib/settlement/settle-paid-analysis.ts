import "server-only";

import { getFixturesByDate, getFixtureById, type ApiFootballFixture } from "@/lib/api-football/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSofiaDate } from "@/lib/time/sofia";
import { settleSelection, unitProfitForResult, type PickResult, type SupportedMarket } from "@/lib/settlement/settle-pick";

type PublicationRunRow = { id: string };
type FixtureRow = { id: string; provider_fixture_id: number; home_team_name: string; away_team_name: string };
type TrackingRow = { id: string; fixture_id: string; market: SupportedMarket; selection: string; odds: number | null; result_status: string };
type RecommendationRow = { id: string; fixture_id: string; market: SupportedMarket; selection: string; odds: number; result_status: string };
type SettlementFixturePayload = ApiFootballFixture & { score?: { fulltime?: { home?: number | null; away?: number | null } | null } };
type FinalScore = { home: number; away: number; status: string };

const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);
function db() { return createAdminSupabaseClient() as any; }

function finalScoreFromApi(fixture: SettlementFixturePayload): FinalScore | null {
  const status = fixture.fixture.status?.short ?? "";
  if (!FINAL_STATUSES.has(status)) return null;
  const h = fixture.score?.fulltime?.home;
  const a = fixture.score?.fulltime?.away;
  if (typeof h === "number" && typeof a === "number") return { home: h, away: a, status };
  if (status === "FT" && typeof fixture.goals.home === "number" && typeof fixture.goals.away === "number") {
    return { home: fixture.goals.home, away: fixture.goals.away, status };
  }
  return null;
}

async function getPaidRun(date: string): Promise<PublicationRunRow | null> {
  const { data, error } = await db().from("publication_runs").select("id").eq("board_kind", "paid").eq("publication_date", date).maybeSingle();
  if (error) throw new Error(`Could not load paid publication run: ${error.message}`);
  return data as PublicationRunRow | null;
}

async function getFixtures(ids: string[]): Promise<FixtureRow[]> {
  if (!ids.length) return [];
  const { data, error } = await db().from("fixtures").select("id,provider_fixture_id,home_team_name,away_team_name").in("id", ids);
  if (error) throw new Error(`Could not load fixture details: ${error.message}`);
  return (data ?? []) as FixtureRow[];
}

async function getPendingTrackingRows(runId: string): Promise<TrackingRow[]> {
  const { data, error } = await db().from("market_analysis_snapshots").select("id,fixture_id,market,selection,odds,result_status").eq("publication_run_id", runId).eq("result_status", "pending");
  if (error) throw new Error(`Could not load pending tracking rows: ${error.message}`);
  return (data ?? []) as TrackingRow[];
}

async function getPendingRecommendations(runId: string): Promise<RecommendationRow[]> {
  const { data, error } = await db().from("recommendations").select("id,fixture_id,market,selection,odds,result_status").eq("publication_run_id", runId).eq("access_tier", "paid").eq("result_status", "pending");
  if (error) throw new Error(`Could not load pending official recommendations: ${error.message}`);
  return (data ?? []) as RecommendationRow[];
}

function unique<T>(values: T[]): T[] { return Array.from(new Set(values)); }
function resultSummary(results: PickResult[]) { return { won: results.filter(x => x === "won").length, lost: results.filter(x => x === "lost").length, void: results.filter(x => x === "void").length }; }

export async function settlePaidAnalysis({ date = getSofiaDate(), commit = false }: { date?: string; commit?: boolean }) {
  const run = await getPaidRun(date);
  if (!run) return { mode: commit ? "committed" : "dry_run", date, publicationRunFound: false, message: "No paid publication run exists for this date.", fixturesChecked: 0, fixturesFinal: 0, trackingSettlements: 0, officialSettlements: 0 };

  const [trackingRows, officialRows] = await Promise.all([getPendingTrackingRows(run.id), getPendingRecommendations(run.id)]);
  const fixtureIds = unique([...trackingRows.map(r => r.fixture_id), ...officialRows.map(r => r.fixture_id)]);
  if (!fixtureIds.length) return { mode: commit ? "committed" : "dry_run", date, publicationRunFound: true, publicationRunId: run.id, message: "No pending paid tracking or recommendation rows.", fixturesChecked: 0, fixturesFinal: 0, trackingSettlements: 0, officialSettlements: 0 };

  const dbFixtures = await getFixtures(fixtureIds);
  const apiFixtures = await getFixturesByDate(date, "Europe/Sofia");
  const apiMap = new Map(apiFixtures.map(f => [f.fixture.id, f as SettlementFixturePayload]));
  const settlementPlan: any[] = [];
  const notFinal: any[] = [];

  for (const fixture of dbFixtures) {
    const apiFixture = apiMap.get(Number(fixture.provider_fixture_id)) ?? await getFixtureById(Number(fixture.provider_fixture_id)) as SettlementFixturePayload | null;
    if (!apiFixture) { notFinal.push({ fixtureId: fixture.id, providerFixtureId: fixture.provider_fixture_id, match: `${fixture.home_team_name} vs ${fixture.away_team_name}`, status: null }); continue; }
    const finalScore = finalScoreFromApi(apiFixture);
    if (!finalScore) { notFinal.push({ fixtureId: fixture.id, providerFixtureId: fixture.provider_fixture_id, match: `${fixture.home_team_name} vs ${fixture.away_team_name}`, status: apiFixture.fixture.status?.short ?? null }); continue; }

    const tracking = trackingRows.filter(r => r.fixture_id === fixture.id).map(r => ({ id: r.id, market: r.market, selection: r.selection, odds: r.odds, result: settleSelection({ market: r.market, selection: r.selection, homeScore: finalScore.home, awayScore: finalScore.away }) }));
    const official = officialRows.filter(r => r.fixture_id === fixture.id).map(r => {
      const result = settleSelection({ market: r.market, selection: r.selection, homeScore: finalScore.home, awayScore: finalScore.away });
      return { id: r.id, market: r.market, selection: r.selection, odds: r.odds, result, unitProfit: unitProfitForResult({ result, odds: r.odds }) };
    });
    settlementPlan.push({ fixtureId: fixture.id, providerFixtureId: fixture.provider_fixture_id, match: `${fixture.home_team_name} vs ${fixture.away_team_name}`, status: finalScore.status, homeScore: finalScore.home, awayScore: finalScore.away, tracking, official });
  }

  if (commit) {
    const client = db();
    const settledAt = new Date().toISOString();
    for (const fixture of settlementPlan) {
      for (const row of fixture.tracking) {
        const { error } = await client.from("market_analysis_snapshots").update({ result_status: row.result, final_home_score: fixture.homeScore, final_away_score: fixture.awayScore, settled_at: settledAt }).eq("id", row.id).eq("result_status", "pending");
        if (error) throw new Error(`Could not settle tracking row ${row.id}: ${error.message}`);
      }
      for (const row of fixture.official) {
        const patch = { result_status: row.result, final_home_score: fixture.homeScore, final_away_score: fixture.awayScore, settled_at: settledAt };
        let { error } = await client.from("recommendations").update({ ...patch, unit_profit: row.unitProfit }).eq("id", row.id).eq("result_status", "pending");
        // Older installations generate profit in PostgreSQL; never write a generated column.
        if (error?.code === "428C9") {
          ({ error } = await client.from("recommendations").update(patch).eq("id", row.id).eq("result_status", "pending"));
        }
        if (error) throw new Error(`Could not settle official recommendation ${row.id}: ${error.message}`);
      }
    }
  }

  const trackingResults = settlementPlan.flatMap(f => f.tracking.map((r: any) => r.result));
  const officialResults = settlementPlan.flatMap(f => f.official.map((r: any) => r.result));
  return { mode: commit ? "committed" : "dry_run", date, publicationRunFound: true, publicationRunId: run.id, fixturesChecked: dbFixtures.length, fixturesFinal: settlementPlan.length, fixturesNotFinal: notFinal.length, trackingSettlements: trackingResults.length, officialSettlements: officialResults.length, trackingResults: resultSummary(trackingResults), officialResults: resultSummary(officialResults), settlementPlan, notFinal };
}
