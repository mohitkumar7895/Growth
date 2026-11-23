import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("navigation.manage");
    const items = await query(
      "SELECT * FROM navigation_menus ORDER BY location ASC, sort_order ASC, id ASC"
    );
    return NextResponse.json({ items });
  } catch (err) {
    return apiError(err, "Failed to load navigation menus");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("navigation.manage");
    const b = await req.json();
    if (!b.label || !b.url) {
      return NextResponse.json({ error: "Label and URL are required" }, { status: 400 });
    }
    const res = await execute(
      `INSERT INTO navigation_menus (label, url, location, target, sort_order, is_active, is_cta)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(b.label).trim(),
        String(b.url).trim(),
        b.location || "header",
        b.target || "_self",
        Number(b.sort_order ?? 10),
        b.is_active === false ? 0 : 1,
        b.is_cta ? 1 : 0,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_NAV_ITEM",
      module: "navigation",
      entityId: res.insertId,
      details: `Added navigation link '${b.label}' -> ${b.url}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache();
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create menu item");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("navigation.manage");
    const b = await req.json();
    if (Array.isArray(b.reorder)) {
      for (const item of b.reorder) {
        await execute("UPDATE navigation_menus SET sort_order = ? WHERE id = ?", [
          Number(item.sort_order),
          Number(item.id),
        ]);
      }
      invalidateSiteCache();
      return NextResponse.json({ success: true });
    }
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Menu ID required" }, { status: 400 });

    await execute(
      `UPDATE navigation_menus SET label = ?, url = ?, location = ?, target = ?, sort_order = ?, is_active = ?, is_cta = ?
       WHERE id = ?`,
      [
        String(b.label).trim(),
        String(b.url).trim(),
        b.location || "header",
        b.target || "_self",
        Number(b.sort_order ?? 0),
        b.is_active ? 1 : 0,
        b.is_cta ? 1 : 0,
        id,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_NAV_ITEM",
      module: "navigation",
      entityId: id,
      details: `Updated navigation link '${b.label}'`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update menu item");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("navigation.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Menu ID required" }, { status: 400 });
    await execute("DELETE FROM navigation_menus WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_NAV_ITEM",
      module: "navigation",
      entityId: id,
      details: `Deleted navigation item #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete menu item");
  }
}
