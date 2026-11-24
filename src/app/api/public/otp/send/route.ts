import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";

function hashOtp(phone: string, otp: string): string {
  const secret = process.env.JWT_SECRET || "growth-realtech-otp-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

async function dispatchSmsOtp(phone: string, otp: string): Promise<{ delivered: boolean; provider: string }> {
  // 1. Optional Fast2SMS integration (India)
  if (process.env.FAST2SMS_API_KEY) {
    const cleanIndian = phone.replace(/^\+91/, "").replace(/\D/g, "");
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: cleanIndian,
      }),
    });
    if (res.ok) return { delivered: true, provider: "fast2sms" };
  }

  // 2. Optional Twilio SMS integration (Global)
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");
    const params = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM,
      Body: `Your Growth Realtech verification OTP is ${otp}. Valid for 5 minutes. Do not share this code.`,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    if (res.ok) return { delivered: true, provider: "twilio" };
  }

  return { delivered: false, provider: "fallback" };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const rawPhone = String(body?.phone || "").trim();
    const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
    const digitsOnly = cleanPhone.replace(/\D/g, "");

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number with country code." },
        { status: 400 }
      );
    }

    // Strict rate limiting per IP and per phone number
    const ipLimit = checkRateLimit(`otp-ip:${ip}`, 10, 5 * 60_000);
    const phoneLimit = checkRateLimit(`otp-phone:${cleanPhone}`, 5, 5 * 60_000);
    if (!ipLimit.allowed || !phoneLimit.allowed) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait a few minutes before retrying." },
        { status: 429 }
      );
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = hashOtp(cleanPhone, otp);

    await execute(
      `INSERT INTO otp_verifications (phone, otp_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [cleanPhone, otpHash]
    );

    const sms = await dispatchSmsOtp(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      smsDelivered: sms.delivered,
      message: sms.delivered
        ? "OTP sent to your mobile number. Valid for 5 minutes."
        : `OTP generated (SMS gateway not configured yet). Use verification code: ${otp}`,
      ...(sms.delivered ? {} : { demoOtp: otp }),
    });
  } catch (err) {
    return apiError(err, "Unable to send OTP right now. Please try again.");
  }
}
