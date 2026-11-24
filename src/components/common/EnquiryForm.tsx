"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Send, MessageCircle } from "lucide-react";
import { BUDGET_RANGES, LOCATIONS, PURPOSES } from "@/types";

interface EnquiryFormProps {
  defaultEnquiryType?: "property" | "project" | "consultation" | "investment" | "site_visit" | "general";
  defaultInterest?: string;
  projectId?: number;
  propertyId?: number;
  defaultLocation?: string;
  sourcePage?: string;
  compact?: boolean;
  dark?: boolean;
  onSuccess?: () => void;
}

export default function EnquiryForm({
  defaultEnquiryType = "consultation",
  defaultInterest = "",
  projectId,
  propertyId,
  defaultLocation = "Noida",
  sourcePage = "/",
  compact = false,
  dark = false,
  onSuccess,
}: EnquiryFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    enquiry_type: defaultEnquiryType,
    property_interest: defaultInterest,
    preferred_location: defaultLocation,
    budget_range: "Open to Options",
    purpose: "End Use",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          project_id: projectId,
          property_id: propertyId,
          source_page: sourcePage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Please verify your details and try again.");
      } else {
        setSuccessMsg(
          data.message ||
            "Thank you! Our Growth Realtech advisory team will contact you shortly."
        );
        setWhatsappUrl(data.whatsappUrl || null);
        setForm({
          name: "",
          phone: "",
          email: "",
          enquiry_type: defaultEnquiryType,
          property_interest: defaultInterest,
          preferred_location: defaultLocation,
          budget_range: "Open to Options",
          purpose: "End Use",
          message: "",
        });
        onSuccess?.();
      }
    } catch {
      setError("Network error. Please call us directly or try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div
        className={`rounded-2xl border p-8 text-center ${
          dark
            ? "border-[#C6A66C]/40 bg-white/5 text-white"
            : "border-[#164B34]/20 bg-[#F6F7F2] text-[#1C2921]"
        }`}
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#C6A66C]" />
        <h3 className="mt-4 font-editorial text-2xl font-semibold">
          Consultation Request Received
        </h3>
        <p className={`mt-2 text-sm ${dark ? "text-white/80" : "text-[#1C2921]/75"}`}>
          {successMsg}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:brightness-105"
            >
              <MessageCircle className="h-4 w-4" />
              Also Send on WhatsApp (+91 82875 69844)
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setSuccessMsg(null);
              setWhatsappUrl(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#C6A66C] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#C6A66C] transition hover:bg-[#C6A66C] hover:text-[#0C3323]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  const inputCls = dark
    ? "w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-[#C6A66C] focus:outline-none"
    : "w-full rounded-lg border border-[#164B34]/20 bg-white px-4 py-3 text-sm text-[#1C2921] placeholder:text-[#1C2921]/45 focus:border-[#164B34] focus:outline-none";

  const labelCls = dark
    ? "mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#E0C796]"
    : "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
        <div>
          <label className={labelCls}>Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phone Number *</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98XXX XXXXX"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Preferred Location</label>
          <select
            value={form.preferred_location}
            onChange={(e) => setForm({ ...form, preferred_location: e.target.value })}
            className={inputCls}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="text-[#1C2921]">
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Budget Range</label>
            <select
              value={form.budget_range}
              onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
              className={inputCls}
            >
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b} className="text-[#1C2921]">
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Primary Purpose</label>
            <select
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className={inputCls}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p} className="text-[#1C2921]">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Property / Project Interest</label>
        <input
          type="text"
          value={form.property_interest}
          onChange={(e) => setForm({ ...form, property_interest: e.target.value })}
          placeholder="e.g., Orion One32, 3 BHK Noida Expressway, Industrial Plot"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Requirement Notes</label>
        <textarea
          rows={compact ? 3 : 4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Share preferred configuration, timeline, or site visit availability..."
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--gr-gold)] px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-[var(--gr-deep)] shadow-lg transition hover:bg-[var(--gr-light-gold)] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting Request...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {defaultEnquiryType === "site_visit"
              ? "Request Guided Site Visit"
              : "Book Private Consultation"}
          </>
        )}
      </button>
      <p className={`text-[11px] leading-relaxed ${dark ? "text-white/55" : "text-[#1C2921]/55"}`}>
        Your details are handled confidentially solely for real estate consultation. No spam.
      </p>
    </form>
  );
}
