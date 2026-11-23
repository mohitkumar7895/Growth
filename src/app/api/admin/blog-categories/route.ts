import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp, slugify } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("blogs.manage");
    const categories = await query(
      "SELECT * FROM blog_categories ORDER BY sort_order ASC, name ASC"
    );
    return NextResponse.json({ categories });
  } catch (err) {
    return apiError(err, "Failed to load blog categories");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("blogs.manage");
    const b = await req.json();
    const name = String(b.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    const slug = slugify(b.slug || name);
    const res = await execute(
      "INSERT INTO blog_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)",
      [name, slug, b.description || null, Number(b.sort_order ?? 10)]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_BLOG_CATEGORY",
      module: "blogs",
      entityId: res.insertId,
      details: `Created blog category '${name}'`,
      ipAddress: getClientIp(req),
    });
    revalidatePath("/insights");
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create blog category");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("blogs.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    await execute("DELETE FROM blog_categories WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_BLOG_CATEGORY",
      module: "blogs",
      entityId: id,
      details: `Deleted blog category #${id}`,
      ipAddress: getClientIp(req),
    });
    revalidatePath("/insights");
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete blog category");
  }
}
