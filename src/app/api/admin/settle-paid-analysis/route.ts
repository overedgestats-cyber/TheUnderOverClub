import { NextRequest, NextResponse } from "next/server";
import { settlePaidAnalysis } from "@/lib/settlement/settle-paid-analysis";
import { getSofiaDate, isValidDateString } from "@/lib/time/sofia";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest) {
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) throw new Error("Missing INTERNAL_API_SECRET");
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    let body: { date?: unknown; commit?: unknown } = {};
    try { body = await request.json(); } catch { body = {}; }
    const date = typeof body.date === "string" ? body.date : getSofiaDate();
    if (!isValidDateString(date)) return NextResponse.json({ ok: false, error: "Date must use YYYY-MM-DD format" }, { status: 400 });
    const commit = body.commit === true;
    const result = await settlePaidAnalysis({ date, commit });
    return NextResponse.json({ ok: true, committed: commit, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown paid settlement error";
    console.error("Paid analysis settlement failed:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
