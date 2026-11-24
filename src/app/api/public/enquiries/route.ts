import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { enquirySchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";
import { sendEnquiryNotificationEmail } from "@/lib/mailer";
import { getWebsiteSettings } from "@/services/siteData";

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

    const settings = await getWebsiteSettings();
    const extraEmails = [settings.contact_email, settings.contact_email_secondary].filter(Boolean);

    await sendEnquiryNotificationEmail({
      subject: `New ${d.enquiry_type.toUpperCase()} Enquiry: ${d.name} (${d.phone})`,
      heading: "New Client Enquiry",
      extraRecipients: extraEmails,
      fields: {
        "Client Name": d.name,
        "Phone Number": d.phone,
        Email: d.email || "Not provided",
        "Enquiry Type": d.enquiry_type,
        "Property / Project Interest": d.property_interest || "General Consultation",
        "Preferred Location": d.preferred_location || "Noida",
        "Budget Range": d.budget_range || "Open to Options",
        Purpose: d.purpose || "Not specified",
        Message: d.message || "—",
        "Source Page": d.source_page || "/",
      },
    });

    const whatsappNum = (settings.whatsapp_number || "918287569844").replace(/\D/g, "");
    const whatsappText = [
      `Hello Growth Realtech,`,
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      d.email ? `Email: ${d.email}` : null,
      d.property_interest ? `Interest: ${d.property_interest}` : null,
      d.preferred_location ? `Location: ${d.preferred_location}` : null,
      d.budget_range ? `Budget: ${d.budget_range}` : null,
      d.message ? `Notes: ${d.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
        whatsappUrl: `https://wa.me/${whatsappNum}?text=${encodeURIComponent(whatsappText)}`,
        message:
          "Thank you. Your enquiry has been directed to growthrealtechnoida@gmail.com, care@growthrealtech.in & our advisory desk (+91 82875 69844).",
      },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err, "Unable to submit enquiry at this time");
  }
}
