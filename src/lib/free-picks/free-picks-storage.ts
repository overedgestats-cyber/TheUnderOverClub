import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  getOddsForFixture,
} from "@/lib/api-football/client";
import {
  buildConsensusOdds,
} from "@/lib/analysis/odds";
import {
  selectFreePicks,
} from "@/lib/free-picks/select-free-picks";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

type ExistingFreePick = {
  id: string;
  publication_date: string;
  fixture_id: string;
  rank_position: number;
  market: "ou25";
  selection:
    | "over_2_5"
    | "under_2_5";
  model_probability: number;
  confidence: number;
  confidence_band:
    | "75_plus"
    | "fallback";
  model_version: string;
  bookmaker_id: number | null;
  bookmaker_name: string | null;
  odds: number | null;
  odds_source:
    | "bet365"
    | "market_median_fallback"
    | null;
  odds_fetched_at: string | null;
  published_at: string;
  result_status:
    | "pending"
    | "won"
    | "lost"
    | "void";
  final_home_score: number | null;
  final_away_score: number | null;
  settled_at: string | null;
  unit_profit: number | null;
};

type PublicationRow = {
  publication_date: string;
  fixture_id: string;
  rank_position: 1 | 2;
  market: "ou25";
  selection:
    | "over_2_5"
    | "under_2_5";
  model_probability: number;
  confidence: number;
  model_version: string;
  bookmaker_id: number | null;
  bookmaker_name: string | null;
  odds: number | null;
  odds_source:
    | "bet365"
    | "market_median_fallback"
    | null;
  odds_fetched_at: string | null;
  analysis_snapshot: {
    engine: string;
    modelVersion: string;
    fixtureId: number;
    displaySelection: string;
    modelProbabilityPct: number;
    confidencePct: number;
    priorityBand: string;
    competition: string;
    country: string | null;
    kickoffAt: string;
    homeTeam: string;
    awayTeam: string;
    metrics: unknown;
    selectionPolicy: {
      targetDailyPicks: number;
      preferredConfidencePct: number;
      oddsAffectSelection: boolean;
    };
  };
};

type ReviewPayload = {
  version: 1;
  date: string;
  createdAt: string;
  rows: PublicationRow[];
};

function db() {
  return createAdminSupabaseClient() as any;
}

function signingSecret() {
  const secret =
    process.env
      .FREE_PICKS_SIGNING_SECRET ||
    process.env
      .INTERNAL_API_SECRET;

  if (!secret) {
    throw new Error(
      "Missing FREE_PICKS_SIGNING_SECRET or INTERNAL_API_SECRET",
    );
  }

  return secret;
}

function base64UrlEncode(
  value: string,
) {
  return Buffer.from(
    value,
    "utf8",
  ).toString("base64url");
}

function base64UrlDecode(
  value: string,
) {
  return Buffer.from(
    value,
    "base64url",
  ).toString("utf8");
}

function signPayload(
  encodedPayload: string,
) {
  return createHmac(
    "sha256",
    signingSecret(),
  )
    .update(encodedPayload)
    .digest("base64url");
}

function makeReviewToken(
  payload: ReviewPayload,
) {
  const encoded =
    base64UrlEncode(
      JSON.stringify(payload),
    );

  const signature =
    signPayload(encoded);

  return `${encoded}.${signature}`;
}

function readReviewToken(
  token: string,
): ReviewPayload {
  const [
    encoded,
    providedSignature,
  ] = token.split(".");

  if (
    !encoded ||
    !providedSignature
  ) {
    throw new Error(
      "Invalid reviewed Free Picks token",
    );
  }

  const expectedSignature =
    signPayload(encoded);

  const provided =
    Buffer.from(
      providedSignature,
      "utf8",
    );

  const expected =
    Buffer.from(
      expectedSignature,
      "utf8",
    );

  if (
    provided.length !==
      expected.length ||
    !timingSafeEqual(
      provided,
      expected,
    )
  ) {
    throw new Error(
      "Reviewed Free Picks token signature is invalid",
    );
  }

  let payload:
    ReviewPayload;

  try {
    payload =
      JSON.parse(
        base64UrlDecode(
          encoded,
        ),
      ) as ReviewPayload;
  } catch {
    throw new Error(
      "Reviewed Free Picks token payload is invalid",
    );
  }

  if (
    payload.version !== 1 ||
    !payload.date ||
    !Array.isArray(
      payload.rows,
    ) ||
    payload.rows.length !== 2
  ) {
    throw new Error(
      "Reviewed Free Picks token has invalid shape",
    );
  }

  return payload;
}

async function existingForDate(
  date: string,
): Promise<ExistingFreePick[]> {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from("free_pick_publications")
    .select("*")
    .eq(
      "publication_date",
      date,
    )
    .order(
      "rank_position",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `Could not read existing Free Picks: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as ExistingFreePick[];
}

function toPublicPicks(
  rows: PublicationRow[],
) {
  return rows.map(
    (row) => ({
      rank:
        row.rank_position,
      fixtureId:
        row.analysis_snapshot
          .fixtureId,
      home:
        row.analysis_snapshot
          .homeTeam,
      away:
        row.analysis_snapshot
          .awayTeam,
      competition:
        row.analysis_snapshot
          .competition,
      kickoffAt:
        row.analysis_snapshot
          .kickoffAt,
      selection:
        row.analysis_snapshot
          .displaySelection,
      modelProbabilityPct:
        row.analysis_snapshot
          .modelProbabilityPct,
      confidencePct:
        row.analysis_snapshot
          .confidencePct,
      priorityBand:
        row.analysis_snapshot
          .priorityBand,
      odds:
        row.odds,
      oddsSource:
        row.odds_source,
    }),
  );
}

function validateReviewedRows(
  date: string,
  rows: PublicationRow[],
) {
  if (
    rows.length !== 2
  ) {
    throw new Error(
      "Reviewed Free Picks slate must contain exactly two picks",
    );
  }

  const ranks =
    rows.map(
      (row) =>
        row.rank_position,
    );

  if (
    !ranks.includes(1) ||
    !ranks.includes(2)
  ) {
    throw new Error(
      "Reviewed Free Picks slate must contain ranks 1 and 2",
    );
  }

  const seenFixtures =
    new Set<string>();

  for (
    const row of rows
  ) {
    if (
      row.publication_date !==
      date
    ) {
      throw new Error(
        "Reviewed Free Picks token date does not match commit date",
      );
    }

    if (
      row.market !==
      "ou25"
    ) {
      throw new Error(
        "Reviewed Free Picks contain an invalid market",
      );
    }

    if (
      ![
        "over_2_5",
        "under_2_5",
      ].includes(
        row.selection,
      )
    ) {
      throw new Error(
        "Reviewed Free Picks contain an invalid selection",
      );
    }

    if (
      seenFixtures.has(
        row.fixture_id,
      )
    ) {
      throw new Error(
        "Reviewed Free Picks contain the same fixture twice",
      );
    }

    seenFixtures.add(
      row.fixture_id,
    );

    if (
      !Number.isFinite(
        row.model_probability,
      ) ||
      row.model_probability <
        0 ||
      row.model_probability >
        1
    ) {
      throw new Error(
        "Reviewed Free Picks contain an invalid model probability",
      );
    }

    if (
      !Number.isFinite(
        row.confidence,
      ) ||
      row.confidence <
        0.53 ||
      row.confidence >
        0.9
    ) {
      throw new Error(
        "Reviewed Free Picks contain an invalid confidence",
      );
    }
  }
}

async function validateStillPreKickoff(
  rows: PublicationRow[],
) {
  const client = db();

  for (
    const row of rows
  ) {
    const {
      data:
        fixture,
      error,
    } = await client
      .from("fixtures")
      .select(
        "id,kickoff_at",
      )
      .eq(
        "id",
        row.fixture_id,
      )
      .single();

    if (
      error ||
      !fixture
    ) {
      throw new Error(
        `Could not revalidate fixture ${row.fixture_id} before publication`,
      );
    }

    if (
      new Date(
        fixture.kickoff_at,
      ).getTime() <=
      Date.now()
    ) {
      throw new Error(
        `Publication blocked because fixture ${row.analysis_snapshot.fixtureId} has already kicked off`,
      );
    }
  }
}

async function buildReviewedSlate(
  date: string,
) {
  const preview =
    await selectFreePicks(
      date,
    );

  if (
    preview.picks.length !==
    2
  ) {
    return {
      ok: false as const,
      preview,
      message:
        "Exactly two analyzable Free Picks were not available, so no daily slate can be reviewed.",
    };
  }

  const started =
    preview.picks.filter(
      (pick) =>
        new Date(
          pick.kickoffAt,
        ).getTime() <=
        Date.now(),
    );

  if (
    started.length > 0
  ) {
    return {
      ok: false as const,
      preview,
      message:
        "Review blocked because at least one selected fixture has already kicked off.",
    };
  }

  const rows:
    PublicationRow[] =
    preview.picks.map(
      (pick, index) => ({
        publication_date:
          date,
        fixture_id:
          pick.databaseFixtureId,
        rank_position:
          (index + 1) as 1 | 2,
        market:
          "ou25",
        selection:
          pick.selection,
        model_probability:
          pick.modelProbability,
        confidence:
          pick.confidence,
        model_version:
          pick.modelVersion,
        bookmaker_id:
          pick.oddsSource ===
          "bet365"
            ? 8
            : null,
        bookmaker_name:
          pick.oddsSource ===
          "bet365"
            ? "Bet365"
            : pick.oddsSource ===
              "market_median_fallback"
            ? "Market median"
            : null,
        odds:
          pick.odds,
        odds_source:
          pick.oddsSource,
        odds_fetched_at:
          pick.odds
            ? new Date()
                .toISOString()
            : null,
        analysis_snapshot: {
          engine:
            "OverEdge Free Picks",
          modelVersion:
            pick.modelVersion,
          fixtureId:
            pick.fixtureId,
          displaySelection:
            pick.displaySelection,
          modelProbabilityPct:
            pick.modelProbabilityPct,
          confidencePct:
            pick.confidencePct,
          priorityBand:
            pick.priorityBand,
          competition:
            pick.competition,
          country:
            pick.country,
          kickoffAt:
            pick.kickoffAt,
          homeTeam:
            pick.homeTeam,
          awayTeam:
            pick.awayTeam,
          metrics:
            pick.metrics,
          selectionPolicy: {
            targetDailyPicks:
              2,
            preferredConfidencePct:
              75,
            oddsAffectSelection:
              false,
          },
        },
      }),
    );

  const payload:
    ReviewPayload = {
      version: 1,
      date,
      createdAt:
        new Date()
          .toISOString(),
      rows,
    };

  return {
    ok: true as const,
    rows,
    reviewToken:
      makeReviewToken(
        payload,
      ),
  };
}

export async function publishFreePicks({
  date = getSofiaDate(),
  commit = false,
  reviewedToken = null,
}: {
  date?: string;
  commit?: boolean;
  reviewedToken?:
    string | null;
}) {
  const existing =
    await existingForDate(
      date,
    );

  if (
    existing.length > 0
  ) {
    return {
      created: false,
      immutable: true,
      committed: false,
      date,
      pickCount:
        existing.length,
      message:
        "Free Picks already published for this date. Existing slate was left unchanged.",
      picks: existing,
    };
  }

  if (!commit) {
    const reviewed =
      await buildReviewedSlate(
        date,
      );

    if (!reviewed.ok) {
      return {
        created: false,
        immutable: false,
        committed: false,
        date,
        pickCount:
          reviewed.preview
            .picks.length,
        message:
          reviewed.message,
        preview:
          reviewed.preview,
      };
    }

    return {
      created: false,
      immutable: false,
      committed: false,
      date,
      pickCount: 2,
      mode:
        "dry_run",
      reviewToken:
        reviewed.reviewToken,
      message:
        "Preview is valid. Nothing was stored. Commit uses this exact signed reviewed slate and does not rerun the model.",
      picks:
        toPublicPicks(
          reviewed.rows,
        ),
    };
  }

  if (
    !reviewedToken
  ) {
    return {
      created: false,
      immutable: false,
      committed: false,
      date,
      pickCount: 0,
      message:
        "Commit blocked: a reviewedToken from a fresh dry run is required.",
    };
  }

  const payload =
    readReviewToken(
      reviewedToken,
    );

  if (
    payload.date !==
    date
  ) {
    return {
      created: false,
      immutable: false,
      committed: false,
      date,
      pickCount: 0,
      message:
        "Commit blocked: the reviewed token belongs to a different publication date.",
    };
  }

  validateReviewedRows(
    date,
    payload.rows,
  );

  // Critical production behavior:
  // Do NOT recalculate the model here.
  // Commit exactly the signed slate the user reviewed.
  // Only revalidate that both fixtures are still pre-kickoff.
  await validateStillPreKickoff(
    payload.rows,
  );

  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "free_pick_publications",
    )
    .insert(
      payload.rows,
    )
    .select("*")
    .order(
      "rank_position",
      {
        ascending: true,
      },
    );

  if (error) {
    if (
      String(
        error.code ?? "",
      ) === "23505"
    ) {
      const concurrent =
        await existingForDate(
          date,
        );

      return {
        created: false,
        immutable: true,
        committed: false,
        date,
        pickCount:
          concurrent.length,
        message:
          "A Free Picks slate was published concurrently. Existing slate was preserved.",
        picks:
          concurrent,
      };
    }

    throw new Error(
      `Could not publish Free Picks: ${error.message}`,
    );
  }

  return {
    created: true,
    immutable: true,
    committed: true,
    date,
    pickCount: 2,
    reviewedAt:
      payload.createdAt,
    message:
      "The exact signed slate from the reviewed dry run was published and is now immutable.",
    picks: data ?? [],
  };
}

export async function enrichFreePickOdds({
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
      [
        "id",
        "fixture_id",
        "selection",
        "odds",
        "result_status",
      ].join(","),
    )
    .eq(
      "publication_date",
      date,
    )
    .eq(
      "result_status",
      "pending",
    )
    .is(
      "odds",
      null,
    );

  if (error) {
    throw new Error(
      `Could not load unpriced Free Picks: ${error.message}`,
    );
  }

  const pending =
    data ?? [];

  const changes:
    Array<Record<string, unknown>> =
      [];

  for (
    const row of pending
  ) {
    const {
      data:
        fixture,
      error:
        fixtureError,
    } = await client
      .from("fixtures")
      .select(
        "provider_fixture_id,kickoff_at",
      )
      .eq(
        "id",
        row.fixture_id,
      )
      .single();

    if (
      fixtureError ||
      !fixture
    ) {
      continue;
    }

    if (
      new Date(
        fixture.kickoff_at,
      ).getTime() <=
      Date.now()
    ) {
      continue;
    }

    try {
      const response =
        await getOddsForFixture(
          Number(
            fixture
              .provider_fixture_id,
          ),
        );

      const exact =
        buildConsensusOdds(
          response,
        );

      const selected =
        exact.find(
          (item) =>
            item.market ===
              "ou25" &&
            item.selection ===
              row.selection,
        );

      if (!selected) {
        continue;
      }

      const patch = {
        bookmaker_id:
          selected.source ===
          "bet365"
            ? 8
            : null,
        bookmaker_name:
          selected.source ===
          "bet365"
            ? "Bet365"
            : "Market median",
        odds:
          selected.odds,
        odds_source:
          selected.source,
        odds_fetched_at:
          new Date()
            .toISOString(),
      };

      changes.push({
        id: row.id,
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
            row.id,
          )
          .is(
            "odds",
            null,
          )
          .eq(
            "result_status",
            "pending",
          );

        if (
          updateError
        ) {
          throw new Error(
            `Could not enrich Free Pick ${row.id}: ${updateError.message}`,
          );
        }
      }
    } catch (
      oddsError
    ) {
      console.error(
        `Free Pick odds enrichment failed for ${row.id}:`,
        oddsError,
      );
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
    unpricedPickCount:
      pending.length,
    oddsFoundCount:
      changes.length,
    changes,
  };
}
