import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  selectFreePicks,
} from "@/lib/free-picks/select-free-picks";
import {
  getSofiaDate,
  isValidDateString,
} from "@/lib/time/sofia";

export const dynamic =
  "force-dynamic";

export const maxDuration = 300;

function isAuthorized(
  request: NextRequest,
) {
  const expected =
    process.env
      .INTERNAL_API_SECRET;

  if (!expected) {
    throw new Error(
      "Missing INTERNAL_API_SECRET",
    );
  }

  return (
    request.headers.get(
      "authorization",
    ) ===
    `Bearer ${expected}`
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    if (
      !isAuthorized(request)
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
      await selectFreePicks(
        date,
      );

    return NextResponse.json({
      ok: true,
      stored: false,
      previewOnly: true,
      ...result,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Free Picks preview error";

    console.error(
      "Free Picks preview failed:",
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
