import { NextResponse } from "next/server";

import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();

    const { count, error } = await supabase
      .from("fixtures")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      database: "connected",
      fixtureCount: count ?? 0,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown database connection error";

    console.error("Supabase health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "connection_failed",
        message,
      },
      {
        status: 500,
      },
    );
  }
}
