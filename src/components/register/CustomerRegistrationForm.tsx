"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, MessageCircle, ArrowUpRight, Loader2 } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", label: "+91 India" },
  { code: "+65", label: "+65 Singapore" },
  { code: "+971", label: "+971 UAE" },
  { code: "+1", label: "+1 USA" },
];

const REQUIREMENTS = [
  "Buy a property",
  "Investment",
  "Sell / Resale",
  "Rent / Lease",
  "Commercial space",
];

const PROPERTY_TYPE_OPTIONS = [
  "Residential",
  "Commercial",
  "Industrial / Warehouse",
  "Plots / Land",
  "Pre-rented property",
  "Not sure yet",
];

const LOCATION_OPTIONS = [
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Yamuna Expressway",
  "Other Delhi NCR",
  "Other",
];

const BUDGET_OPTIONS = [
  "Below ₹50 lakh",
  "₹50 lakh – ₹1 crore",
  "₹1 – ₹2 crore",
  "₹2 – ₹5 crore",
  "Above ₹5 crore",
  "To be discussed",
];

export default function CustomerRegistrationForm({
  phone = "+91 82875 69844",
  primaryEmail = "growthrealtechnoida@gmail.com",
  careEmail = "care@growthrealtech.in",
  logoUrl = "/images/growth-realtech-logo.png",
}: {
  phone?: string;
  primaryEmail?: string;
  careEmail?: string;
  logoUrl?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    requirement: "",
    type: "",
    location: "",
    budget: "",
    address: "",
    details: "",
    consent: false,
  });

  const [otp, setOtp] = useState("");
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const [status, setStatus] = useState<{
    text: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const currentFullPhone = () =>
    `${form.countryCode}${form.mobile.replace(/\D/g, "")}`;

  const handleMobileChange = (mobile: string) => {
    setForm((prev) => ({ ...prev, mobile }));
    if (verified && `${form.countryCode}${mobile.replace(/\D/g, "")}` !== verifiedPhone) {
      setVerified(false);
      setVerificationToken("");
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setForm((prev) => ({ ...prev, countryCode }));
    if (verified && `${countryCode}${form.mobile.replace(/\D/g, "")}` !== verifiedPhone) {
      setVerified(false);
      setVerificationToken("");
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleSendOtp = async () => {
    const digits = form.mobile.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setStatus({ text: "Please enter a valid mobile number.", type: "error" });
      return;
    }
    setSendingOtp(true);
    setStatus(null);
    try {
      const res = await fetch("/api/public/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: currentFullPhone() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ text: data.error || "Unable to send OTP.", type: "error" });
      } else {
        setOtpSent(true);
        setDemoOtpCode(data.demoOtp || null);
        setStatus({
          text: data.message || "OTP sent. Please check your phone.",
          type: "success",
        });
        setTimeout(() => otpInputRef.current?.focus(), 60);
      }
    } catch {
      setStatus({ text: "Network error while sending OTP.", type: "error" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setStatus({ text: "Enter the 6-digit OTP.", type: "error" });
      return;
    }
    setVerifyingOtp(true);
    setStatus(null);
    try {
      const res = await fetch("/api/public/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: currentFullPhone(), otp: cleanOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ text: data.error || "Invalid OTP.", type: "error" });
      } else {
        setVerified(true);
        setDemoOtpCode(null);
        setVerifiedPhone(currentFullPhone());
        setVerificationToken(data.verificationToken);
        setStatus({
          text: data.message || "Your mobile number has been successfully verified.",
          type: "success",
        });
      }
    } catch {
      setStatus({ text: "Network error while verifying OTP.", type: "error" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setStatus({ text: "Please enter your full name.", type: "error" });
      return;
    }
    if (!verified || verifiedPhone !== currentFullPhone() || !verificationToken) {
      setStatus({
        text: "Please verify your current mobile number using OTP before completing registration.",
        type: "error",
      });
      return;
    }
    if (!form.requirement || !form.type || !form.location || !form.budget) {
      setStatus({
        text: "Please complete all required property requirement selections.",
        type: "error",
      });
      return;
    }
    if (!form.consent) {
      setStatus({ text: "Please provide consent to continue.", type: "error" });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/public/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: verifiedPhone,
          verificationToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          text: data.error || "Unable to complete registration.",
          type: "error",
        });
      } else {
        setCompleted(true);
        setWhatsappUrl(data.whatsappUrl || null);
        setStatus({
          text:
            data.message ||
            "Registration completed successfully. Thank you for choosing Growth Realtech.",
          type: "success",
        });
        // Auto-open WhatsApp confirmation on user click option & reset form
        setForm({
          name: "",
          email: "",
          countryCode: "+91",
          mobile: "",
          requirement: "",
          type: "",
          location: "",
          budget: "",
          address: "",
          details: "",
          consent: false,
        });
        setVerified(false);
        setOtpSent(false);
        setOtp("");
        setVerificationToken("");
      }
    } catch {
      setStatus({ text: "Network error while completing registration.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const step2Active = verified || completed;
  const step3Active = completed;

  return (
    <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[24px] border border-[#dfe7df] bg-white shadow-[0_24px_70px_rgba(23,60,41,0.13)]">
      {/* Header matching exact Growth Realtech OTP Registration design */}
      <div className="flex items-center justify-between gap-4 bg-[#123528] px-5 py-6 text-white sm:px-8 sm:py-7">
        <div className="flex items-center gap-3.5">
          {logoUrl ? (
            <div className="rounded-xl bg-white/98 px-2.5 py-1.5 shadow-md ring-1 ring-[#C6A66C]/45">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Growth Realtech"
                className="h-11 w-auto object-contain sm:h-12"
              />
            </div>
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-[14px] border border-white/35 font-serif text-2xl text-[#d7e7c2]">
              G
            </div>
          )}
          <div>
            <b className="block text-[15px] tracking-[0.13em] text-white sm:text-[17px]">
              GROWTH REALTECH
            </b>
            <small className="mt-0.5 block text-[10px] tracking-[0.12em] text-[#c6d7ca]">
              TRUST · TRANSPARENCY · SAFE INVESTMENT
            </small>
          </div>
        </div>
        <div className="hidden text-right text-[11px] uppercase leading-snug tracking-[0.12em] text-[#d7e7c2] sm:block">
          Customer
          <br />
          Registration
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-8 sm:pb-9">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#286044]">
          Let’s get started
        </div>
        <h1 className="mt-1.5 font-sans text-2xl font-bold tracking-[-0.03em] text-[#123528] sm:text-[30px]">
          Create your customer profile
        </h1>
        <p className="mt-1.5 text-sm text-[#69776e]">
          Register your details to receive relevant residential, commercial and investment property opportunities.
        </p>

        {/* 3-Step Progress Bars */}
        <div className="my-6 flex gap-2">
          <span className="h-[5px] flex-1 rounded-full bg-[#286044]" />
          <span
            className={`h-[5px] flex-1 rounded-full transition-colors ${
              step2Active ? "bg-[#286044]" : "bg-[#e8eee8]"
            }`}
          />
          <span
            className={`h-[5px] flex-1 rounded-full transition-colors ${
              step3Active ? "bg-[#286044]" : "bg-[#e8eee8]"
            }`}
          />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 01: Personal Information */}
          <div className="mb-3.5 mt-4 border-b border-[#dfe7df] pb-2 text-[13px] font-extrabold text-[#123528]">
            01 &nbsp; Personal information
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-name"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Full name *
              </label>
              <input
                id="reg-name"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c] focus:ring-2 focus:ring-[#397b54]/15"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Email address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c] focus:ring-2 focus:ring-[#397b54]/15"
              />
            </div>

            {/* Mobile + OTP Inline Verification */}
            <div className="sm:col-span-2">
              <label
                htmlFor="reg-mobile"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Mobile number *
              </label>
              <div className="grid grid-cols-[112px_1fr] gap-2">
                <select
                  aria-label="Country code"
                  value={form.countryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-2.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  id="reg-mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  maxLength={15}
                  value={form.mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="Mobile number"
                  className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c] focus:ring-2 focus:ring-[#397b54]/15"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#69776e]">
                A one-time password (OTP) will be sent to verify your mobile number.
              </p>

              {/* Inline OTP Row */}
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="reg-otp"
                    className="mb-1.5 block text-[11px] font-bold text-[#536258]"
                  >
                    Enter OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    id="reg-otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit OTP"
                    disabled={!otpSent || verified}
                    className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm font-bold tracking-[0.28em] text-[#1d2b23] outline-none focus:border-[#5a916c] disabled:bg-[#f0f3ef] disabled:text-[#758078]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || verified}
                  className="inline-flex min-h-[46px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#dce7dc] bg-[#edf3ed] px-4 py-3 text-[13px] font-bold text-[#123528] transition hover:bg-[#dce9dc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {otpSent && !verified ? "Resend OTP" : "Send OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!otpSent || verifyingOtp || verified}
                  className="inline-flex min-h-[46px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#dce7dc] bg-[#123528] px-5 py-3 text-[13px] font-bold text-white transition hover:bg-[#286044] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Verify
                </button>
              </div>

              {demoOtpCode && !verified && (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-[#286044]/40 bg-[#edf7ef] px-3 py-2 text-xs text-[#123528]">
                  <span>
                    Verification OTP: <strong className="tracking-widest">{demoOtpCode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtpCode)}
                    className="rounded-md bg-[#123528] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#286044]"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              {verified && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#277044]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mobile number verified ({verifiedPhone})</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 02: Property Requirement */}
          <div className="mb-3.5 mt-7 border-b border-[#dfe7df] pb-2 text-[13px] font-extrabold text-[#123528]">
            02 &nbsp; Property requirement
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-requirement"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                I am interested in *
              </label>
              <select
                id="reg-requirement"
                required
                value={form.requirement}
                onChange={(e) => setForm({ ...form, requirement: e.target.value })}
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
              >
                <option value="">Select requirement</option>
                {REQUIREMENTS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-type"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Property type *
              </label>
              <select
                id="reg-type"
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
              >
                <option value="">Select property type</option>
                {PROPERTY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-location"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Preferred location *
              </label>
              <select
                id="reg-location"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
              >
                <option value="">Select location</option>
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-budget"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Approximate budget *
              </label>
              <select
                id="reg-budget"
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
              >
                <option value="">Select budget</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reg-address"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Address / City
              </label>
              <input
                id="reg-address"
                name="address"
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your city or address"
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reg-details"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Additional requirement
              </label>
              <textarea
                id="reg-details"
                rows={3}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Preferred project, configuration, size, timeline or any other details"
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-sm text-[#1d2b23] outline-none focus:border-[#5a916c]"
              />
            </div>
          </div>

          {/* Consent */}
          <label className="my-5 flex cursor-pointer items-start gap-2.5 text-xs text-[#69776e]">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#123528]"
            />
            <span>
              I agree that Growth Realtech may contact me by phone, SMS, WhatsApp or email regarding my property enquiry. I have read and understood the{" "}
              <Link href="/privacy-policy" className="font-semibold text-[#123528] underline">
                privacy notice
              </Link>
              .
            </span>
          </label>

          {/* Status Message & Direct WhatsApp Forwarding CTA */}
          {status && (
            <div
              role="status"
              aria-live="polite"
              className={`my-4 rounded-[10px] px-3.5 py-3 text-xs font-medium ${
                status.type === "success"
                  ? "bg-[#edf7ef] text-[#27623a]"
                  : status.type === "error"
                  ? "bg-[#fff0ee] text-[#9b3d32]"
                  : "bg-[#eef4fa] text-[#315674]"
              }`}
            >
              <p>{status.text}</p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Registration Details on WhatsApp ({phone})
                </a>
              )}
            </div>
          )}

          {/* Actions Row */}
          <div className="mt-5 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#69776e]">
              <Lock className="h-3.5 w-3.5 text-[#286044]" />
              Your details are used to respond to your enquiry.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-[11px] bg-[#c7a56a] px-5 py-3 text-[13px] font-bold text-[#17271f] shadow-md transition hover:bg-[#d8b87d] disabled:opacity-50 sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <span>Complete registration</span>
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Strip */}
      <div className="flex flex-col justify-between gap-1 border-t border-[#dfe7df] bg-[#f7f9f6] px-5 py-4 text-[11px] text-[#69776e] sm:flex-row sm:px-8">
        <span>Growth Realtech · Noida, India</span>
        <span>
          {phone} · {careEmail} · {primaryEmail}
        </span>
      </div>
    </div>
  );
}
