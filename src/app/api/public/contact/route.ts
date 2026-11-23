import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { contactSubmissionSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`contact:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Please complete all required fields",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const result = await execute(
      `INSERT INTO contact_submissions (name, phone, email, subject, location, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'New')`,
      [d.name, d.phone, d.email || null, d.subject || "General Advisory Inquiry", d.location || null, d.message]
    );

    await execute(
      `INSERT INTO notifications (title, message, type, link_url)
       VALUES (?, ?, 'contact', '/admin/contacts')`,
      [
        "New Contact Form Message",
        `${d.name} (${d.phone}) sent a message regarding "${d.subject || "General Advisory"}".`,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
        message: "Thank you for contacting Growth Realtech. Our team will respond shortly.",
      },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err, "Unable to submit contact request");
  }
}
