import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("faqs.manage");
    const faqs = await query("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC");
    return NextResponse.json({ faqs });
  } catch (err) {
    return apiError(err, "Failed to load FAQs");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("faqs.manage");
    const b = await req.json();
    if (!b.question || !b.answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }
    const res = await execute(
      `INSERT INTO faqs (question, answer, category, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [b.question.trim(), b.answer.trim(), b.category || "General", Number(b.sort_order ?? 10), b.is_active === false ? 0 : 1]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_FAQ",
      module: "faqs",
      entityId: res.insertId,
      details: `Created FAQ '${b.question.slice(0, 60)}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/approach"]);
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create FAQ");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("faqs.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "FAQ ID required" }, { status: 400 });
    await execute(
      `UPDATE faqs SET question = ?, answer = ?, category = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [b.question.trim(), b.answer.trim(), b.category || "General", Number(b.sort_order ?? 0), b.is_active ? 1 : 0, id]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_FAQ",
      module: "faqs",
      entityId: id,
      details: `Updated FAQ #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/approach"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update FAQ");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("faqs.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "FAQ ID required" }, { status: 400 });
    await execute("DELETE FROM faqs WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_FAQ",
      module: "faqs",
      entityId: id,
      details: `Deleted FAQ #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/approach"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete FAQ");
  }
}
