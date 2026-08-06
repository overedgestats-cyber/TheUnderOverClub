import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getPaidBoard } from "@/lib/paid-board/get-paid-board";
import {
  getSofiaDate,
  isValidDateString,
} from "@/lib/time/sofia";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const requestedDate =
      request.nextUrl.searchParams.get(
        "date",
      );

    const date =
      requestedDate ?? getSofiaDate();

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

    const board =
      await getPaidBoard(date);

    if (!board) {
      return NextResponse.json(
        {
          ok: true,
          date,
          published: false,
          leagues: [],
        },
      );
    }

    return NextResponse.json({
      ok: true,
      date,
      published: true,
      board,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown paid board read error";

    console.error(
      "Paid board read failed:",
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
