import {
  NextRequest,
  NextResponse,
} from "next/server";

import { analyzePaidFixture } from "@/lib/analysis/analyze-paid-fixture";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(
  request: NextRequest,
): boolean {
  const expectedSecret =
    process.env.INTERNAL_API_SECRET;

  if (!expectedSecret) {
    throw new Error(
      "Missing INTERNAL_API_SECRET",
    );
  }

  return (
    request.headers.get("authorization") ===
    `Bearer ${expectedSecret}`
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    let body: {
      providerFixtureId?: unknown;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const providerFixtureId =
      typeof body.providerFixtureId ===
        "number" &&
      Number.isInteger(
        body.providerFixtureId,
      )
        ? body.providerFixtureId
        : undefined;

    const analysis =
      await analyzePaidFixture(
        providerFixtureId,
      );

    return NextResponse.json({
      ok: true,
      stored: false,
      previewOnly: true,
      analysis,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown analysis preview error";

    console.error(
      "Paid analysis preview failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
