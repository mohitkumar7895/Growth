import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, execute } from "@/lib/db";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";
import { sendEnquiryNotificationEmail } from "@/lib/mailer";
import { getWebsiteSettings } from "@/services/siteData";

const customerRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(150),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  countryCode: z.string().trim().min(2).max(10).default("+91"),
  mobile: z.string().trim().min(8, "Please enter a valid mobile number").max(20),
  phone: z.string().trim().min(10).max(30),
  verificationToken: z.string().trim().min(16, "Please verify your mobile number with OTP"),
  requirement: z.string().trim().min(2, "Please select your requirement").max(120),
  type: z.string().trim().min(2, "Please select property type").max(120),
  location: z.string().trim().min(2, "Please select preferred location").max(120),
  budget: z.string().trim().min(2, "Please select approximate budget").max(100),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, "Please provide consent to continue"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`customer-reg:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = customerRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please complete all required fields." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const cleanPhone = d.phone.replace(/[^\d+]/g, "");

    // Verify OTP proof token on server (expires within 30 minutes of verification)
    const otpRow = await queryOne<{ id: number }>(
      `SELECT id FROM otp_verifications
       WHERE phone = ? AND verification_token = ? AND is_verified = 1
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       LIMIT 1`,
      [cleanPhone, d.verificationToken]
    );

    if (!otpRow) {
      return NextResponse.json(
        { error: "Mobile OTP verification expired or invalid. Please verify your mobile number again." },
        { status: 400 }
      );
    }

    // 1. Save full customer profile in customer_registrations
    const regResult = await execute(
      `INSERT INTO customer_registrations
        (full_name, email, country_code, mobile, full_phone, mobile_verified, requirement,
         property_type, preferred_location, budget_range, address_city, additional_details, consent_given, status)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, 1, 'Verified')`,
      [
        d.name,
        d.email || null,
        d.countryCode,
        d.mobile,
        cleanPhone,
        d.requirement,
        d.type,
        d.location,
        d.budget,
        d.address || null,
        d.details || null,
      ]
    );

    // 2. Also log in unified enquiries CRM & notifications so Dashboard KPIs reflect it immediately
    await execute(
      `INSERT INTO enquiries
        (name, phone, email, enquiry_type, property_interest, preferred_location, budget_range, purpose, message, source_page, status)
       VALUES (?, ?, ?, 'consultation', ?, ?, ?, ?, ?, '/register', 'New')`,
      [
        d.name,
        cleanPhone,
        d.email || null,
        `${d.requirement} — ${d.type}`,
        d.location,
        d.budget,
        d.requirement,
        [d.address ? `Address/City: ${d.address}` : null, d.details ? `Notes: ${d.details}` : null, "OTP Verified Registration"]
          .filter(Boolean)
          .join(" | "),
      ]
    );

    await execute(
      `INSERT INTO notifications (title, message, type, link_url)
       VALUES (?, ?, 'enquiry', '/admin/customers')`,
      [
        "New OTP-Verified Customer Registration",
        `${d.name} (${cleanPhone}) registered for ${d.requirement} (${d.type}) in ${d.location} — ${d.budget}.`,
      ]
    );

    // Consume OTP token so it cannot be replayed
    await execute("UPDATE otp_verifications SET verification_token = NULL WHERE id = ?", [otpRow.id]);

    // 3. Forward email to growthrealtechnoida@gmail.com & care@growthrealtech.in
    const settings = await getWebsiteSettings();
    const extraEmails = [settings.contact_email, settings.contact_email_secondary].filter(Boolean);

    await sendEnquiryNotificationEmail({
      subject: `OTP-Verified Customer Registration: ${d.name} (${cleanPhone})`,
      heading: "New Customer Profile Registration",
      extraRecipients: extraEmails,
      fields: {
        "Full Name": d.name,
        "Verified Mobile": `${cleanPhone} ✓ (OTP Verified)`,
        Email: d.email || "Not provided",
        "Interested In": d.requirement,
        "Property Type": d.type,
        "Preferred Location": d.location,
        "Approximate Budget": d.budget,
        "Address / City": d.address || "—",
        "Additional Details": d.details || "—",
      },
    });

    // 4. Build pre-filled WhatsApp message for +91 82875 69844
    const waNum = (settings.whatsapp_number || "918287569844").replace(/\D/g, "");
    const waText = [
      "Hello Growth Realtech, I have completed my OTP-Verified Customer Registration:",
      `Name: ${d.name}`,
      `Verified Mobile: ${cleanPhone}`,
      d.email ? `Email: ${d.email}` : null,
      `Interested In: ${d.requirement}`,
      `Property Type: ${d.type}`,
      `Preferred Location: ${d.location}`,
      `Budget: ${d.budget}`,
      d.address ? `City/Address: ${d.address}` : null,
      d.details ? `Details: ${d.details}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json(
      {
        success: true,
        id: regResult.insertId,
        whatsappUrl: `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`,
        message:
          "Registration completed successfully! Your profile has been saved to Growth Realtech and shared with our Noida advisory desk.",
      },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err, "Unable to complete registration. Please try again.");
  }
}
