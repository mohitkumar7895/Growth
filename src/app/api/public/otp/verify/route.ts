import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";

function hashOtp(phone: string, otp: string): string {
  const secret = process.env.JWT_SECRET || "growth-realtech-otp-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`otp-verify:${ip}`, 20, 5 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const cleanPhone = String(body?.phone || "").trim().replace(/[^\d+]/g, "");
    const otp = String(body?.otp || "").trim();

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit OTP." },
        { status: 400 }
      );
    }

    const record = await queryOne<{
      id: number;
      otp_hash: string;
      attempts: number;
      is_verified: number;
    }>(
      `SELECT id, otp_hash, attempts, is_verified
       FROM otp_verifications
       WHERE phone = ? AND expires_at >= NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [cleanPhone]
    );

    if (!record) {
      return NextResponse.json(
        { error: "OTP has expired or was not requested. Please tap Send OTP again." },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum OTP attempts exceeded. Please request a new OTP." },
        { status: 400 }
      );
    }

    const expectedHash = hashOtp(cleanPhone, otp);
    const a = Buffer.from(record.otp_hash, "hex");
    const b = Buffer.from(expectedHash, "hex");
    const matches = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!matches) {
      await execute(
        "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
        [record.id]
      );
      return NextResponse.json(
        { error: "Incorrect OTP. Please double-check and try again." },
        { status: 400 }
      );
    }

    const verificationToken = crypto.randomBytes(24).toString("hex");
    await execute(
      "UPDATE otp_verifications SET is_verified = 1, verification_token = ? WHERE id = ?",
      [verificationToken, record.id]
    );

    return NextResponse.json({
      success: true,
      verificationToken,
      message: "Your mobile number has been successfully verified.",
    });
  } catch (err) {
    return apiError(err, "Failed to verify OTP.");
  }
}
