import type {
  NextRequest,
} from "next/server";

import {
  requirePaidApiAccess,
} from "@/lib/auth/entitlement";
import {
  getPaidPicks,
} from "@/lib/paid-picks/public-paid-picks";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

export const dynamic =
  "force-dynamic";

export async function GET(
  request:
    NextRequest,
) {
  const date =
    request.nextUrl
      .searchParams
      .get("date") ??
    getSofiaDate();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      date,
    )
  ) {
    return Response.json(
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

  const access =
    await requirePaidApiAccess(
      date,
    );

  if (!access.ok) {
    return access.response;
  }

  const board =
    await getPaidPicks(
      date,
    );

  return Response.json({
    ok: true,
    board,
  });
}
