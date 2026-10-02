import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  analyzePaidFixture,
} from "@/lib/analysis/analyze-paid-fixture";

export const dynamic =
  "force-dynamic";

export const maxDuration =
  300;

function authorized(
  request:
    NextRequest,
) {
  const secret =
    process.env
      .INTERNAL_API_SECRET;

  if (!secret) {
    throw new Error(
      "Missing INTERNAL_API_SECRET",
    );
  }

  return (
    request.headers.get(
      "authorization",
    ) ===
    `Bearer ${secret}`
  );
}

export async function POST(
  request:
    NextRequest,
) {
  try {
    if (
      !authorized(
        request,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,
          error:
            "Unauthorized",
        },
        {
          status:
            401,
        },
      );
    }

    const body =
      await request
        .json()
        .catch(
          () => ({}),
        ) as {
          fixtureId?:
            unknown;
        };

    const fixtureId =
      Number(
        body.fixtureId,
      );

    if (
      !Number.isInteger(
        fixtureId,
      ) ||
      fixtureId <=
        0
    ) {
      return NextResponse.json(
        {
          ok:
            false,
          error:
            "fixtureId must be a positive API-Football fixture id",
        },
        {
          status:
            400,
        },
      );
    }

    const analysis =
      await analyzePaidFixture(
        fixtureId,
      );

    return NextResponse.json({
      ok:
        true,
      fixture: {
        id:
          analysis.fixture
            .provider_fixture_id,
        home:
          analysis.fixture
            .home_team_name,
        away:
          analysis.fixture
            .away_team_name,
        competition:
          analysis.fixture
            .competition_name,
        kickoffAt:
          analysis.fixture
            .kickoff_at,
      },
      productionV2: {
        modelVersion:
          analysis.model
            .version,
        oneXTwo:
          analysis
            .probabilities
            .oneXTwo,
        recommendations:
          analysis
            .recommendations
            .filter(
              (item) =>
                item.market ===
                "one_x_two",
            ),
      },
      shadowV3:
        analysis.shadowV3,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown v3 shadow preview error";

    console.error(
      "V3 shadow preview failed:",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error:
          message,
      },
      {
        status:
          500,
      },
    );
  }
}
