import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp, slugify, sanitizeHtmlBasic } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("services.manage");
    const services = await query("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
    return NextResponse.json({ services });
  } catch (err) {
    return apiError(err, "Failed to load services");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("services.manage");
    const b = await req.json();
    if (!b.title) return NextResponse.json({ error: "Service title required" }, { status: 400 });
    const slug = slugify(b.slug || b.title);

    const res = await execute(
      `INSERT INTO services
        (title, slug, short_description, description, icon_name, featured_image, highlights_json, process_json,
         sort_order, is_featured, status, meta_title, meta_description, canonical_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.title.trim(),
        slug,
        b.short_description || null,
        b.description ? sanitizeHtmlBasic(b.description) : null,
        b.icon_name || "Briefcase",
        b.featured_image || null,
        typeof b.highlights_json === "string" ? b.highlights_json : JSON.stringify(b.highlights_json || []),
        typeof b.process_json === "string" ? b.process_json : JSON.stringify(b.process_json || []),
        Number(b.sort_order ?? 10),
        b.is_featured === false ? 0 : 1,
        b.status === "draft" ? "draft" : "published",
        b.meta_title || `${b.title} | Growth Realtech`,
        b.meta_description || b.short_description || null,
        b.canonical_url || null,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_SERVICE",
      module: "services",
      entityId: res.insertId,
      details: `Created service '${b.title}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/services"]);
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create service");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("services.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    const slug = slugify(b.slug || b.title);

    await execute(
      `UPDATE services SET
        title = ?, slug = ?, short_description = ?, description = ?, icon_name = ?, featured_image = ?,
        highlights_json = ?, process_json = ?, sort_order = ?, is_featured = ?, status = ?,
        meta_title = ?, meta_description = ?, canonical_url = ?
       WHERE id = ?`,
      [
        b.title.trim(),
        slug,
        b.short_description || null,
        b.description ? sanitizeHtmlBasic(b.description) : null,
        b.icon_name || "Briefcase",
        b.featured_image || null,
        typeof b.highlights_json === "string" ? b.highlights_json : JSON.stringify(b.highlights_json || []),
        typeof b.process_json === "string" ? b.process_json : JSON.stringify(b.process_json || []),
        Number(b.sort_order ?? 0),
        b.is_featured ? 1 : 0,
        b.status === "draft" ? "draft" : "published",
        b.meta_title || null,
        b.meta_description || null,
        b.canonical_url || null,
        id,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_SERVICE",
      module: "services",
      entityId: id,
      details: `Updated service '${b.title}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/services"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update service");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("services.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    await execute("DELETE FROM services WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_SERVICE",
      module: "services",
      entityId: id,
      details: `Deleted service #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/services"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete service");
  }
}
