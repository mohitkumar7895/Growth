import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { query, ensureRegistrationSchema } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatIstParts(val: unknown): { date: string; time: string } {
  if (!val) return { date: "", time: "" };
  const d = val instanceof Date ? val : new Date(String(val));
  if (Number.isNaN(d.getTime())) return { date: String(val), time: "" };
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
  return { date, time: `${time} IST` };
}

function formatDateOnly(val: unknown): string {
  if (!val) return "";
  if (val instanceof Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(val);
  }
  return String(val).slice(0, 10);
}

function styleWorksheet(
  ws: ExcelJS.Worksheet,
  columns: Array<{ header: string; key: string; width: number }>
) {
  ws.columns = columns;
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  const headerRow = ws.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFE0C796" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0C3323" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FFC6A66C" } },
    };
  });
}

function finalizeRows(ws: ExcelJS.Worksheet) {
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5EAE6" } },
      };
      if (rowNumber % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF6F7F2" },
        };
      }
    });
  });
}

function isValidIsoDate(s: string | null): s is string {
  return Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const datasetRaw = (searchParams.get("dataset") || "all").toLowerCase();
    const dataset: "enquiries" | "contacts" | "customers" | "all" =
      datasetRaw === "enquiries" ||
      datasetRaw === "contacts" ||
      datasetRaw === "customers" ||
      datasetRaw === "all"
        ? datasetRaw
        : "all";

    const admin = await requireAdmin(
      dataset === "contacts" ? "contacts.manage" : "enquiries.manage"
    );

    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const propertyType = searchParams.get("propertyType");
    const verificationMethod = searchParams.get("verificationMethod");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q")?.trim() || "";

    const wb = new ExcelJS.Workbook();
    wb.creator = "Growth Realtech CRM";
    wb.created = new Date();

    // 1. Enquiries Sheet
    if (dataset === "enquiries" || dataset === "all") {
      const conds: string[] = [];
      const params: unknown[] = [];
      if (dataset === "enquiries" && status && status !== "All") {
        conds.push("e.status = ?");
        params.push(status);
      }
      if (type && type !== "All") {
        conds.push("e.enquiry_type = ?");
        params.push(type);
      }
      if (location && location !== "All") {
        conds.push("e.preferred_location LIKE ?");
        params.push(`%${location}%`);
      }
      if (isValidIsoDate(from)) {
        conds.push("DATE(e.created_at) >= ?");
        params.push(from);
      }
      if (isValidIsoDate(to)) {
        conds.push("DATE(e.created_at) <= ?");
        params.push(to);
      }
      if (q) {
        conds.push(
          "(e.name LIKE ? OR e.phone LIKE ? OR e.email LIKE ? OR e.property_interest LIKE ? OR e.preferred_location LIKE ?)"
        );
        const t = `%${q}%`;
        params.push(t, t, t, t, t);
      }
      const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
      const rows = await query<Record<string, unknown>>(
        `SELECT e.*, a.name AS assigned_name
         FROM enquiries e
         LEFT JOIN admins a ON a.id = e.assigned_to
         ${where}
         ORDER BY e.created_at DESC`,
        params
      );

      const ws = wb.addWorksheet("Enquiries");
      styleWorksheet(ws, [
        { header: "ID", key: "id", width: 8 },
        { header: "Client Name", key: "name", width: 22 },
        { header: "Phone", key: "phone", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Enquiry Type", key: "enquiry_type", width: 16 },
        { header: "Property / Project Interest", key: "property_interest", width: 28 },
        { header: "Preferred Location", key: "preferred_location", width: 20 },
        { header: "Budget Range", key: "budget_range", width: 20 },
        { header: "Purpose", key: "purpose", width: 18 },
        { header: "Message", key: "message", width: 38 },
        { header: "Source Page", key: "source_page", width: 20 },
        { header: "Status", key: "status", width: 20 },
        { header: "Assigned Advisor", key: "assigned_name", width: 20 },
        { header: "Follow-up Date", key: "follow_up_date", width: 16 },
        { header: "Internal Notes", key: "internal_notes", width: 32 },
        { header: "Date (IST)", key: "date_ist", width: 14 },
        { header: "Time (IST)", key: "time_ist", width: 14 },
      ]);

      for (const r of rows) {
        const dt = formatIstParts(r.created_at);
        ws.addRow({
          id: r.id,
          name: r.name || "",
          phone: r.phone || "",
          email: r.email || "",
          enquiry_type: r.enquiry_type || "",
          property_interest: r.property_interest || "",
          preferred_location: r.preferred_location || "",
          budget_range: r.budget_range || "",
          purpose: r.purpose || "",
          message: r.message || "",
          source_page: r.source_page || "",
          status: r.status || "",
          assigned_name: r.assigned_name || "",
          follow_up_date: formatDateOnly(r.follow_up_date),
          internal_notes: r.internal_notes || "",
          date_ist: dt.date,
          time_ist: dt.time,
        });
      }
      finalizeRows(ws);
    }

    // 2. Contact Submissions Sheet
    if (dataset === "contacts" || dataset === "all") {
      const conds: string[] = [];
      const params: unknown[] = [];
      if (dataset === "contacts" && status && status !== "All") {
        conds.push("status = ?");
        params.push(status);
      }
      if (isValidIsoDate(from)) {
        conds.push("DATE(created_at) >= ?");
        params.push(from);
      }
      if (isValidIsoDate(to)) {
        conds.push("DATE(created_at) <= ?");
        params.push(to);
      }
      if (q) {
        conds.push("(name LIKE ? OR phone LIKE ? OR email LIKE ? OR subject LIKE ? OR location LIKE ?)");
        const t = `%${q}%`;
        params.push(t, t, t, t, t);
      }
      const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
      const rows = await query<Record<string, unknown>>(
        `SELECT * FROM contact_submissions ${where} ORDER BY created_at DESC`,
        params
      );

      const ws = wb.addWorksheet("Contact Submissions");
      styleWorksheet(ws, [
        { header: "ID", key: "id", width: 8 },
        { header: "Sender Name", key: "name", width: 22 },
        { header: "Phone", key: "phone", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Subject", key: "subject", width: 28 },
        { header: "Location", key: "location", width: 20 },
        { header: "Message", key: "message", width: 42 },
        { header: "Status", key: "status", width: 16 },
        { header: "Internal Notes", key: "internal_notes", width: 32 },
        { header: "Date (IST)", key: "date_ist", width: 14 },
        { header: "Time (IST)", key: "time_ist", width: 14 },
      ]);

      for (const r of rows) {
        const dt = formatIstParts(r.created_at);
        ws.addRow({
          id: r.id,
          name: r.name || "",
          phone: r.phone || "",
          email: r.email || "",
          subject: r.subject || "",
          location: r.location || "",
          message: r.message || "",
          status: r.status || "",
          internal_notes: r.internal_notes || "",
          date_ist: dt.date,
          time_ist: dt.time,
        });
      }
      finalizeRows(ws);
    }

    // 3. Customer Registrations Database Sheet
    if (dataset === "customers" || dataset === "all") {
      await ensureRegistrationSchema();
      const conds: string[] = [];
      const params: unknown[] = [];
      if (dataset === "customers" && status && status !== "All") {
        conds.push("c.status = ?");
        params.push(status);
      }
      if (location && location !== "All") {
        conds.push("c.preferred_location LIKE ?");
        params.push(`%${location}%`);
      }
      if (propertyType && propertyType !== "All") {
        conds.push("c.property_type = ?");
        params.push(propertyType);
      }
      if (verificationMethod && verificationMethod !== "All") {
        conds.push("c.verification_method = ?");
        params.push(verificationMethod);
      }
      if (isValidIsoDate(from)) {
        conds.push("COALESCE(c.registration_date, DATE(c.created_at)) >= ?");
        params.push(from);
      }
      if (isValidIsoDate(to)) {
        conds.push("COALESCE(c.registration_date, DATE(c.created_at)) <= ?");
        params.push(to);
      }
      if (q) {
        conds.push(
          "(c.full_name LIKE ? OR c.full_phone LIKE ? OR c.email LIKE ? OR c.preferred_location LIKE ? OR c.property_type LIKE ?)"
        );
        const t = `%${q}%`;
        params.push(t, t, t, t, t);
      }
      const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
      const rows = await query<Record<string, unknown>>(
        `SELECT c.*, a.name AS assigned_name
         FROM customer_registrations c
         LEFT JOIN admins a ON a.id = c.assigned_to
         ${where}
         ORDER BY c.created_at DESC`,
        params
      );

      const ws = wb.addWorksheet("Customer Registrations");
      styleWorksheet(ws, [
        { header: "ID", key: "id", width: 8 },
        { header: "Full Name", key: "full_name", width: 22 },
        { header: "Email", key: "email", width: 28 },
        { header: "Email Verified", key: "email_verified", width: 15 },
        { header: "Mobile", key: "full_phone", width: 18 },
        { header: "Mobile Verified", key: "mobile_verified", width: 15 },
        { header: "OTP Method", key: "verification_method", width: 14 },
        { header: "Requirement", key: "requirement", width: 18 },
        { header: "Property Type", key: "property_type", width: 20 },
        { header: "Preferred Location", key: "preferred_location", width: 20 },
        { header: "Budget Range", key: "budget_range", width: 20 },
        { header: "Address / City", key: "address_city", width: 24 },
        { header: "Additional Details", key: "additional_details", width: 32 },
        { header: "Registration Date (IST)", key: "reg_date", width: 20 },
        { header: "Registration Time (IST)", key: "reg_time", width: 20 },
        { header: "Latitude", key: "latitude", width: 14 },
        { header: "Longitude", key: "longitude", width: 14 },
        { header: "GPS Co-ordinates", key: "coordinates_label", width: 24 },
        { header: "GPS Detected Address", key: "geo_address", width: 42 },
        { header: "GPS Accuracy (m)", key: "location_accuracy", width: 16 },
        { header: "Google Maps Link", key: "maps_link", width: 38 },
        { header: "IP Address", key: "ip_address", width: 18 },
        { header: "Status", key: "status", width: 18 },
        { header: "Assigned Advisor", key: "assigned_name", width: 20 },
        { header: "Internal Notes", key: "internal_notes", width: 32 },
      ]);

      for (const r of rows) {
        const dt = formatIstParts(r.created_at);
        const lat = r.latitude !== null && r.latitude !== undefined ? Number(r.latitude) : null;
        const lng = r.longitude !== null && r.longitude !== undefined ? Number(r.longitude) : null;
        const mapsLink =
          lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
            ? `https://www.google.com/maps?q=${lat},${lng}`
            : "";

        ws.addRow({
          id: r.id,
          full_name: r.full_name || "",
          email: r.email || "",
          email_verified: r.email_verified ? "Yes" : "No",
          full_phone: r.full_phone || "",
          mobile_verified: r.mobile_verified ? "Yes" : "No",
          verification_method: r.verification_method === "phone" ? "Mobile OTP" : "Email OTP",
          requirement: r.requirement || "",
          property_type: r.property_type || "",
          preferred_location: r.preferred_location || "",
          budget_range: r.budget_range || "",
          address_city: r.address_city || "",
          additional_details: r.additional_details || "",
          reg_date: r.registration_date ? formatDateOnly(r.registration_date) : dt.date,
          reg_time: r.registration_time ? `${String(r.registration_time)} IST` : dt.time,
          latitude: lat ?? "",
          longitude: lng ?? "",
          coordinates_label: r.coordinates_label || (lat !== null && lng !== null ? `${lat}, ${lng}` : ""),
          geo_address: r.geo_address || "",
          location_accuracy: r.location_accuracy ?? "",
          maps_link: mapsLink,
          ip_address: r.ip_address || "",
          status: r.status || "",
          assigned_name: r.assigned_name || "",
          internal_notes: r.internal_notes || "",
        });
      }
      finalizeRows(ws);
    }

    const arrayBuffer = await wb.xlsx.writeBuffer();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const filename = `growth-realtech-${dataset}-${today}.xlsx`;

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "EXPORT_EXCEL",
      module: dataset,
      details: `Exported ${dataset} Excel report (${filename})`,
      ipAddress: getClientIp(req),
    });

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    return apiError(err, "Failed to generate Excel export");
  }
}
