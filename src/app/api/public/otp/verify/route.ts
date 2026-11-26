import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute, ensureRegistrationSchema } from "@/lib/db";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";

function hashEmailOtp(email: string, otp: string): string {
  const secret = process.env.JWT_SECRET || "growth-realtech-otp-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`email:${email}:${otp}`)
    .digest("hex");
}

function timingSafeHexEquals(aHex: string, bHex: string): boolean {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    await ensureRegistrationSchema();

    const ip = getClientIp(req);
    const limit = checkRateLimit(`otp-verify:${ip}`, 25, 5 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const cleanEmail = String(body?.email || "").trim().toLowerCase();
    const otp = String(body?.otp || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit Email OTP." },
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
       WHERE channel = 'email' AND email = ? AND expires_at >= NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [cleanEmail]
    );

    if (!record) {
      return NextResponse.json(
        { error: "OTP has expired or was not requested. Please click Send Email OTP again." },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum OTP attempts exceeded. Please request a new Email OTP." },
        { status: 400 }
      );
    }

    const expectedHash = hashEmailOtp(cleanEmail, otp);
    const matches = timingSafeHexEquals(record.otp_hash, expectedHash);

    if (!matches) {
      await execute(
        "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
        [record.id]
      );
      return NextResponse.json(
        { error: "Incorrect OTP. Please double-check your email and try again." },
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
      channel: "email",
      verificationToken,
      message: `Email address (${cleanEmail}) verified successfully.`,
    });
  } catch (err) {
    return apiError(err, "Failed to verify Email OTP.");
  }
}
