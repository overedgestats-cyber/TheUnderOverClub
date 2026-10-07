import "server-only";

import { unstable_cache } from "next/cache";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type FixtureRow = {
  competition_name: string;
  competition_country: string | null;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  last_synced_at: string | null;
};

type LeagueTarget = {
  key: string;
  displayName: string;
  country: string;
  aliases: string[];
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
  updatedAt: string | null;
  matchesAnalysed: number;
  leaguesAnalysed: number;
  rankings: Over25LeagueStat[];
};

const PAGE_SIZE = 1000;
const CACHE_SECONDS = 60 * 60 * 12;
const MIN_MATCHES = 5;

const LEAGUES: LeagueTarget[] = [
  {
    key: "england-premier-league",
    displayName: "Premier League",
    country: "England",
    aliases: ["Premier League"],
  },
  {
    key: "england-championship",
    displayName: "Championship",
    country: "England",
    aliases: ["Championship"],
  },
  {
    key: "spain-la-liga",
    displayName: "La Liga",
    country: "Spain",
    aliases: ["La Liga"],
  },
  {
    key: "spain-segunda",
    displayName: "Segunda División",
    country: "Spain",
    aliases: ["Segunda División", "Segunda Division"],
  },
  {
    key: "italy-serie-a",
    displayName: "Serie A",
    country: "Italy",
    aliases: ["Serie A"],
  },
  {
    key: "italy-serie-b",
    displayName: "Serie B",
    country: "Italy",
    aliases: ["Serie B"],
  },
  {
    key: "germany-bundesliga",
    displayName: "Bundesliga",
    country: "Germany",
    aliases: ["Bundesliga"],
  },
  {
    key: "germany-2-bundesliga",
    displayName: "2. Bundesliga",
    country: "Germany",
    aliases: ["2. Bundesliga"],
  },
  {
    key: "france-ligue-1",
    displayName: "Ligue 1",
    country: "France",
    aliases: ["Ligue 1"],
  },
  {
    key: "france-ligue-2",
    displayName: "Ligue 2",
    country: "France",
    aliases: ["Ligue 2"],
  },
  {
    key: "netherlands-eredivisie",
    displayName: "Eredivisie",
    country: "Netherlands",
    aliases: ["Eredivisie"],
  },
  {
    key: "portugal-primeira-liga",
    displayName: "Primeira Liga",
    country: "Portugal",
    aliases: ["Primeira Liga"],
  },
  {
    key: "belgium-pro-league",
    displayName: "Belgian Pro League",
    country: "Belgium",
    aliases: ["Jupiler Pro League", "Pro League"],
  },
  {
    key: "austria-bundesliga",
    displayName: "Austrian Bundesliga",
    country: "Austria",
    aliases: ["Bundesliga"],
  },
  {
    key: "switzerland-super-league",
    displayName: "Swiss Super League",
    country: "Switzerland",
    aliases: ["Super League"],
  },
  {
    key: "scotland-premiership",
    displayName: "Scottish Premiership",
    country: "Scotland",
    aliases: ["Premiership"],
  },
  {
    key: "denmark-superliga",
    displayName: "Danish Superliga",
    country: "Denmark",
    aliases: ["Superliga"],
  },
  {
    key: "norway-eliteserien",
    displayName: "Eliteserien",
    country: "Norway",
    aliases: ["Eliteserien"],
  },
  {
    key: "sweden-allsvenskan",
    displayName: "Allsvenskan",
    country: "Sweden",
    aliases: ["Allsvenskan"],
  },
  {
    key: "turkey-super-lig",
    displayName: "Süper Lig",
    country: "Turkey",
    aliases: ["Süper Lig", "Super Lig"],
  },
  {
    key: "poland-ekstraklasa",
    displayName: "Ekstraklasa",
    country: "Poland",
    aliases: ["Ekstraklasa"],
  },
  {
    key: "czechia-czech-liga",
    displayName: "Czech Liga",
    country: "Czech-Republic",
    aliases: ["Czech Liga"],
  },
  {
    key: "greece-super-league-1",
    displayName: "Super League 1",
    country: "Greece",
    aliases: ["Super League 1"],
  },
  {
    key: "romania-liga-i",
    displayName: "Liga I",
    country: "Romania",
    aliases: ["Liga I"],
  },
  {
    key: "croatia-hnl",
    displayName: "HNL",
    country: "Croatia",
    aliases: ["HNL", "1. HNL"],
  },
];

const ALL_NAMES = Array.from(
  new Set(LEAGUES.flatMap((league) => league.aliases)),
);

function normalized(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sameCountry(actual: string | null, expected: string) {
  const left = normalized(actual);
  const right = normalized(expected);

  if (left === right) {
    return true;
  }

  return (
    (right === "czech-republic" &&
      (left === "czech republic" || left === "czechia")) ||
    (right === "turkey" && left === "turkiye")
  );
}

function resolveLeague(row: FixtureRow) {
  const name = normalized(row.competition_name);

  return LEAGUES.find(
    (league) =>
      sameCountry(row.competition_country, league.country) &&
      league.aliases.some((alias) => normalized(alias) === name),
  );
}

function seasonLabel(startYear: number) {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}

export function getCurrentEuropeanSeasonStartYear(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  return month >= 7 ? year : year - 1;
}

async function readSeasonFixtures(
  seasonStartYear: number,
): Promise<FixtureRow[]> {
  const supabase = createAdminSupabaseClient();

  const from = new Date(
    Date.UTC(seasonStartYear, 6, 1, 0, 0, 0),
  ).toISOString();

  const to = new Date().toISOString();

  const rows: FixtureRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("fixtures")
      .select(
        [
          "competition_name",
          "competition_country",
          "kickoff_at",
          "home_score",
          "away_score",
          "last_synced_at",
        ].join(","),
      )
      .gte("kickoff_at", from)
      .lt("kickoff_at", to)
      .in("competition_name", ALL_NAMES)
      .not("home_score", "is", null)
      .not("away_score", "is", null)
      .order("kickoff_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(
        `Could not load league statistics fixtures: ${error.message}`,
      );
    }

    const batch = (data ?? []) as unknown as FixtureRow[];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return rows;
}

async function calculateRankings(
  seasonStartYear: number,
): Promise<Over25LeagueStatsPayload> {
  const fixtures = await readSeasonFixtures(seasonStartYear);

  const aggregate = new Map<
    string,
    {
      target: LeagueTarget;
      matches: number;
      over25: number;
      totalGoals: number;
      btts: number;
      homeGoals: number;
      awayGoals: number;
      updatedAt: string | null;
    }
  >();

  for (const fixture of fixtures) {
    const target = resolveLeague(fixture);

    if (!target) {
      continue;
    }

    const home = Number(fixture.home_score);
    const away = Number(fixture.away_score);

    if (!Number.isFinite(home) || !Number.isFinite(away)) {
      continue;
    }

    const current =
      aggregate.get(target.key) ?? {
        target,
        matches: 0,
        over25: 0,
        totalGoals: 0,
        btts: 0,
        homeGoals: 0,
        awayGoals: 0,
        updatedAt: null,
      };

    const total = home + away;

    current.matches += 1;
    current.totalGoals += total;
    current.homeGoals += home;
    current.awayGoals += away;

    if (total >= 3) {
      current.over25 += 1;
    }

    if (home > 0 && away > 0) {
      current.btts += 1;
    }

    if (
      fixture.last_synced_at &&
      (!current.updatedAt ||
        fixture.last_synced_at > current.updatedAt)
    ) {
      current.updatedAt = fixture.last_synced_at;
    }

    aggregate.set(target.key, current);
  }

  const rows = Array.from(aggregate.values())
    .filter((item) => item.matches >= MIN_MATCHES)
    .map((item) => {
      const over25Pct = (item.over25 / item.matches) * 100;
      const under25Matches = item.matches - item.over25;

      return {
        key: item.target.key,
        rank: 0,
        league: item.target.displayName,
        country:
          item.target.country === "Czech-Republic"
            ? "Czech Republic"
            : item.target.country,
        matches: item.matches,
        over25Matches: item.over25,
        under25Matches,
        over25Pct,
        under25Pct: (under25Matches / item.matches) * 100,
        avgGoals: item.totalGoals / item.matches,
        bttsPct: (item.btts / item.matches) * 100,
        avgHomeGoals: item.homeGoals / item.matches,
        avgAwayGoals: item.awayGoals / item.matches,
        updatedAt: item.updatedAt,
      };
    })
    .sort(
      (a, b) =>
        b.over25Pct - a.over25Pct ||
        b.avgGoals - a.avgGoals ||
        b.matches - a.matches,
    );

  const rankings: Over25LeagueStat[] = rows.map(
    ({ updatedAt: _updatedAt, ...row }, index) => ({
      ...row,
      rank: index + 1,
    }),
  );

  const updatedAt =
    rows
      .map((row) => row.updatedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

  return {
    seasonStartYear,
    seasonLabel: seasonLabel(seasonStartYear),
    updatedAt,
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
  ["seo-over25-league-rankings-v1"],
  {
    revalidate: CACHE_SECONDS,
    tags: ["seo-over25-league-rankings"],
  },
);
