import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("enquiries.manage");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || 15)));
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status && status !== "All") {
      conditions.push("e.status = ?");
      params.push(status);
    }
    if (type && type !== "All") {
      conditions.push("e.enquiry_type = ?");
      params.push(type);
    }
    if (location && location !== "All") {
      conditions.push("e.preferred_location LIKE ?");
      params.push(`%${location}%`);
    }
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      conditions.push("DATE(e.created_at) >= ?");
      params.push(from);
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      conditions.push("DATE(e.created_at) <= ?");
      params.push(to);
    }
    if (q) {
      conditions.push(
        "(e.name LIKE ? OR e.phone LIKE ? OR e.email LIKE ? OR e.property_interest LIKE ? OR e.preferred_location LIKE ?)"
      );
      const t = `%${q}%`;
      params.push(t, t, t, t, t);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows, countRow, staff] = await Promise.all([
      query(
        `SELECT e.*, a.name AS assigned_name
         FROM enquiries e
         LEFT JOIN admins a ON a.id = e.assigned_to
         ${where}
         ORDER BY e.created_at DESC
         LIMIT ${pageSize} OFFSET ${offset}`,
        params
      ),
      queryOne<{ total: number }>(
        `SELECT COUNT(*) AS total FROM enquiries e ${where}`,
        params
      ),
      query("SELECT id, name, email FROM admins WHERE is_active = 1 ORDER BY name ASC"),
    ]);

    return NextResponse.json({
      enquiries: rows,
      total: Number(countRow?.total || 0),
      page,
      pageSize,
      staff,
    });
  } catch (err) {
    return apiError(err, "Failed to load enquiries");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("enquiries.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });

    await execute(
      `UPDATE enquiries SET
        status = ?, internal_notes = ?, assigned_to = ?, follow_up_date = ?
       WHERE id = ?`,
      [
        b.status || "New",
        b.internal_notes ?? null,
        b.assigned_to ? Number(b.assigned_to) : null,
        b.follow_up_date || null,
        id,
      ]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_ENQUIRY",
      module: "enquiries",
      entityId: id,
      details: `Updated enquiry #${id} status to '${b.status}'`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update enquiry");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("enquiries.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });
    await execute("DELETE FROM enquiries WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_ENQUIRY",
      module: "enquiries",
      entityId: id,
      details: `Deleted enquiry #${id}`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete enquiry");
  }
}
