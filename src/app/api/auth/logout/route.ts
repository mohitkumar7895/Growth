import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getCurrentAdmin, logActivity } from "@/lib/auth";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (admin) {
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "LOGOUT",
      module: "auth",
      details: "Signed out of admin dashboard",
      ipAddress: getClientIp(req),
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
