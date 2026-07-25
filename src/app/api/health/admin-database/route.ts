import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    const { count, error } = await supabase
      .from("system_settings")
      .select("setting_key", {
        count: "exact",
        head: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      database: "admin_connected",
      settingsCount: count ?? 0,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown admin database connection error";

    console.error("Admin Supabase health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "admin_connection_failed",
        message,
      },
      {
        status: 500,
      },
    );
  }
}
