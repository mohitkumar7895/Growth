import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp, slugify } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("homepage.manage");
    const sections = await query(
      "SELECT * FROM homepage_sections ORDER BY sort_order ASC, id ASC"
    );
    return NextResponse.json({ sections });
  } catch (err) {
    return apiError(err, "Failed to fetch homepage sections");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("homepage.manage");
    const b = await req.json();
    const title = String(b.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "Section title is required" }, { status: 400 });
    }
    const sectionKey = slugify(b.section_key || `custom-${title}-${Date.now()}`).replace(/-/g, "_");
    const contentJson =
      typeof b.content_json === "string"
        ? b.content_json
        : JSON.stringify(b.content_json || {});

    const res = await execute(
      `INSERT INTO homepage_sections
        (section_key, section_type, title, subtitle, badge_text, description, content_json,
         image_url, video_url, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url,
         background_style, sort_order, is_visible, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionKey,
        b.section_type || "custom",
        title,
        b.subtitle || null,
        b.badge_text || null,
        b.description || null,
        contentJson,
        b.image_url || null,
        b.video_url || null,
        b.cta_primary_label || null,
        b.cta_primary_url || null,
        b.cta_secondary_label || null,
        b.cta_secondary_url || null,
        b.background_style || "cream",
        Number(b.sort_order ?? 99),
        b.is_visible ? 1 : 0,
        b.status === "draft" ? "draft" : "published",
      ]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_SECTION",
      module: "homepage",
      entityId: res.insertId,
      details: `Added homepage section '${title}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/about", "/approach"]);
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create homepage section");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("homepage.manage");
    const b = await req.json();

    // Support bulk reorder
    if (Array.isArray(b.reorder)) {
      for (const item of b.reorder) {
        await execute(
          "UPDATE homepage_sections SET sort_order = ? WHERE id = ?",
          [Number(item.sort_order), Number(item.id)]
        );
      }
      await logActivity({
        adminId: admin.id,
        adminName: admin.name,
        action: "REORDER_SECTIONS",
        module: "homepage",
        details: "Reordered homepage sections",
        ipAddress: getClientIp(req),
      });
      invalidateSiteCache(["/about", "/approach"]);
      return NextResponse.json({ success: true });
    }

    const id = Number(b.id);
    if (!id) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    }

    const contentJson =
      typeof b.content_json === "string"
        ? b.content_json
        : JSON.stringify(b.content_json || {});

    await execute(
      `UPDATE homepage_sections SET
        title = ?, subtitle = ?, badge_text = ?, description = ?, content_json = ?,
        image_url = ?, video_url = ?, cta_primary_label = ?, cta_primary_url = ?,
        cta_secondary_label = ?, cta_secondary_url = ?, background_style = ?,
        sort_order = ?, is_visible = ?, status = ?
       WHERE id = ?`,
      [
        b.title,
        b.subtitle || null,
        b.badge_text || null,
        b.description || null,
        contentJson,
        b.image_url || null,
        b.video_url || null,
        b.cta_primary_label || null,
        b.cta_primary_url || null,
        b.cta_secondary_label || null,
        b.cta_secondary_url || null,
        b.background_style || "cream",
        Number(b.sort_order ?? 0),
        b.is_visible ? 1 : 0,
        b.status === "draft" ? "draft" : "published",
        id,
      ]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_SECTION",
      module: "homepage",
      entityId: id,
      details: `Updated homepage section '${b.title}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/about", "/approach"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update homepage section");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("homepage.manage");
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Section ID required" }, { status: 400 });
    }
    await execute("DELETE FROM homepage_sections WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_SECTION",
      module: "homepage",
      entityId: id,
      details: `Deleted homepage section #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/about", "/approach"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete homepage section");
  }
}
