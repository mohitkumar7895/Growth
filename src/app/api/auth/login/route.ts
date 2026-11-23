import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  logActivity,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const admin = await queryOne<{
      id: number;
      name: string;
      email: string;
      password_hash: string;
      role_id: number;
      role_slug: string;
      role_name: string;
      is_active: number;
    }>(
      `SELECT a.id, a.name, a.email, a.password_hash, a.role_id, a.is_active,
              r.slug AS role_slug, r.name AS role_name
       FROM admins a
       JOIN roles r ON r.id = a.role_id
       WHERE a.email = ?
       LIMIT 1`,
      [email.toLowerCase()]
    );

    if (!admin || !admin.is_active) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: admin.id,
      email: admin.email,
      roleSlug: admin.role_slug,
    });
    await setSessionCookie(token);

    await execute("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [
      admin.id,
    ]);

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "LOGIN",
      module: "auth",
      details: `Signed in from ${ip}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        roleSlug: admin.role_slug,
        roleName: admin.role_name,
      },
    });
  } catch (err) {
    return apiError(err, "Failed to authenticate");
  }
}
