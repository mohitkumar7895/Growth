import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
import { apiError, getClientIp, slugify, sanitizeHtmlBasic } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("properties.manage");
    const properties = await query(
      `SELECT p.*, c.name AS category_name
       FROM properties p
       LEFT JOIN property_categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    );
    return NextResponse.json({ properties });
  } catch (err) {
    return apiError(err, "Failed to load properties");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("properties.manage");
    const body = await req.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid property data" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const slug = slugify(d.slug || d.title);

    const res = await execute(
      `INSERT INTO properties
        (title, slug, category_id, property_type, location, sector, city, budget_range, price_display,
         purpose, property_status, area_size, configuration, short_description, description,
         specifications_json, amenities_json, featured_image, gallery_json, map_embed_url,
         brochure_url, is_featured, status, meta_title, meta_description, canonical_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.title,
        slug,
        d.category_id || null,
        d.property_type,
        d.location,
        d.sector || null,
        d.city || d.location,
        d.budget_range || "Open to Options",
        d.price_display || "Price on Request",
        d.purpose || "Investment",
        d.property_status || "Available for Consultation",
        d.area_size || null,
        d.configuration || null,
        d.short_description || null,
        d.description ? sanitizeHtmlBasic(d.description) : null,
        d.specifications_json || "{}",
        d.amenities_json || "[]",
        d.featured_image || null,
        d.gallery_json || "[]",
        d.map_embed_url || null,
        d.brochure_url || null,
        d.is_featured,
        d.status,
        d.meta_title || `${d.title} | Growth Realtech`,
        d.meta_description || d.short_description || null,
        d.canonical_url || null,
      ]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_PROPERTY",
      module: "properties",
      entityId: res.insertId,
      details: `Created property '${d.title}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/properties"]);
    return NextResponse.json({ success: true, id: res.insertId, slug }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create property");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("properties.manage");
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "Property ID required" }, { status: 400 });

    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid property data" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const slug = slugify(d.slug || d.title);

    await execute(
      `UPDATE properties SET
        title = ?, slug = ?, category_id = ?, property_type = ?, location = ?, sector = ?, city = ?,
        budget_range = ?, price_display = ?, purpose = ?, property_status = ?, area_size = ?,
        configuration = ?, short_description = ?, description = ?, specifications_json = ?,
        amenities_json = ?, featured_image = ?, gallery_json = ?, map_embed_url = ?,
        brochure_url = ?, is_featured = ?, status = ?, meta_title = ?, meta_description = ?, canonical_url = ?
       WHERE id = ?`,
      [
        d.title,
        slug,
        d.category_id || null,
        d.property_type,
        d.location,
        d.sector || null,
        d.city || d.location,
        d.budget_range || "Open to Options",
        d.price_display || "Price on Request",
        d.purpose || "Investment",
        d.property_status || "Available for Consultation",
        d.area_size || null,
        d.configuration || null,
        d.short_description || null,
        d.description ? sanitizeHtmlBasic(d.description) : null,
        d.specifications_json || "{}",
        d.amenities_json || "[]",
        d.featured_image || null,
        d.gallery_json || "[]",
        d.map_embed_url || null,
        d.brochure_url || null,
        d.is_featured,
        d.status,
        d.meta_title || `${d.title} | Growth Realtech`,
        d.meta_description || d.short_description || null,
        d.canonical_url || null,
        id,
      ]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_PROPERTY",
      module: "properties",
      entityId: id,
      details: `Updated property '${d.title}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/properties"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update property");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("properties.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Property ID required" }, { status: 400 });

    await execute("DELETE FROM properties WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_PROPERTY",
      module: "properties",
      entityId: id,
      details: `Deleted property #${id}`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/properties"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete property");
  }
}
