import nodemailer from "nodemailer";

export const ENQUIRY_RECIPIENTS = [
  "growthrealtechnoida@gmail.com",
  "care@growthrealtech.in",
];

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
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
}): Promise<{ sent: boolean; recipients: string[] }> {
  const recipients = Array.from(
    new Set([...ENQUIRY_RECIPIENTS, ...(params.extraRecipients || [])].filter(Boolean))
  );

  const transporter = createTransporter();
  if (!transporter) {
    // SMTP credentials not yet configured — DB record is already saved cleanly
    return { sent: false, recipients };
  }

  const rowsHtml = Object.entries(params.fields)
    .filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#0C3323;background:#F6F7F2;">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1C2921;">${String(
          v
        ).replace(/</g, "&lt;")}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #C6A66C;border-radius:12px;overflow:hidden;">
      <div style="background:#0C3323;color:#ffffff;padding:20px 24px;">
        <h2 style="margin:0;color:#E0C796;">Growth Realtech — ${params.heading}</h2>
        <p style="margin:6px 0 0;font-size:12px;color:#ffffffcc;">Direct Lead Notification • +91 82875 69844</p>
      </div>
      <div style="padding:20px 24px;background:#ffffff;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">${rowsHtml}</table>
        <p style="margin-top:18px;font-size:12px;color:#555;">
          Manage this lead inside your Growth Realtech Admin CRM Dashboard.
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
    console.error("[Mailer] Email dispatch failed (non-blocking):", err);
    return { sent: false, recipients };
  }
}
