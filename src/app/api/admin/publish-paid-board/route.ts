import {
  NextRequest,
  NextResponse,
} from "next/server";

import { publishPaidBoard } from "@/lib/paid-board/create-paid-board";
import {
  getSofiaDate,
  isValidDateString,
} from "@/lib/time/sofia";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
      date?: unknown;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const date =
      typeof body.date === "string"
        ? body.date
        : getSofiaDate();

    if (!isValidDateString(date)) {
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
      await publishPaidBoard(date);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown paid board publication error";

    console.error(
      "Paid board publication failed:",
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
