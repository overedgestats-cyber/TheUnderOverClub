import "server-only";
import { automationDates } from "@/lib/automation/dates";
import { settleFreePicks } from "@/lib/free-picks/free-picks-settlement";
import { settlePaidAnalysis } from "@/lib/settlement/settle-paid-analysis";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function historicalDates(before: string): Promise<string[]> {
  const client = createAdminSupabaseClient();
  const dates = new Set<string>();
  // Read all publication dates in pages; bounded processing below keeps each run small.
  for (const table of ["publication_runs", "free_pick_publications"] as const) {
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from(table).select("publication_date")
        .lt("publication_date", before).order("publication_date").order("id")
        .range(offset, offset + 499);
      if (error) throw new Error(`Could not load settlement dates: ${error.message}`);
      for (const row of data ?? []) dates.add(row.publication_date);
      if (!data || data.length < 500) break;
    }
  }
  return [...dates].sort();
}

export async function runSettlementReconciliation() {
  const { today, yesterday, twoDaysAgo } = automationDates();
  const dates = [twoDaysAgo, yesterday, today];
  const historical = await historicalDates(twoDaysAgo);
  // Rotate through older dates, including postponed fixtures, without letting an
  // unresolved old match permanently block the rest. Manual backfill handles bulk recovery.
  const day = Math.floor(Date.parse(`${today}T12:00:00Z`) / 86400000);
  for (let i = 0; i < Math.min(2, historical.length); i++) {
    dates.push(historical[(day * 2 + i) % historical.length]);
  }
  const results = [];
  const failures: Array<{ date: string; tier: string; error: string }> = [];
  for (const date of dates) {
    const result: Record<string, unknown> = { date };
    for (const [tier, settle] of [["paid", settlePaidAnalysis], ["free", settleFreePicks]] as const) {
      try { result[tier] = await settle({ date, commit: true }); }
      catch (error) {
        const message = error instanceof Error ? error.message : "Settlement failed";
        console.error(`[settlement] ${tier} ${date}:`, message);
        failures.push({ date, tier, error: message });
      }
    }
    results.push(result);
  }
  return { job: "settlement-reconciliation", timezone: "Europe/Sofia", ranAt: new Date().toISOString(), dates, results, failures };
}
