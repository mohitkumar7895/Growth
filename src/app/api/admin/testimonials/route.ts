import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("testimonials.manage");
    const testimonials = await query(
      "SELECT * FROM testimonials ORDER BY sort_order ASC, id DESC"
    );
    return NextResponse.json({ testimonials });
  } catch (err) {
    return apiError(err, "Failed to load testimonials");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("testimonials.manage");
    const b = await req.json();
    if (!b.client_name || !b.feedback) {
      return NextResponse.json({ error: "Client name and feedback are required" }, { status: 400 });
    }
    const res = await execute(
      `INSERT INTO testimonials
        (client_name, designation, company, profile_image, feedback, rating, property_context, is_featured, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.client_name.trim(),
        b.designation || null,
        b.company || null,
        b.profile_image || null,
        b.feedback.trim(),
        Math.min(5, Math.max(1, Number(b.rating ?? 5))),
        b.property_context || null,
        b.is_featured === false ? 0 : 1,
        b.status === "draft" ? "draft" : "published",
        Number(b.sort_order ?? 10),
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_TESTIMONIAL",
      module: "testimonials",
      entityId: res.insertId,
      details: `Added testimonial from '${b.client_name}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache();
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create testimonial");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("testimonials.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Testimonial ID required" }, { status: 400 });
    await execute(
      `UPDATE testimonials SET
        client_name = ?, designation = ?, company = ?, profile_image = ?, feedback = ?,
        rating = ?, property_context = ?, is_featured = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [
        b.client_name.trim(),
        b.designation || null,
        b.company || null,
        b.profile_image || null,
        b.feedback.trim(),
        Math.min(5, Math.max(1, Number(b.rating ?? 5))),
        b.property_context || null,
        b.is_featured ? 1 : 0,
        b.status === "draft" ? "draft" : "published",
        Number(b.sort_order ?? 0),
        id,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_TESTIMONIAL",
      module: "testimonials",
      entityId: id,
      details: `Updated testimonial from '${b.client_name}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update testimonial");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("testimonials.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Testimonial ID required" }, { status: 400 });
    await execute("DELETE FROM testimonials WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_TESTIMONIAL",
      module: "testimonials",
      entityId: id,
      details: `Deleted testimonial #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete testimonial");
  }
}
