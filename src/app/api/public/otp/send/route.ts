import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { execute, ensureRegistrationSchema } from "@/lib/db";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";
import { sendOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashEmailOtp(email: string, otp: string): string {
  const secret = process.env.JWT_SECRET || "growth-realtech-otp-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`email:${email}:${otp}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    await ensureRegistrationSchema();

    const ip = getClientIp(req);
    const body = await req.json();
    const cleanEmail = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address to receive the OTP." },
        { status: 400 }
      );
    }

    const ipLimit = checkRateLimit(`otp-ip:${ip}`, 12, 5 * 60_000);
    const emailLimit = checkRateLimit(`otp-email:${cleanEmail}`, 6, 5 * 60_000);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait a few minutes before retrying." },
        { status: 429 }
      );
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = hashEmailOtp(cleanEmail, otp);

    const emailResult = await sendOtpEmail({ to: cleanEmail, otp, name });

    if (!emailResult.delivered) {
      return NextResponse.json(
        {
          error:
            "Unable to send OTP email right now. Please check the email address or try again in a moment.",
        },
        { status: 502 }
      );
    }

    await execute(
      `INSERT INTO otp_verifications (channel, email, phone, otp_hash, expires_at)
       VALUES ('email', ?, NULL, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [cleanEmail, otpHash]
    );

    return NextResponse.json({
      success: true,
      channel: "email",
      delivered: true,
      message: `6-digit OTP has been sent to ${cleanEmail}. Please check your email inbox (or spam folder) and enter the code below to verify.`,
    });
  } catch (err) {
    return apiError(err, "Unable to send Email OTP right now. Please try again.");
  }
}
