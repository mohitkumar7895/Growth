import { NextRequest, NextResponse } from "next/server";
import { query, execute, ensureRegistrationSchema } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";
import { reverseGeocodeCoordinates } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("enquiries.manage");
    await ensureRegistrationSchema();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const location = searchParams.get("location");
    const propertyType = searchParams.get("propertyType");
    const verificationMethod = searchParams.get("verificationMethod");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status && status !== "All") {
      conditions.push("c.status = ?");
      params.push(status);
    }
    if (location && location !== "All") {
      conditions.push("c.preferred_location LIKE ?");
      params.push(`%${location}%`);
    }
    if (propertyType && propertyType !== "All") {
      conditions.push("c.property_type = ?");
      params.push(propertyType);
    }
    if (verificationMethod && verificationMethod !== "All") {
      conditions.push("c.verification_method = ?");
      params.push(verificationMethod);
    }
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      conditions.push("COALESCE(c.registration_date, DATE(c.created_at)) >= ?");
      params.push(from);
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      conditions.push("COALESCE(c.registration_date, DATE(c.created_at)) <= ?");
      params.push(to);
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
      query<Record<string, unknown>>(
        `SELECT c.*, a.name AS assigned_name
         FROM customer_registrations c
         LEFT JOIN admins a ON a.id = c.assigned_to
         ${where}
         ORDER BY c.created_at DESC`,
        params
      ),
      query("SELECT id, name FROM admins WHERE is_active = 1 ORDER BY name ASC"),
    ]);

    // Backfill detailed Road/Mohalla/Area address for up to 5 existing GPS records missing geo_address
    let backfilled = 0;
    for (const row of customers) {
      if (backfilled >= 5) break;
      if (!row.geo_address && row.latitude != null && row.longitude != null) {
        const lat = Number(row.latitude);
        const lng = Number(row.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const resolved = await reverseGeocodeCoordinates(lat, lng);
          if (resolved) {
            row.geo_address = resolved;
            await execute("UPDATE customer_registrations SET geo_address = ? WHERE id = ?", [
              resolved,
              row.id,
            ]);
          }
          backfilled += 1;
        }
      }
    }

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

    await ensureRegistrationSchema();

    if (b.refreshGeoAddress && b.latitude != null && b.longitude != null) {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);
      const resolved = await reverseGeocodeCoordinates(lat, lng);
      if (resolved) {
        await execute("UPDATE customer_registrations SET geo_address = ? WHERE id = ?", [
          resolved,
          id,
        ]);
      }
      return NextResponse.json({ success: true, geo_address: resolved });
    }

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
