import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  enrichFreePickOdds,
} from "@/lib/free-picks/free-picks-storage";
import {
  getSofiaDate,
  isValidDateString,
} from "@/lib/time/sofia";

export const dynamic =
  "force-dynamic";

export const maxDuration = 300;

function authorized(
  request: NextRequest,
) {
  const secret =
    process.env
      .INTERNAL_API_SECRET;

  return (
    Boolean(secret) &&
    request.headers.get(
      "authorization",
    ) ===
      `Bearer ${secret}`
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    if (
      !authorized(request)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    let body: {
      date?: unknown;
      commit?: unknown;
    } = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    const date =
      typeof body.date ===
      "string"
        ? body.date
        : getSofiaDate();

    if (
      !isValidDateString(
        date,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Date must use YYYY-MM-DD format",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await enrichFreePickOdds({
        date,
        commit:
          body.commit ===
          true,
      });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Free Pick odds enrichment error";

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
