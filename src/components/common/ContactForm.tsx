"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Send, MessageCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    location: "Noida",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Please check all fields and try again.");
      } else {
        setSuccess(data.message || "Your message has been sent.");
        setWhatsappUrl(data.whatsappUrl || null);
        setForm({
          name: "",
          phone: "",
          email: "",
          subject: "",
          location: "Noida",
          message: "",
        });
      }
    } catch {
      setError("Network error while sending message.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-[#164B34]/20 bg-[#F6F7F2] p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#164B34]" />
        <h3 className="mt-4 font-editorial text-2xl font-semibold text-[#0C3323]">
          Message Received
        </h3>
        <p className="mt-2 text-sm text-[#1C2921]/75">{success}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Also Send on WhatsApp (+91 82875 69844)
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setWhatsappUrl(null);
            }}
            className="rounded-lg bg-[#0C3323] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E0C796]"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-4 py-3 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98XXX XXXXX"
            className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-4 py-3 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-4 py-3 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
            Subject
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g., Commercial Leasing / Resale / General Query"
            className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-4 py-3 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
          Message *
        </label>
        <textarea
          rows={5}
          required
          minLength={10}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="How can Growth Realtech assist you?"
          className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-4 py-3 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--gr-primary)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[var(--gr-deep)] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 text-[#E0C796]" /> Send Contact Message
          </>
        )}
      </button>
    </form>
  );
}
