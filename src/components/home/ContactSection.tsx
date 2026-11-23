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
    <section id="enquiry" className="bg-[var(--gr-cream)] py-9 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          {/* Left Info & Map */}
          <div className="lg:col-span-5">
            <SectionHeader
              badge={badge || "Private Consultation"}
              title={title}
              subtitle={subtitle}
              description={description}
            />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-7 sm:gap-4">
              <div className="flex items-center gap-3.5 rounded-xl border border-[#164B34]/12 bg-white p-3.5 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796] sm:h-11 sm:w-11">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49] sm:text-[11px]">
                    Direct Advisory Line
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="block font-editorial text-xl font-semibold text-[#0C3323] hover:text-[#164B34] sm:text-2xl"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-[#164B34]/12 bg-white p-3.5 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796] sm:h-11 sm:w-11">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49] sm:text-[11px]">
                    Email Correspondence
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="block break-all text-xs font-semibold text-[#0C3323] hover:text-[#164B34] sm:text-sm"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-[#164B34]/12 bg-white p-3.5 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796] sm:h-11 sm:w-11">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49] sm:text-[11px]">
                    Regional Presence
                  </p>
                  <p className="text-xs font-semibold text-[#0C3323] sm:text-sm">
                    {location}
                  </p>
                  {settings.business_timings && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#1C2921]/65 sm:text-xs">
                      <Clock className="h-3 w-3 shrink-0 text-[#C6A66C]" />
                      {settings.business_timings}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm transition hover:brightness-105 sm:px-5 sm:py-3 sm:text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C3323] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#E0C796] transition hover:bg-[#164B34] sm:px-5 sm:py-3 sm:text-xs"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/25 bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#164B34] transition hover:border-[#164B34] sm:px-5 sm:py-3 sm:text-xs"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>

            {/* Embedded Google Map */}
            {settings.google_maps_embed && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#164B34]/15 shadow-sm sm:mt-6">
                <iframe
                  title="Growth Realtech Noida Location Map"
                  src={settings.google_maps_embed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-40 w-full border-0 sm:h-52"
                />
              </div>
            )}
          </div>

          {/* Right Consultation Request Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-5 text-white shadow-2xl sm:p-10">
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
