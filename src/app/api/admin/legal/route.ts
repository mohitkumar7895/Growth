import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp, sanitizeHtmlBasic } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("legal.manage");
    const pages = await query("SELECT * FROM legal_pages ORDER BY id ASC");
    return NextResponse.json({ pages });
  } catch (err) {
    return apiError(err, "Failed to load legal pages");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("legal.manage");
    const b = await req.json();
    if (!b.slug || !b.title || !b.content) {
      return NextResponse.json({ error: "Slug, title, and content are required" }, { status: 400 });
    }
    await execute(
      `UPDATE legal_pages SET title = ?, content = ?, meta_title = ?, meta_description = ?, status = ?
       WHERE slug = ?`,
      [
        b.title.trim(),
        sanitizeHtmlBasic(b.content),
        b.meta_title || `${b.title} | Growth Realtech`,
        b.meta_description || null,
        b.status === "draft" ? "draft" : "published",
        b.slug,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_LEGAL",
      module: "legal",
      entityId: b.slug,
      details: `Updated legal page '${b.title}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache([`/${b.slug}`]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update legal page");
  }
}
