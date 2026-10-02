import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSofiaDate } from "@/lib/time/sofia";

type FreePickSnapshot = {
  fixtureId?: number;
  displaySelection?: string;
  competition?: string;
  country?: string | null;
  kickoffAt?: string;
  homeTeam?: string;
  awayTeam?: string;
  modelProbabilityPct?: number;
  confidencePct?: number;
  priorityBand?: string;
  metrics?: Record<string, unknown>;
  selectionPolicy?: {
    targetDailyPicks?: number;
    preferredConfidencePct?: number;
    oddsAffectSelection?: boolean;
  };
};

type FreePickDbRow = {
  id: string;
  publication_date: string;
  rank_position: number;
  selection: "over_2_5" | "under_2_5";
  model_probability: number;
  confidence: number;
  confidence_band: "75_plus" | "fallback";
  bookmaker_name: string | null;
  odds: number | null;
  odds_source: "bet365" | "market_median_fallback" | null;
  published_at: string;
  result_status: "pending" | "won" | "lost" | "void";
  final_home_score: number | null;
  final_away_score: number | null;
  settled_at: string | null;
  analysis_snapshot: FreePickSnapshot | null;
};

type FixtureLogoRow = {
  provider_fixture_id: number;
  home_team_logo_url: string | null;
  away_team_logo_url: string | null;
};

export type PublicFreePick = {
  id: string;
  date: string;
  rank: number;
  fixtureId: number | null;
  competition: string;
  country: string | null;
  kickoffAt: string | null;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  selection: string;
  modelProbabilityPct: number;
  confidencePct: number;
  confidenceBand: "75_plus" | "fallback";
  odds: number | null;
  bookmakerName: string | null;
  oddsSource: "bet365" | "market_median_fallback" | null;
  resultStatus: "pending" | "won" | "lost" | "void";
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  settledAt: string | null;
  publishedAt: string;
  analysisReasons: string[];
};

export type PublicFreePicksData = {
  requestedDate: string | null;
  today: string;
  displayDate: string;
  dateMode: "today" | "future" | "past" | "none";
  picks: PublicFreePick[];
};

function db() {
  return createAdminSupabaseClient() as any;
}

function fallbackSelection(selection: "over_2_5" | "under_2_5") {
  return selection === "over_2_5" ? "Over 2.5" : "Under 2.5";
}

function pct(value: number) {
  return Math.round(value * 10) / 10;
}

function buildReasons({
  rank,
  selection,
  modelProbabilityPct,
  confidencePct,
  confidenceBand,
  odds,
  bookmakerName,
  snapshot,
}: {
  rank: number;
  selection: string;
  modelProbabilityPct: number;
  confidencePct: number;
  confidenceBand: "75_plus" | "fallback";
  odds: number | null;
  bookmakerName: string | null;
  snapshot: FreePickSnapshot;
}) {
  const reasons: string[] = [
    `The model estimates ${modelProbabilityPct.toFixed(1)}% for ${selection}.`,
  ];

  if (confidenceBand === "75_plus") {
    reasons.push(
      `Model confidence is ${confidencePct.toFixed(1)}%, above the preferred 75% Free Pick threshold.`,
    );
  } else {
    reasons.push(
      `Model confidence is ${confidencePct.toFixed(1)}%. This is a daily fallback selected from the highest-ranked available O/U 2.5 candidates.`,
    );
  }

  reasons.push(
    `This selection ranked #${rank} in the daily two-pick O/U 2.5 slate.`,
  );

  if (snapshot.selectionPolicy?.oddsAffectSelection === false) {
    reasons.push(
      "Odds did not influence selection; the Free Pick ranking is model-led.",
    );
  } else if (odds !== null) {
    reasons.push(
      `Published price: ${odds.toFixed(2)}${bookmakerName ? ` at ${bookmakerName}` : ""}.`,
    );
  }

  return reasons.slice(0, 4);
}

function mapPick(
  row: FreePickDbRow,
  fixture: FixtureLogoRow | undefined,
): PublicFreePick {
  const snapshot = row.analysis_snapshot ?? {};
  const modelProbabilityPct =
    snapshot.modelProbabilityPct ??
    pct(Number(row.model_probability) * 100);
  const confidencePct =
    snapshot.confidencePct ??
    pct(Number(row.confidence) * 100);
  const selection =
    snapshot.displaySelection ??
    fallbackSelection(row.selection);

  return {
    id: row.id,
    date: row.publication_date,
    rank: row.rank_position,
    fixtureId: snapshot.fixtureId ?? null,
    competition: snapshot.competition ?? "Competition",
    country: snapshot.country ?? null,
    kickoffAt: snapshot.kickoffAt ?? null,
    home: snapshot.homeTeam ?? "Home",
    away: snapshot.awayTeam ?? "Away",
    homeLogo: fixture?.home_team_logo_url ?? null,
    awayLogo: fixture?.away_team_logo_url ?? null,
    selection,
    modelProbabilityPct,
    confidencePct,
    confidenceBand: row.confidence_band,
    odds: row.odds === null ? null : Number(row.odds),
    bookmakerName: row.bookmaker_name,
    oddsSource: row.odds_source,
    resultStatus: row.result_status,
    finalHomeScore: row.final_home_score,
    finalAwayScore: row.final_away_score,
    settledAt: row.settled_at,
    publishedAt: row.published_at,
    analysisReasons: buildReasons({
      rank: row.rank_position,
      selection,
      modelProbabilityPct,
      confidencePct,
      confidenceBand: row.confidence_band,
      odds: row.odds === null ? null : Number(row.odds),
      bookmakerName: row.bookmaker_name,
      snapshot,
    }),
  };
}

async function loadDate(date: string): Promise<PublicFreePick[]> {
  const client = db();

  const { data, error } = await client
    .from("free_pick_publications")
    .select(
      [
        "id",
        "publication_date",
        "rank_position",
        "selection",
        "model_probability",
        "confidence",
        "confidence_band",
        "bookmaker_name",
        "odds",
        "odds_source",
        "published_at",
        "result_status",
        "final_home_score",
        "final_away_score",
        "settled_at",
        "analysis_snapshot",
      ].join(","),
    )
    .eq("publication_date", date)
    .order("rank_position", { ascending: true });

  if (error) {
    throw new Error(
      `Could not load public Free Picks for ${date}: ${error.message}`,
    );
  }

  const rows = (data ?? []) as FreePickDbRow[];

  const providerIds = Array.from(
    new Set(
      rows
        .map((row) => row.analysis_snapshot?.fixtureId)
        .filter((id): id is number => Number.isFinite(id)),
    ),
  );

  const fixtureMap = new Map<number, FixtureLogoRow>();

  if (providerIds.length > 0) {
    const {
      data: fixtureData,
      error: fixtureError,
    } = await client
      .from("fixtures")
      .select(
        "provider_fixture_id,home_team_logo_url,away_team_logo_url",
      )
      .in("provider_fixture_id", providerIds);

    if (fixtureError) {
      throw new Error(
        `Could not load Free Pick team badges: ${fixtureError.message}`,
      );
    }

    for (const fixture of (fixtureData ?? []) as FixtureLogoRow[]) {
      fixtureMap.set(
        Number(fixture.provider_fixture_id),
        fixture,
      );
    }
  }

  return rows.map((row) =>
    mapPick(
      row,
      row.analysis_snapshot?.fixtureId
        ? fixtureMap.get(row.analysis_snapshot.fixtureId)
        : undefined,
    ),
  );
}

async function findNextPublicationDate(
  fromDate: string,
): Promise<string | null> {
  const client = db();

  const { data, error } = await client
    .from("free_pick_publications")
    .select("publication_date")
    .gte("publication_date", fromDate)
    .order("publication_date", { ascending: true })
    .limit(1);

  if (error) {
    throw new Error(
      `Could not find next Free Picks publication date: ${error.message}`,
    );
  }

  return (data?.[0]?.publication_date ?? null) as string | null;
}

export async function getPublicFreePicks(
  requestedDate?: string,
): Promise<PublicFreePicksData> {
  const today = getSofiaDate();

  if (requestedDate) {
    const picks = await loadDate(requestedDate);

    return {
      requestedDate,
      today,
      displayDate: requestedDate,
      dateMode:
        requestedDate === today
          ? "today"
          : requestedDate > today
            ? "future"
            : "past",
      picks,
    };
  }

  const todaysPicks = await loadDate(today);

  if (todaysPicks.length > 0) {
    return {
      requestedDate: null,
      today,
      displayDate: today,
      dateMode: "today",
      picks: todaysPicks,
    };
  }

  const nextDate = await findNextPublicationDate(today);

  if (!nextDate) {
    return {
      requestedDate: null,
      today,
      displayDate: today,
      dateMode: "none",
      picks: [],
    };
  }

  return {
    requestedDate: null,
    today,
    displayDate: nextDate,
    dateMode: nextDate === today ? "today" : "future",
    picks: await loadDate(nextDate),
  };
}
