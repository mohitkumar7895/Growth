import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { enquirySchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`enquiry:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Please check your form entries",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const result = await execute(
      `INSERT INTO enquiries
        (name, phone, email, enquiry_type, property_interest, project_id, property_id,
         preferred_location, budget_range, purpose, message, source_page, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      [
        d.name,
        d.phone,
        d.email || null,
        d.enquiry_type,
        d.property_interest || null,
        d.project_id || null,
        d.property_id || null,
        d.preferred_location || null,
        d.budget_range || null,
        d.purpose || null,
        d.message || null,
        d.source_page || null,
      ]
    );

    await execute(
      `INSERT INTO notifications (title, message, type, link_url)
       VALUES (?, ?, 'enquiry', '/admin/enquiries')`,
      [
        `New ${d.enquiry_type.replace("_", " ")} enquiry`,
        `${d.name} (${d.phone}) enquired about ${d.property_interest || d.preferred_location || "Growth Realtech advisory"}.`,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
        message: "Thank you. Your consultation request has been received by our Noida advisory desk.",
      },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err, "Unable to submit enquiry at this time");
  }
}
