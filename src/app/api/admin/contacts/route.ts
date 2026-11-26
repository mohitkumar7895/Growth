import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("contacts.manage");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status && status !== "All") {
      conditions.push("status = ?");
      params.push(status);
    }
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      conditions.push("DATE(created_at) >= ?");
      params.push(from);
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      conditions.push("DATE(created_at) <= ?");
      params.push(to);
    }
    if (q) {
      conditions.push("(name LIKE ? OR phone LIKE ? OR email LIKE ? OR subject LIKE ? OR location LIKE ?)");
      const t = `%${q}%`;
      params.push(t, t, t, t, t);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const contacts = await query(
      `SELECT * FROM contact_submissions ${where} ORDER BY created_at DESC`,
      params
    );
    return NextResponse.json({ contacts });
  } catch (err) {
    return apiError(err, "Failed to load contact submissions");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("contacts.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
    await execute(
      "UPDATE contact_submissions SET status = ?, internal_notes = ? WHERE id = ?",
      [b.status || "Reviewed", b.internal_notes ?? null, id]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_CONTACT",
      module: "contacts",
      entityId: id,
      details: `Updated contact submission #${id} to '${b.status}'`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update contact submission");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("contacts.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
    await execute("DELETE FROM contact_submissions WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_CONTACT",
      module: "contacts",
      entityId: id,
      details: `Deleted contact submission #${id}`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete contact submission");
  }
}
