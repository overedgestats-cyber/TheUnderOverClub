import "server-only";

import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

const API_BASE =
  "https://v3.football.api-sports.io";

type FreePickRow = {
  id: string;
  fixture_id: string;
  selection:
    | "over_2_5"
    | "under_2_5";
  result_status: string;
};

type FixtureDbRow = {
  id: string;
  provider_fixture_id: number;
};

type ApiFixture = {
  fixture?: {
    status?: {
      short?: string;
    };
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
  score?: {
    fulltime?: {
      home?: number | null;
      away?: number | null;
    };
  };
};

function db() {
  return createAdminSupabaseClient() as any;
}

async function getApiFixture(
  fixtureId: number,
): Promise<ApiFixture | null> {
  const key =
    process.env
      .API_FOOTBALL_KEY;

  if (!key) {
    throw new Error(
      "Missing API_FOOTBALL_KEY",
    );
  }

  const response =
    await fetch(
      `${API_BASE}/fixtures?id=${fixtureId}`,
      {
        headers: {
          "x-apisports-key":
            key,
        },
        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `API-Football fixture ${fixtureId} returned ${response.status}`,
    );
  }

  const payload =
    await response.json();

  return (
    payload?.response?.[0] ??
    null
  );
}

function finalNinetyMinuteScore(
  fixture: ApiFixture,
) {
  const status =
    String(
      fixture.fixture
        ?.status?.short ??
        "",
    ).toUpperCase();

  if (
    ![
      "FT",
      "AET",
      "PEN",
    ].includes(status)
  ) {
    return null;
  }

  const fulltimeHome =
    fixture.score
      ?.fulltime?.home;

  const fulltimeAway =
    fixture.score
      ?.fulltime?.away;

  if (
    Number.isFinite(
      fulltimeHome,
    ) &&
    Number.isFinite(
      fulltimeAway,
    )
  ) {
    return {
      home:
        Number(
          fulltimeHome,
        ),
      away:
        Number(
          fulltimeAway,
        ),
    };
  }

  const goalsHome =
    fixture.goals?.home;

  const goalsAway =
    fixture.goals?.away;

  if (
    Number.isFinite(
      goalsHome,
    ) &&
    Number.isFinite(
      goalsAway,
    )
  ) {
    return {
      home:
        Number(
          goalsHome,
        ),
      away:
        Number(
          goalsAway,
        ),
    };
  }

  return null;
}

function settleOU25({
  selection,
  home,
  away,
}: {
  selection:
    | "over_2_5"
    | "under_2_5";
  home: number;
  away: number;
}) {
  const total =
    home + away;

  if (
    selection ===
    "over_2_5"
  ) {
    return total >= 3
      ? "won"
      : "lost";
  }

  return total <= 2
    ? "won"
    : "lost";
}

export async function settleFreePicks({
  date = getSofiaDate(),
  commit = false,
}: {
  date?: string;
  commit?: boolean;
}) {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "free_pick_publications",
    )
    .select(
      "id,fixture_id,selection,result_status",
    )
    .eq(
      "publication_date",
      date,
    )
    .eq(
      "result_status",
      "pending",
    );

  if (error) {
    throw new Error(
      `Could not load pending Free Picks: ${error.message}`,
    );
  }

  const picks =
    (data ?? []) as FreePickRow[];

  const settlements:
    Array<Record<string, unknown>> =
      [];

  for (
    const pick of picks
  ) {
    const {
      data:
        fixtureRow,
      error:
        fixtureError,
    } = await client
      .from("fixtures")
      .select(
        "id,provider_fixture_id",
      )
      .eq(
        "id",
        pick.fixture_id,
      )
      .single();

    if (
      fixtureError ||
      !fixtureRow
    ) {
      continue;
    }

    const fixture =
      fixtureRow as FixtureDbRow;

    const apiFixture =
      await getApiFixture(
        Number(
          fixture
            .provider_fixture_id,
        ),
      );

    if (!apiFixture) {
      continue;
    }

    const score =
      finalNinetyMinuteScore(
        apiFixture,
      );

    if (!score) {
      continue;
    }

    const status =
      settleOU25({
        selection:
          pick.selection,
        home:
          score.home,
        away:
          score.away,
      });

    const patch = {
      result_status:
        status,
      final_home_score:
        score.home,
      final_away_score:
        score.away,
      settled_at:
        new Date()
          .toISOString(),
    };

    settlements.push({
      id: pick.id,
      fixtureId:
        fixture
          .provider_fixture_id,
      selection:
        pick.selection,
      ...patch,
    });

    if (commit) {
      const {
        error:
          updateError,
      } = await client
        .from(
          "free_pick_publications",
        )
        .update(patch)
        .eq(
          "id",
          pick.id,
        )
        .eq(
          "result_status",
          "pending",
        );

      if (
        updateError
      ) {
        throw new Error(
          `Could not settle Free Pick ${pick.id}: ${updateError.message}`,
        );
      }
    }
  }

  return {
    date,
    committed:
      commit,
    mode:
      commit
        ? "commit"
        : "dry_run",
    pendingPickCount:
      picks.length,
    settlementCount:
      settlements.length,
    settlements,
  };
}
