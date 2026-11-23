import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("dashboard.view");
    const rows = await query<{
      setting_key: string;
      setting_group: string;
      setting_value: string | null;
      value_type: string;
    }>("SELECT setting_key, setting_group, setting_value, value_type FROM website_settings ORDER BY setting_group, setting_key");

    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.setting_key] = r.setting_value ?? "";
    }
    return NextResponse.json({ settings: map, rows });
  } catch (err) {
    return apiError(err, "Failed to load settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("settings.manage");
    const body = await req.json();
    const updates = body?.settings as Record<string, string> | undefined;
    const group = (body?.group as string) || "general";

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (!/^[a-z0-9_]+$/i.test(key)) continue;
      await execute(
        `INSERT INTO website_settings (setting_key, setting_group, setting_value, updated_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           setting_value = VALUES(setting_value),
           updated_by = VALUES(updated_by)`,
        [key, group, String(value ?? ""), admin.id]
      );
    }

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_SETTINGS",
      module: "settings",
      details: `Updated ${Object.keys(updates).length} settings in group '${group}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update settings");
  }
}
