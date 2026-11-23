import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("seo.manage");
    const pages = await query("SELECT * FROM seo_metadata ORDER BY id ASC");
    return NextResponse.json({ pages });
  } catch (err) {
    return apiError(err, "Failed to load SEO metadata");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("seo.manage");
    const b = await req.json();
    if (!b.page_key || !b.meta_title) {
      return NextResponse.json({ error: "Page key and meta title are required" }, { status: 400 });
    }
    await execute(
      `INSERT INTO seo_metadata
        (page_key, page_label, meta_title, meta_description, keywords, og_title, og_description, og_image, canonical_url, robots, schema_json, include_in_sitemap)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        page_label = VALUES(page_label),
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        keywords = VALUES(keywords),
        og_title = VALUES(og_title),
        og_description = VALUES(og_description),
        og_image = VALUES(og_image),
        canonical_url = VALUES(canonical_url),
        robots = VALUES(robots),
        schema_json = VALUES(schema_json),
        include_in_sitemap = VALUES(include_in_sitemap)`,
      [
        b.page_key,
        b.page_label || b.page_key,
        b.meta_title,
        b.meta_description || null,
        b.keywords || null,
        b.og_title || null,
        b.og_description || null,
        b.og_image || null,
        b.canonical_url || null,
        b.robots || "index, follow",
        b.schema_json || null,
        b.include_in_sitemap === false ? 0 : 1,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_SEO",
      module: "seo",
      entityId: b.page_key,
      details: `Updated SEO metadata for '${b.page_key}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/sitemap.xml"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update SEO metadata");
  }
}
