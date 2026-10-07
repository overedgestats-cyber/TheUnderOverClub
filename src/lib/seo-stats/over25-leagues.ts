import "server-only";

import { unstable_cache } from "next/cache";

type ApiFixture = {
  fixture?: {
    id?: number;
    date?: string;
    status?: {
      short?: string;
    };
  };
  league?: {
    id?: number;
    name?: string;
    country?: string;
    season?: number;
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
};

type ApiEnvelope = {
  errors?: unknown[] | Record<string, unknown> | string;
  response?: ApiFixture[];
};

type LeagueTarget = {
  key: string;
  id: number;
  displayName: string;
  country: string;
};

export type Over25LeagueStat = {
  key: string;
  rank: number;
  league: string;
  country: string;
  matches: number;
  over25Matches: number;
  under25Matches: number;
  over25Pct: number;
  under25Pct: number;
  avgGoals: number;
  bttsPct: number;
  avgHomeGoals: number;
  avgAwayGoals: number;
};

export type Over25LeagueStatsPayload = {
  seasonStartYear: number;
  seasonLabel: string;
  updatedAt: string;
  matchesAnalysed: number;
  leaguesAnalysed: number;
  rankings: Over25LeagueStat[];
};

const API_BASE = "https://v3.football.api-sports.io";
const CACHE_SECONDS = 60 * 60 * 12;
const REQUEST_GAP_MS = 325;

/*
  Exactly 10 established European domestic top-flight leagues.
  API-Football league IDs are stable provider identifiers.
*/
const LEAGUES: LeagueTarget[] = [
  {
    key: "england-premier-league",
    id: 39,
    displayName: "Premier League",
    country: "England",
  },
  {
    key: "germany-bundesliga",
    id: 78,
    displayName: "Bundesliga",
    country: "Germany",
  },
  {
    key: "netherlands-eredivisie",
    id: 88,
    displayName: "Eredivisie",
    country: "Netherlands",
  },
  {
    key: "spain-la-liga",
    id: 140,
    displayName: "La Liga",
    country: "Spain",
  },
  {
    key: "italy-serie-a",
    id: 135,
    displayName: "Serie A",
    country: "Italy",
  },
  {
    key: "france-ligue-1",
    id: 61,
    displayName: "Ligue 1",
    country: "France",
  },
  {
    key: "portugal-primeira-liga",
    id: 94,
    displayName: "Primeira Liga",
    country: "Portugal",
  },
  {
    key: "belgium-pro-league",
    id: 144,
    displayName: "Belgian Pro League",
    country: "Belgium",
  },
  {
    key: "switzerland-super-league",
    id: 207,
    displayName: "Swiss Super League",
    country: "Switzerland",
  },
  {
    key: "turkey-super-lig",
    id: 203,
    displayName: "Süper Lig",
    country: "Turkey",
  },
];

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function apiErrors(errors: ApiEnvelope["errors"]) {
  if (!errors) return "";

  if (typeof errors === "string") {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.length ? JSON.stringify(errors) : "";
  }

  return Object.keys(errors).length ? JSON.stringify(errors) : "";
}

async function fetchLeagueSeason(
  league: LeagueTarget,
  season: number,
): Promise<ApiFixture[]> {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing API_FOOTBALL_KEY");
  }

  const url = new URL(`${API_BASE}/fixtures`);
  url.searchParams.set("league", String(league.id));
  url.searchParams.set("season", String(season));
  url.searchParams.set("status", "FT");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiEnvelope;
  const errorText = apiErrors(payload.errors);

  if (!response.ok || errorText) {
    throw new Error(
      `API-Football ${league.displayName}: ${
        errorText || `HTTP ${response.status}`
      }`,
    );
  }

  return payload.response ?? [];
}

export function getCurrentEuropeanSeasonStartYear(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  return month >= 7 ? year : year - 1;
}

function seasonLabel(startYear: number) {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}

function calculateLeague(
  target: LeagueTarget,
  fixtures: ApiFixture[],
): Omit<Over25LeagueStat, "rank"> | null {
  let matches = 0;
  let over25Matches = 0;
  let bttsMatches = 0;
  let totalGoals = 0;
  let totalHomeGoals = 0;
  let totalAwayGoals = 0;

  for (const fixture of fixtures) {
    const home = fixture.goals?.home;
    const away = fixture.goals?.away;

    if (
      typeof home !== "number" ||
      typeof away !== "number" ||
      !Number.isFinite(home) ||
      !Number.isFinite(away)
    ) {
      continue;
    }

    matches += 1;
    totalHomeGoals += home;
    totalAwayGoals += away;
    totalGoals += home + away;

    if (home + away >= 3) {
      over25Matches += 1;
    }

    if (home > 0 && away > 0) {
      bttsMatches += 1;
    }
  }

  if (matches === 0) {
    return null;
  }

  const under25Matches = matches - over25Matches;

  return {
    key: target.key,
    league: target.displayName,
    country: target.country,
    matches,
    over25Matches,
    under25Matches,
    over25Pct: (over25Matches / matches) * 100,
    under25Pct: (under25Matches / matches) * 100,
    avgGoals: totalGoals / matches,
    bttsPct: (bttsMatches / matches) * 100,
    avgHomeGoals: totalHomeGoals / matches,
    avgAwayGoals: totalAwayGoals / matches,
  };
}

async function calculateRankings(
  seasonStartYear: number,
): Promise<Over25LeagueStatsPayload> {
  const rows: Omit<Over25LeagueStat, "rank">[] = [];

  /*
    Requests are deliberately sequential with a small gap. Ten calls every
    12 hours is cheap and avoids hammering API-Football's rate limit.
  */
  for (let index = 0; index < LEAGUES.length; index += 1) {
    const league = LEAGUES[index];

    try {
      const fixtures = await fetchLeagueSeason(
        league,
        seasonStartYear,
      );

      const row = calculateLeague(league, fixtures);

      if (row) {
        rows.push(row);
      }
    } catch (error) {
      console.error(
        `[League stats] Could not load ${league.displayName}:`,
        error,
      );
    }

    if (index < LEAGUES.length - 1) {
      await sleep(REQUEST_GAP_MS);
    }
  }

  if (rows.length === 0) {
    throw new Error(
      "No completed league fixtures were returned by API-Football.",
    );
  }

  rows.sort(
    (a, b) =>
      b.over25Pct - a.over25Pct ||
      b.avgGoals - a.avgGoals ||
      b.matches - a.matches,
  );

  const rankings: Over25LeagueStat[] = rows
    .slice(0, 10)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

  return {
    seasonStartYear,
    seasonLabel: seasonLabel(seasonStartYear),
    updatedAt: new Date().toISOString(),
    matchesAnalysed: rankings.reduce(
      (sum, league) => sum + league.matches,
      0,
    ),
    leaguesAnalysed: rankings.length,
    rankings,
  };
}

export const getOver25LeagueRankings = unstable_cache(
  calculateRankings,
  ["seo-over25-league-rankings-complete-season-v2"],
  {
    revalidate: CACHE_SECONDS,
    tags: ["seo-over25-league-rankings"],
  },
);
