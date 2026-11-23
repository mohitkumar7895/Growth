import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query, queryOne, execute } from "./db";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "gr_admin_session";

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "growth-realtech-dev-fallback-secret-change-in-production-64chars";
  return new TextEncoder().encode(secret);
}

export interface AdminSessionUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleSlug: string;
  roleName: string;
  permissions: string[];
  avatarUrl: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: {
  id: number;
  email: string;
  roleSlug: string;
}): Promise<string> {
  return new SignJWT({
    sub: String(payload.id),
    email: payload.email,
    role: payload.roleSlug,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ id: number; email: string; roleSlug: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      id: Number(payload.sub),
      email: String(payload.email),
      roleSlug: String(payload.role),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = await verifySessionToken(token);
  if (!decoded) return null;

  const admin = await queryOne<{
    id: number;
    name: string;
    email: string;
    role_id: number;
    role_slug: string;
    role_name: string;
    avatar_url: string | null;
    is_active: number;
  }>(
    `SELECT a.id, a.name, a.email, a.role_id, a.avatar_url, a.is_active,
            r.slug AS role_slug, r.name AS role_name
     FROM admins a
     JOIN roles r ON r.id = a.role_id
     WHERE a.id = ? AND a.is_active = 1
     LIMIT 1`,
    [decoded.id]
  );

  if (!admin) return null;

  const permRows = await query<{ slug: string }>(
    `SELECT p.slug
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = ?`,
    [admin.role_id]
  );

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    roleId: admin.role_id,
    roleSlug: admin.role_slug,
    roleName: admin.role_name,
    permissions: permRows.map((p) => p.slug),
    avatarUrl: admin.avatar_url,
  };
}

export function hasPermission(
  admin: AdminSessionUser | null,
  permission: string
): boolean {
  if (!admin) return false;
  if (admin.roleSlug === "super_admin") return true;
  return admin.permissions.includes(permission);
}

export async function requireAdmin(
  permission?: string
): Promise<AdminSessionUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  if (permission && !hasPermission(admin, permission)) {
    throw new Error("FORBIDDEN");
  }
  return admin;
}

export async function logActivity(params: {
  adminId?: number | null;
  adminName?: string | null;
  action: string;
  module: string;
  entityId?: string | number | null;
  details?: string;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await execute(
      `INSERT INTO activity_logs (admin_id, admin_name, action, module, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.adminId ?? null,
        params.adminName ?? "System",
        params.action,
        params.module,
        params.entityId != null ? String(params.entityId) : null,
        params.details ?? null,
        params.ipAddress ?? null,
      ]
    );
  } catch {
    // Non-blocking audit logging
  }
}
