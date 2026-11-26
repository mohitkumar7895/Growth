import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import type {
  NavigationItem,
  PropertyCategory,
  ServiceItem,
  WebsiteSettingsMap,
} from "@/types";

export default function SiteFooter({
  settings,
  quickLinks,
  services,
  categories,
}: {
  settings: WebsiteSettingsMap;
  quickLinks: NavigationItem[];
  services: ServiceItem[];
  categories: PropertyCategory[];
}) {
  const socials = [
    { label: "LinkedIn", url: settings.social_linkedin },
    { label: "Instagram", url: settings.social_instagram },
    { label: "Facebook", url: settings.social_facebook },
    { label: "YouTube", url: settings.social_youtube },
  ].filter((s) => Boolean(s.url));

  const footerBg =
    settings.footer_style === "charcoal-forest"
      ? "bg-[#101C16]"
      : "bg-[var(--gr-deep)]";

  const resolvedQuickLinks: NavigationItem[] = quickLinks.some(
    (l) => l.url === "/register"
  )
    ? quickLinks
    : [
        ...quickLinks,
        {
          id: -102,
          label: "Customer Registration",
          url: "/register",
          location: "footer_quick",
          parent_id: null,
          target: "_self",
          sort_order: 99,
          is_active: 1,
          is_cta: 0,
        },
      ];

  return (
    <footer className={`border-t border-[#C6A66C]/25 ${footerBg} text-white`}>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-9 sm:px-6 sm:pb-28 sm:pt-12 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              {settings.logo_url ? (
                <div className="rounded-xl bg-white/98 px-4 py-2.5 shadow-lg ring-1 ring-[#C6A66C]/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.logo_url}
                    alt={settings.site_name || "Growth Realtech"}
                    className="h-16 w-auto object-contain sm:h-20"
                  />
                </div>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#C6A66C]/70 bg-[#164B34]">
                    <span className="font-editorial text-2xl font-bold text-[#E0C796]">GR</span>
                  </div>
                  <div>
                    <span className="block font-editorial text-2xl font-semibold tracking-wide text-white">
                      {settings.site_name || "Growth Realtech"}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.26em] text-[#C6A66C]">
                      Real Estate Advisory
                    </span>
                  </div>
                </>
              )}
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/75">
              {settings.footer_description}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-white/80 transition hover:border-[#C6A66C] hover:text-[#E0C796]"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="font-editorial text-lg font-semibold text-[#E0C796]">
              Explore
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-white/75 sm:mt-4 sm:space-y-2.5 sm:text-sm">
              {resolvedQuickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className="transition hover:text-[#E0C796]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="font-editorial text-lg font-semibold text-[#E0C796]">
              Consulting Services
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-white/75 sm:mt-4 sm:space-y-2.5 sm:text-sm">
              {services.slice(0, 7).map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="transition hover:text-[#E0C796]"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories & Contact */}
          <div className="col-span-2 lg:col-span-3">
            <h3 className="font-editorial text-lg font-semibold text-[#E0C796]">
              Property Verticals
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/properties?category=${cat.slug}`}
                    className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-[#C6A66C] hover:text-[#E0C796]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-7 font-editorial text-lg font-semibold text-[#E0C796]">
              Noida Advisory Desk
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <span>{settings.contact_location || "Noida, Uttar Pradesh"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <a
                  href={`tel:${(settings.contact_phone || "+91 82875 69844").replace(/\s+/g, "")}`}
                  className="transition hover:text-[#E0C796]"
                >
                  {settings.contact_phone || "+91 82875 69844"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <a
                  href={`mailto:${settings.contact_email_secondary || "care@growthrealtech.in"}`}
                  className="break-all transition hover:text-[#E0C796]"
                >
                  {settings.contact_email_secondary || "care@growthrealtech.in"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <a
                  href={`mailto:${settings.contact_email || "growthrealtechnoida@gmail.com"}`}
                  className="break-all transition hover:text-[#E0C796]"
                >
                  {settings.contact_email || "growthrealtechnoida@gmail.com"}
                </a>
              </li>
              {settings.business_timings && (
                <li className="flex items-start gap-2.5 text-xs text-white/65">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                  <span>{settings.business_timings}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Advisory Disclaimer Banner */}
        {settings.footer_disclaimer_short && (
          <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/65">
            <strong className="text-[#E0C796]">Advisory Disclaimer: </strong>
            {settings.footer_disclaimer_short}
          </div>
        )}

        {/* Bottom Legal Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/65 sm:flex-row">
          <p>{settings.footer_copyright || "© 2026 Growth Realtech. All rights reserved."}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy-policy" className="transition hover:text-[#E0C796]">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="transition hover:text-[#E0C796]">
              Terms &amp; Conditions
            </Link>
            <Link href="/disclaimer" className="transition hover:text-[#E0C796]">
              Disclaimer
            </Link>
            <Link href="/admin" className="text-white/45 transition hover:text-[#E0C796]">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
