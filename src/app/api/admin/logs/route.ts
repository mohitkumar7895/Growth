import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("logs.view");
    const { searchParams } = new URL(req.url);
    const mod = searchParams.get("module");

    const where = mod && mod !== "all" ? "WHERE module = ?" : "";
    const params = mod && mod !== "all" ? [mod] : [];

    const logs = await query(
      `SELECT * FROM activity_logs ${where} ORDER BY created_at DESC LIMIT 150`,
      params
    );
    return NextResponse.json({ logs });
  } catch (err) {
    return apiError(err, "Failed to load activity logs");
  }
}
