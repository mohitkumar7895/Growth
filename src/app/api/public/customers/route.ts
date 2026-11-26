import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, execute, ensureRegistrationSchema } from "@/lib/db";
import { checkRateLimit, getClientIp, apiError } from "@/lib/security";
import { sendEnquiryNotificationEmail } from "@/lib/mailer";
import { getWebsiteSettings } from "@/services/siteData";
import { reverseGeocodeCoordinates } from "@/lib/geocode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const customerRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(150),
  email: z.string().trim().email("Please enter a valid email address"),
  countryCode: z.string().trim().min(2).max(10).default("+91"),
  mobile: z.string().trim().min(8, "Please enter a valid mobile number").max(20),
  phone: z.string().trim().min(10).max(30),
  verificationToken: z.string().trim().min(16, "Please verify your email with OTP before registering"),
  requirement: z.string().trim().min(2, "Please select your requirement").max(120),
  type: z.string().trim().min(2, "Please select property type").max(120),
  location: z.string().trim().min(2, "Please select preferred location").max(120),
  budget: z.string().trim().min(2, "Please select approximate budget").max(100),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  locationAccuracy: z.number().min(0).max(1_000_000).nullable().optional(),
  geoAddress: z.string().trim().max(500).nullable().optional(),
  consent: z.boolean().refine((v) => v === true, "Please provide consent to continue"),
});

function getIstDateAndTime(now = new Date()): { date: string; time: string; display: string } {
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const date = dateFmt.format(now);
  const time = timeFmt.format(now);
  return { date, time, display: `${date} ${time} IST` };
}

export async function POST(req: NextRequest) {
  try {
    await ensureRegistrationSchema();

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
    const cleanEmail = d.email.trim().toLowerCase();

    // Verify Email OTP proof token on server (expires within 30 minutes of verification)
    const otpRow = await queryOne<{ id: number }>(
      `SELECT id FROM otp_verifications
       WHERE channel = 'email' AND email = ? AND verification_token = ? AND is_verified = 1
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       LIMIT 1`,
      [cleanEmail, d.verificationToken]
    );

    if (!otpRow) {
      return NextResponse.json(
        { error: "Email OTP verification expired or invalid. Please verify your email address again." },
        { status: 400 }
      );
    }

    const { date: regDate, time: regTime, display: regDisplay } = getIstDateAndTime();
    const lat =
      typeof d.latitude === "number" && Number.isFinite(d.latitude)
        ? Number(d.latitude.toFixed(7))
        : null;
    const lng =
      typeof d.longitude === "number" && Number.isFinite(d.longitude)
        ? Number(d.longitude.toFixed(7))
        : null;
    const acc =
      typeof d.locationAccuracy === "number" && Number.isFinite(d.locationAccuracy)
        ? Math.round(d.locationAccuracy)
        : null;
    const coordinatesLabel =
      lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : null;
    const mapsUrl =
      lat !== null && lng !== null ? `https://www.google.com/maps?q=${lat},${lng}` : null;

    let geoAddress = d.geoAddress?.trim() || null;
    if (!geoAddress && lat !== null && lng !== null) {
      geoAddress = await reverseGeocodeCoordinates(lat, lng);
    }

    // 1. Save full customer profile with Date, Time, GPS Coordinates & Resolved Address in customer_registrations
    const regResult = await execute(
      `INSERT INTO customer_registrations
        (full_name, email, email_verified, country_code, mobile, full_phone, mobile_verified,
         verification_method, requirement, property_type, preferred_location, budget_range,
         address_city, additional_details, registration_date, registration_time,
         latitude, longitude, location_accuracy, coordinates_label, geo_address, ip_address, consent_given, status)
       VALUES (?, ?, 1, ?, ?, ?, 0, 'email', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Verified')`,
      [
        d.name,
        cleanEmail,
        d.countryCode,
        d.mobile,
        cleanPhone,
        d.requirement,
        d.type,
        d.location,
        d.budget,
        d.address || null,
        d.details || null,
        regDate,
        regTime,
        lat,
        lng,
        acc,
        coordinatesLabel,
        geoAddress,
        ip,
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
        cleanEmail,
        `${d.requirement} — ${d.type}`,
        d.location,
        d.budget,
        d.requirement,
        [
          d.address ? `Address/City: ${d.address}` : null,
          d.details ? `Notes: ${d.details}` : null,
          "Email OTP Verified Registration",
          `Recorded: ${regDisplay}`,
          coordinatesLabel ? `GPS: ${coordinatesLabel}` : null,
          geoAddress ? `GPS Address: ${geoAddress}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      ]
    );

    await execute(
      `INSERT INTO notifications (title, message, type, link_url)
       VALUES (?, ?, 'enquiry', '/admin/customers')`,
      [
        "New Email OTP-Verified Registration",
        `${d.name} (${cleanPhone}, ${cleanEmail}) registered on ${regDisplay}${
          geoAddress ? ` at ${geoAddress}` : coordinatesLabel ? ` [GPS: ${coordinatesLabel}]` : ""
        } for ${d.requirement} (${d.type}) in ${d.location}.`,
      ]
    );

    // Consume OTP token so it cannot be replayed
    await execute("UPDATE otp_verifications SET verification_token = NULL WHERE id = ?", [otpRow.id]);

    // 3. Forward email to BOTH growthrealtechnoida@gmail.com & care@growthrealtech.in
    const settings = await getWebsiteSettings();
    const extraEmails = [settings.contact_email, settings.contact_email_secondary].filter(Boolean);

    await sendEnquiryNotificationEmail({
      subject: `Email OTP-Verified Customer Registration: ${d.name} (${cleanPhone})`,
      heading: "New Customer Profile Registration",
      extraRecipients: extraEmails,
      fields: {
        "Full Name": d.name,
        "Email Address": `${cleanEmail} ✓ (Email OTP Verified)`,
        "Mobile Number": cleanPhone,
        "Registration Date (IST)": regDate,
        "Registration Time (IST)": `${regTime} IST`,
        "GPS Co-ordinates": coordinatesLabel
          ? `${coordinatesLabel}${acc ? ` (±${acc}m)` : ""}`
          : "Location permission not granted",
        "GPS Detected Address": geoAddress || "—",
        "Google Maps Link": mapsUrl || "—",
        "IP Address": ip,
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
      "Hello Growth Realtech, I have completed my Email OTP-Verified Customer Registration:",
      `Name: ${d.name}`,
      `Verified Email: ${cleanEmail}`,
      `Mobile: ${cleanPhone}`,
      `Interested In: ${d.requirement}`,
      `Property Type: ${d.type}`,
      `Preferred Location: ${d.location}`,
      `Budget: ${d.budget}`,
      `Date & Time: ${regDisplay}`,
      coordinatesLabel ? `GPS Co-ordinates: ${coordinatesLabel}` : null,
      geoAddress ? `GPS Location: ${geoAddress}` : null,
      d.address ? `City/Address: ${d.address}` : null,
      d.details ? `Details: ${d.details}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json(
      {
        success: true,
        id: regResult.insertId,
        registrationRecord: {
          date: regDate,
          time: `${regTime} IST`,
          coordinates: coordinatesLabel,
          geoAddress,
          mapsUrl,
        },
        whatsappUrl: `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`,
        message:
          "Registration completed successfully! Your Email OTP-verified profile (with date, time & location record) has been saved and shared with Growth Realtech.",
      },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err, "Unable to complete registration. Please try again.");
  }
}
