import nodemailer from "nodemailer";

export const ENQUIRY_RECIPIENTS = [
  "growthrealtechnoida@gmail.com",
  "care@growthrealtech.in",
];

function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createTransporter() {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || "").trim();
  const rawPass = (process.env.SMTP_PASS || "").trim();
  // Gmail App Passwords are often copied with spaces (e.g. "abcd efgh ijkl mnop")
  const pass = host.includes("gmail.com") ? rawPass.replace(/\s+/g, "") : rawPass;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEnquiryNotificationEmail(params: {
  subject: string;
  heading: string;
  fields: Record<string, string | null | undefined>;
  extraRecipients?: string[];
}): Promise<{ sent: boolean; recipients: string[]; error?: string }> {
  const recipients = Array.from(
    new Set(
      [...ENQUIRY_RECIPIENTS, ...(params.extraRecipients || [])]
        .map((e) => (e || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, recipients, error: "SMTP credentials not configured" };
  }

  const rowsHtml = Object.entries(params.fields)
    .filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#0C3323;background:#F6F7F2;width:36%;">${escapeHtml(
          k
        )}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1C2921;">${escapeHtml(
          v
        )}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #C6A66C;border-radius:12px;overflow:hidden;">
      <div style="background:#0C3323;color:#ffffff;padding:20px 24px;">
        <h2 style="margin:0;color:#E0C796;">Growth Realtech — ${escapeHtml(params.heading)}</h2>
        <p style="margin:6px 0 0;font-size:12px;color:#ffffffcc;">Direct Lead Notification • +91 82875 69844 • Forwarded to ${escapeHtml(
          recipients.join(" & ")
        )}</p>
      </div>
      <div style="padding:20px 24px;background:#ffffff;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">${rowsHtml}</table>
        <p style="margin-top:18px;font-size:12px;color:#555;">
          Manage this lead or download Excel reports inside your Growth Realtech Admin CRM Dashboard.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Growth Realtech Website" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject: params.subject,
      html,
    });
    return { sent: true, recipients };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Mailer] Email dispatch failed (non-blocking):", errMsg);
    return { sent: false, recipients, error: errMsg };
  }
}

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  name?: string;
}): Promise<{ delivered: boolean; error?: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return { delivered: false, error: "SMTP credentials not configured" };
  }

  const greetingName = params.name?.trim() ? `Hello ${escapeHtml(params.name.trim())},` : "Hello,";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #C6A66C;border-radius:14px;overflow:hidden;">
      <div style="background:#0C3323;color:#ffffff;padding:22px 26px;">
        <h2 style="margin:0;color:#E0C796;letter-spacing:0.06em;">GROWTH REALTECH</h2>
        <p style="margin:5px 0 0;font-size:11px;letter-spacing:0.14em;color:#ffffffcc;">TRUST • TRANSPARENCY • SAFE INVESTMENT</p>
      </div>
      <div style="padding:26px;background:#ffffff;color:#1C2921;">
        <p style="margin:0 0 12px;font-size:14px;">${greetingName}</p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
          Use the following 6-digit One-Time Password (OTP) to verify your email address for your Growth Realtech Customer Registration:
        </p>
        <div style="margin:20px 0;padding:18px;text-align:center;border-radius:10px;background:#F6F7F2;border:1px dashed #164B34;">
          <span style="font-size:32px;font-weight:700;letter-spacing:0.32em;color:#0C3323;">${escapeHtml(
            params.otp
          )}</span>
        </div>
        <p style="margin:0 0 8px;font-size:12px;color:#555;">
          This verification code is valid for <strong>5 minutes</strong>. Please do not share this OTP with anyone.
        </p>
        <p style="margin:18px 0 0;font-size:11px;color:#777;border-top:1px solid #eee;padding-top:12px;">
          Growth Realtech Advisory Desk • Noida, Uttar Pradesh • +91 82875 69844 • care@growthrealtech.in
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Growth Realtech" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: `${params.otp} is your Growth Realtech Registration Verification OTP`,
      html,
    });
    return { delivered: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Mailer] OTP Email dispatch failed:", errMsg);
    return { delivered: false, error: errMsg };
  }
}

export async function sendCustomerThankYouEmail(params: {
  to: string;
  name: string;
  registrationId?: number;
  phone: string;
  requirement: string;
  propertyType: string;
  preferredLocation: string;
  budget: string;
  registrationDate: string;
  registrationTime: string;
  advisoryPhone?: string;
  whatsappUrl?: string;
}): Promise<{ delivered: boolean; error?: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return { delivered: false, error: "SMTP credentials not configured" };
  }

  const refCode = params.registrationId ? `GR-${String(params.registrationId).padStart(4, "0")}` : "Confirmed";
  const advisoryPhone = params.advisoryPhone || "+91 82875 69844";

  const summaryRows = [
    ["Registration Ref.", refCode],
    ["Full Name", params.name],
    ["Verified Email", `${params.to} ✓`],
    ["Mobile Number", params.phone],
    ["Interested In", params.requirement],
    ["Property Type", params.propertyType],
    ["Preferred Location", params.preferredLocation],
    ["Approximate Budget", params.budget],
    ["Registered On", `${params.registrationDate} at ${params.registrationTime}`],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#0C3323;background:#F6F7F2;width:40%;">${escapeHtml(
          k
        )}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1C2921;">${escapeHtml(
          v
        )}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #C6A66C;border-radius:14px;overflow:hidden;background:#ffffff;">
      <div style="background:#0C3323;color:#ffffff;padding:24px 26px;text-align:center;">
        <h2 style="margin:0;color:#E0C796;letter-spacing:0.08em;font-size:20px;">GROWTH REALTECH</h2>
        <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.16em;color:#ffffffcc;">TRUST • TRANSPARENCY • SAFE INVESTMENT</p>
      </div>
      <div style="padding:26px;color:#1C2921;">
        <div style="display:inline-block;padding:5px 12px;border-radius:999px;background:#edf7ef;color:#164B34;font-size:11px;font-weight:700;letter-spacing:0.05em;">
          ✓ EMAIL VERIFIED &amp; REGISTRATION RECEIVED
        </div>
        <h3 style="margin:14px 0 10px;color:#0C3323;font-size:20px;">
          Thank You for Submitting Your Form, ${escapeHtml(params.name)}!
        </h3>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#374151;">
          We have received your OTP-verified customer registration with <strong>Growth Realtech</strong>. Our Noida property advisory specialist will review your requirements and connect with you shortly with a curated shortlist tailored to your preferences.
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:13px;margin:18px 0;">
          ${summaryRows}
        </table>

        ${
          params.whatsappUrl
            ? `<div style="margin:22px 0;text-align:center;">
                 <a href="${escapeHtml(
                   params.whatsappUrl
                 )}" style="display:inline-block;background:#164B34;color:#E0C796;text-decoration:none;font-weight:700;font-size:13px;padding:12px 22px;border-radius:8px;">
                   Connect With Our Advisory Desk on WhatsApp
                 </a>
               </div>`
            : ""
        }

        <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#555;">
          Need immediate assistance? Call us directly on <strong>${escapeHtml(
            advisoryPhone
          )}</strong> or reply to <a href="mailto:care@growthrealtech.in" style="color:#164B34;font-weight:600;">care@growthrealtech.in</a>.
        </p>
      </div>
      <div style="background:#F6F7F2;border-top:1px solid #e5e7eb;padding:14px 24px;text-align:center;font-size:11px;color:#69776e;">
        Growth Realtech · Noida, Greater Noida &amp; Yamuna Expressway · ${escapeHtml(advisoryPhone)}
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Growth Realtech" <${process.env.SMTP_USER}>`,
      to: params.to,
      replyTo: "care@growthrealtech.in",
      subject: `Thank You for Registering with Growth Realtech (${refCode})`,
      html,
    });
    return { delivered: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Mailer] Customer Thank-You email failed (non-blocking):", errMsg);
    return { delivered: false, error: errMsg };
  }
}
