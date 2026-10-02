import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getModelStatistics } from "@/lib/statistics/model-statistics";

export const dynamic = "force-dynamic";

function isAuthorized(
  request: NextRequest,
) {
  const expected =
    process.env.INTERNAL_API_SECRET;

  if (!expected) {
    throw new Error(
      "Missing INTERNAL_API_SECRET",
    );
  }

  return (
    request.headers.get(
      "authorization",
    ) === `Bearer ${expected}`
  );
}

export async function GET(
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

    const statistics =
      await getModelStatistics();

    return NextResponse.json({
      ok: true,
      statistics,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown model statistics error";

    console.error(
      "Model statistics failed:",
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
