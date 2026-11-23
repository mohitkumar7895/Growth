import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { apiError, getClientIp, slugify, sanitizeHtmlBasic } from "@/lib/security";
import type { ProjectImage, ProjectItem } from "@/types";

export async function GET() {
  try {
    await requireAdmin("projects.manage");
    const projects = await query<ProjectItem>(
      "SELECT * FROM projects ORDER BY sort_order ASC, id DESC"
    );
    const images = await query<ProjectImage>(
      "SELECT * FROM project_images ORDER BY sort_order ASC, id ASC"
    );
    const imgMap = new Map<number, ProjectImage[]>();
    for (const img of images) {
      const list = imgMap.get(img.project_id) || [];
      list.push(img);
      imgMap.set(img.project_id, list);
    }
    const enriched = projects.map((p) => ({
      ...p,
      images: imgMap.get(p.id) || [],
    }));
    return NextResponse.json({ projects: enriched });
  } catch (err) {
    return apiError(err, "Failed to load projects");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("projects.manage");
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid project data" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const slug = slugify(d.slug || d.name);

    const res = await execute(
      `INSERT INTO projects
        (name, slug, category, property_category_id, developer_name, location, sector, region_filter,
         short_description, description, featured_image, rera_number, rera_status_note, price_range,
         configuration, project_status, amenities_json, specifications_json, map_embed_url,
         brochure_url, official_website_url, is_featured, status, sort_order, meta_title,
         meta_description, canonical_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.name,
        slug,
        d.category,
        d.property_category_id || null,
        d.developer_name || null,
        d.location,
        d.sector || null,
        d.region_filter,
        d.short_description || null,
        d.description ? sanitizeHtmlBasic(d.description) : null,
        d.featured_image || null,
        d.rera_number || null,
        d.rera_status_note || "Reference listing — confirm official UP-RERA details during consultation.",
        d.price_range || "Price on Request",
        d.configuration || null,
        d.project_status || "Enquire for Latest Status",
        d.amenities_json || "[]",
        d.specifications_json || "{}",
        d.map_embed_url || null,
        d.brochure_url || null,
        d.official_website_url || null,
        d.is_featured,
        d.status,
        d.sort_order,
        d.meta_title || `${d.name} ${d.location} | Growth Realtech`,
        d.meta_description || d.short_description || null,
        d.canonical_url || null,
      ]
    );

    if (d.gallery && d.gallery.length > 0) {
      for (let i = 0; i < d.gallery.length; i++) {
        const g = d.gallery[i];
        await execute(
          `INSERT INTO project_images (project_id, image_url, alt_text, caption, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [res.insertId, g.image_url, g.alt_text || d.name, g.caption || null, i + 1]
        );
      }
    }

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_PROJECT",
      module: "projects",
      entityId: res.insertId,
      details: `Created project '${d.name}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/projects"]);
    return NextResponse.json({ success: true, id: res.insertId, slug }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create project");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("projects.manage");
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid project data" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const slug = slugify(d.slug || d.name);

    await execute(
      `UPDATE projects SET
        name = ?, slug = ?, category = ?, property_category_id = ?, developer_name = ?,
        location = ?, sector = ?, region_filter = ?, short_description = ?, description = ?,
        featured_image = ?, rera_number = ?, rera_status_note = ?, price_range = ?,
        configuration = ?, project_status = ?, amenities_json = ?, specifications_json = ?,
        map_embed_url = ?, brochure_url = ?, official_website_url = ?, is_featured = ?,
        status = ?, sort_order = ?, meta_title = ?, meta_description = ?, canonical_url = ?
       WHERE id = ?`,
      [
        d.name,
        slug,
        d.category,
        d.property_category_id || null,
        d.developer_name || null,
        d.location,
        d.sector || null,
        d.region_filter,
        d.short_description || null,
        d.description ? sanitizeHtmlBasic(d.description) : null,
        d.featured_image || null,
        d.rera_number || null,
        d.rera_status_note || "Reference listing — confirm official UP-RERA details during consultation.",
        d.price_range || "Price on Request",
        d.configuration || null,
        d.project_status || "Enquire for Latest Status",
        d.amenities_json || "[]",
        d.specifications_json || "{}",
        d.map_embed_url || null,
        d.brochure_url || null,
        d.official_website_url || null,
        d.is_featured,
        d.status,
        d.sort_order,
        d.meta_title || `${d.name} ${d.location} | Growth Realtech`,
        d.meta_description || d.short_description || null,
        d.canonical_url || null,
        id,
      ]
    );

    if (Array.isArray(d.gallery)) {
      await execute("DELETE FROM project_images WHERE project_id = ?", [id]);
      for (let i = 0; i < d.gallery.length; i++) {
        const g = d.gallery[i];
        await execute(
          `INSERT INTO project_images (project_id, image_url, alt_text, caption, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [id, g.image_url, g.alt_text || d.name, g.caption || null, i + 1]
        );
      }
    }

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_PROJECT",
      module: "projects",
      entityId: id,
      details: `Updated project '${d.name}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/projects"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update project");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("projects.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

    await execute("DELETE FROM projects WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_PROJECT",
      module: "projects",
      entityId: id,
      details: `Deleted project #${id}`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/projects"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete project");
  }
}
