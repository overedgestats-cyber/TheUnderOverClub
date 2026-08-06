import "server-only";

const API_FOOTBALL_BASE_URL =
  "https://v3.football.api-sports.io";

type ApiErrors =
  | unknown[]
  | Record<string, unknown>
  | string
  | null;

type ApiEnvelope<T> = {
  errors?: ApiErrors;
  results?: number;
  response?: T;
};

export type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    timestamp?: number;
    timezone?: string;
    status?: {
      long?: string;
      short?: string;
      elapsed?: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country?: string | null;
    season?: number;
    round?: string | null;
    logo?: string | null;
    flag?: string | null;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo?: string | null;
      winner?: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo?: string | null;
      winner?: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score?: unknown;
};

type ApiFootballStatus = {
  subscription?: {
    plan?: string;
    end?: string;
    active?: boolean;
  };
  requests?: {
    current?: number;
    limit_day?: number;
  };
};

function formatApiErrors(
  errors: ApiErrors | undefined,
): string | null {
  if (!errors) {
    return null;
  }

  if (typeof errors === "string") {
    return errors || null;
  }

  if (Array.isArray(errors)) {
    return errors.length
      ? JSON.stringify(errors)
      : null;
  }

  if (typeof errors === "object") {
    return Object.keys(errors).length
      ? JSON.stringify(errors)
      : null;
  }

  return String(errors);
}

async function apiFootballRequest<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const apiKey =
    process.env.API_FOOTBALL_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Missing API_FOOTBALL_KEY in .env.local",
    );
  }

  const url = new URL(
    `${API_FOOTBALL_BASE_URL}${path}`,
  );

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  const data =
    (await response.json()) as ApiEnvelope<T>;

  const apiError = formatApiErrors(data.errors);

  if (!response.ok) {
    throw new Error(
      `API-Football HTTP ${response.status}: ${
        apiError ?? "Unknown error"
      }`,
    );
  }

  if (apiError) {
    throw new Error(
      `API-Football error: ${apiError}`,
    );
  }

  if (data.response === undefined) {
    throw new Error(
      "API-Football returned no response data",
    );
  }

  return data.response;
}

export function getApiFootballStatus() {
  return apiFootballRequest<ApiFootballStatus>(
    "/status",
  );
}

export function getFixturesByDate(
  date: string,
  timezone = "Europe/Sofia",
) {
  return apiFootballRequest<ApiFootballFixture[]>(
    "/fixtures",
    {
      date,
      timezone,
    },
  );
}

