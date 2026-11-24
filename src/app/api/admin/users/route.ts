import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAdmin, hashPassword, logActivity, clearAdminAuthCache } from "@/lib/auth";
import { apiError, getClientIp } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("users.manage");
    const [users, roles, permissions, rolePerms] = await Promise.all([
      query(
        `SELECT a.id, a.name, a.email, a.role_id, a.phone, a.is_active, a.last_login_at, a.created_at,
                r.name AS role_name, r.slug AS role_slug
         FROM admins a
         JOIN roles r ON r.id = a.role_id
         ORDER BY a.id ASC`
      ),
      query("SELECT * FROM roles ORDER BY id ASC"),
      query("SELECT * FROM permissions ORDER BY module ASC, id ASC"),
      query("SELECT role_id, permission_id FROM role_permissions"),
    ]);
    return NextResponse.json({ users, roles, permissions, rolePerms });
  } catch (err) {
    return apiError(err, "Failed to load users and roles");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("users.manage");
    const b = await req.json();
    if (!b.name || !b.email || !b.password || b.password.length < 8) {
      return NextResponse.json(
        { error: "Name, valid email, and password (min 8 chars) are required" },
        { status: 400 }
      );
    }
    const hash = await hashPassword(b.password);
    const res = await execute(
      `INSERT INTO admins (name, email, password_hash, role_id, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b.name.trim(),
        b.email.trim().toLowerCase(),
        hash,
        Number(b.role_id || 3),
        b.phone || null,
        b.is_active === false ? 0 : 1,
      ]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_ADMIN_USER",
      module: "users",
      entityId: res.insertId,
      details: `Created admin user '${b.email}'`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create admin user");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("users.manage");
    const b = await req.json();

    // Support updating role permissions matrix
    if (b.updateRolePermissions && b.role_id && Array.isArray(b.permission_ids)) {
      const roleId = Number(b.role_id);
      if (roleId === 1) {
        return NextResponse.json(
          { error: "Super Admin permissions cannot be restricted" },
          { status: 400 }
        );
      }
      await execute("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
      for (const pid of b.permission_ids) {
        await execute(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, Number(pid)]
        );
      }
      clearAdminAuthCache();
      await logActivity({
        adminId: admin.id,
        adminName: admin.name,
        action: "UPDATE_ROLE_PERMISSIONS",
        module: "users",
        entityId: roleId,
        details: `Updated permissions for role #${roleId}`,
        ipAddress: getClientIp(req),
      });
      return NextResponse.json({ success: true });
    }

    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    if (b.password && b.password.length >= 8) {
      const hash = await hashPassword(b.password);
      await execute(
        `UPDATE admins SET name = ?, email = ?, password_hash = ?, role_id = ?, phone = ?, is_active = ? WHERE id = ?`,
        [b.name.trim(), b.email.trim().toLowerCase(), hash, Number(b.role_id), b.phone || null, b.is_active ? 1 : 0, id]
      );
    } else {
      await execute(
        `UPDATE admins SET name = ?, email = ?, role_id = ?, phone = ?, is_active = ? WHERE id = ?`,
        [b.name.trim(), b.email.trim().toLowerCase(), Number(b.role_id), b.phone || null, b.is_active ? 1 : 0, id]
      );
    }

    clearAdminAuthCache(id);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_ADMIN_USER",
      module: "users",
      entityId: id,
      details: `Updated admin user '${b.email}'`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update user");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("users.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });
    if (id === admin.id) {
      return NextResponse.json({ error: "You cannot delete your own active account" }, { status: 400 });
    }
    await execute("DELETE FROM admins WHERE id = ?", [id]);
    clearAdminAuthCache(id);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_ADMIN_USER",
      module: "users",
      entityId: id,
      details: `Deleted admin user #${id}`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete user");
  }
}
