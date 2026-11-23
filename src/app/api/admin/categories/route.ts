import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp, slugify } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("categories.manage");
    const categories = await query(
      "SELECT * FROM property_categories ORDER BY sort_order ASC, id ASC"
    );
    return NextResponse.json({ categories });
  } catch (err) {
    return apiError(err, "Failed to load categories");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("categories.manage");
    const b = await req.json();
    if (!b.name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    const slug = slugify(b.slug || b.name);

    const res = await execute(
      `INSERT INTO property_categories
        (name, slug, short_description, description, image_url, icon_name, sort_order, is_active, is_featured, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.name.trim(),
        slug,
        b.short_description || null,
        b.description || null,
        b.image_url || null,
        b.icon_name || "Building2",
        Number(b.sort_order ?? 10),
        b.is_active === false ? 0 : 1,
        b.is_featured === false ? 0 : 1,
        b.meta_title || `${b.name} | Growth Realtech`,
        b.meta_description || b.short_description || null,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_CATEGORY",
      module: "categories",
      entityId: res.insertId,
      details: `Created property category '${b.name}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/properties"]);
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create category");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("categories.manage");
    const b = await req.json();
    if (Array.isArray(b.reorder)) {
      for (const item of b.reorder) {
        await execute("UPDATE property_categories SET sort_order = ? WHERE id = ?", [
          Number(item.sort_order),
          Number(item.id),
        ]);
      }
      invalidateSiteCache(["/properties"]);
      return NextResponse.json({ success: true });
    }
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    const slug = slugify(b.slug || b.name);

    await execute(
      `UPDATE property_categories SET
        name = ?, slug = ?, short_description = ?, description = ?, image_url = ?, icon_name = ?,
        sort_order = ?, is_active = ?, is_featured = ?, meta_title = ?, meta_description = ?
       WHERE id = ?`,
      [
        b.name.trim(),
        slug,
        b.short_description || null,
        b.description || null,
        b.image_url || null,
        b.icon_name || "Building2",
        Number(b.sort_order ?? 0),
        b.is_active ? 1 : 0,
        b.is_featured ? 1 : 0,
        b.meta_title || null,
        b.meta_description || null,
        id,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_CATEGORY",
      module: "categories",
      entityId: id,
      details: `Updated category '${b.name}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/properties"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update category");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("categories.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    await execute("DELETE FROM property_categories WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_CATEGORY",
      module: "categories",
      entityId: id,
      details: `Deleted category #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/properties"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete category");
  }
}
