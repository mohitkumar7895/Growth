import React from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import type { WebsiteSettingsMap } from "@/types";
import { SectionHeader } from "@/components/animations/Reveal";
import EnquiryForm from "@/components/common/EnquiryForm";

export default function ContactSection({
  settings,
  badge,
  title,
  subtitle,
  description,
}: {
  settings: WebsiteSettingsMap;
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
}) {
  const phone = settings.contact_phone || "+91 82875 69844";
  const email = settings.contact_email || "growthrealtechnoida@gmail.com";
  const location = settings.contact_location || "Noida, Uttar Pradesh";
  const waNum = (settings.whatsapp_number || "918287569844").replace(/\D/g, "");
  const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent(
    settings.whatsapp_default_message ||
      "Hello Growth Realtech, I would like to discuss my real estate requirements."
  )}`;

  return (
    <section id="enquiry" className="bg-[var(--gr-cream)] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Info & Map */}
          <div className="lg:col-span-5">
            <SectionHeader
              badge={badge || "Private Consultation"}
              title={title}
              subtitle={subtitle}
              description={description}
            />

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4 rounded-xl border border-[#164B34]/12 bg-white p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                    Direct Advisory Line
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="mt-0.5 block font-editorial text-2xl font-semibold text-[#0C3323] hover:text-[#164B34]"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-[#164B34]/12 bg-white p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                    Email Correspondence
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-0.5 block break-all text-sm font-semibold text-[#0C3323] hover:text-[#164B34]"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-[#164B34]/12 bg-white p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                    Regional Presence
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0C3323]">
                    {location}
                  </p>
                  {settings.business_timings && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#1C2921]/65">
                      <Clock className="h-3.5 w-3.5 text-[#C6A66C]" />
                      {settings.business_timings}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Advisory
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0C3323] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#E0C796] transition hover:bg-[#164B34]"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#164B34]/25 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:border-[#164B34]"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>

            {/* Embedded Google Map */}
            {settings.google_maps_embed && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#164B34]/15 shadow-sm">
                <iframe
                  title="Growth Realtech Noida Location Map"
                  src={settings.google_maps_embed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-52 w-full border-0"
                />
              </div>
            )}
          </div>

          {/* Right Consultation Request Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-6 text-white shadow-2xl sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                Direct Enquiry Desk
              </p>
              <h3 className="mt-1.5 font-editorial text-3xl font-semibold text-white">
                Request a Tailored Property Shortlist
              </h3>
              <p className="mt-2 text-sm text-white/75">
                Tell us your preferred asset class, location, and budget. All enquiries are securely logged with our Noida consulting team.
              </p>
              <div className="mt-7">
                <EnquiryForm
                  defaultEnquiryType="consultation"
                  sourcePage="/"
                  dark
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
