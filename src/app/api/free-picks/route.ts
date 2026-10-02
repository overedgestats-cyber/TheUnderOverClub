import { NextRequest, NextResponse } from "next/server";
import { getPublicFreePicks } from "@/lib/free-picks/public-free-picks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date") ?? undefined;

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { ok: false, error: "Date must use YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    const data = await getPublicFreePicks(date);
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Free Picks API error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
