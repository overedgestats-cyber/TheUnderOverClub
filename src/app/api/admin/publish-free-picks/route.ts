import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  publishFreePicks,
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
      reviewedToken?: unknown;
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
      await publishFreePicks({
        date,
        commit:
          body.commit ===
          true,
        reviewedToken:
          typeof body.reviewedToken ===
          "string"
            ? body.reviewedToken
            : null,
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
        : "Unknown Free Picks publication error";

    console.error(
      "Free Picks publication failed:",
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
