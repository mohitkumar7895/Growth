import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("enquiries.manage");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status && status !== "All") {
      conditions.push("c.status = ?");
      params.push(status);
    }
    if (q) {
      conditions.push(
        "(c.full_name LIKE ? OR c.full_phone LIKE ? OR c.email LIKE ? OR c.preferred_location LIKE ? OR c.property_type LIKE ?)"
      );
      const t = `%${q}%`;
      params.push(t, t, t, t, t);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [customers, staff] = await Promise.all([
      query(
        `SELECT c.*, a.name AS assigned_name
         FROM customer_registrations c
         LEFT JOIN admins a ON a.id = c.assigned_to
         ${where}
         ORDER BY c.created_at DESC`,
        params
      ),
      query("SELECT id, name FROM admins WHERE is_active = 1 ORDER BY name ASC"),
    ]);

    return NextResponse.json({ customers, staff });
  } catch (err) {
    return apiError(err, "Failed to load customer registrations");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("enquiries.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Customer ID required" }, { status: 400 });

    await execute(
      `UPDATE customer_registrations
       SET status = ?, internal_notes = ?, assigned_to = ?
       WHERE id = ?`,
      [b.status || "Verified", b.internal_notes ?? null, b.assigned_to ? Number(b.assigned_to) : null, id]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_CUSTOMER_REGISTRATION",
      module: "enquiries",
      entityId: id,
      details: `Updated customer registration #${id} status to '${b.status}'`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update customer registration");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("enquiries.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    await execute("DELETE FROM customer_registrations WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_CUSTOMER_REGISTRATION",
      module: "enquiries",
      entityId: id,
      details: `Deleted customer registration #${id}`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete customer registration");
  }
}
