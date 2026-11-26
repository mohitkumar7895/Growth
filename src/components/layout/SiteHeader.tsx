"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { NavigationItem, WebsiteSettingsMap } from "@/types";

export default function SiteHeader({
  settings,
  menuItems,
}: {
  settings: WebsiteSettingsMap;
  menuItems: NavigationItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Eagerly prefetch all header routes right after mount so every click opens instantly (0ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const item of menuItems) {
        if (item.url && item.url.startsWith("/") && !item.url.includes("#")) {
          router.prefetch(item.url);
        }
      }
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHome = pathname === "/";
  const transparentMode =
    isHome && settings.header_style !== "solid-always" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const baseRegularLinks = menuItems.filter((item) => !item.is_cta);
  const hasRegisterLink = baseRegularLinks.some(
    (item) => item.url === "/register"
  );
  const regularLinks: NavigationItem[] = hasRegisterLink
    ? baseRegularLinks
    : (() => {
        const registerItem: NavigationItem = {
          id: -101,
          label: "Register",
          url: "/register",
          location: "header",
          parent_id: null,
          target: "_self",
          sort_order: 8,
          is_active: 1,
          is_cta: 0,
        };
        const contactIdx = baseRegularLinks.findIndex(
          (i) => i.url === "/contact"
        );
        if (contactIdx === -1) return [...baseRegularLinks, registerItem];
        return [
          ...baseRegularLinks.slice(0, contactIdx),
          registerItem,
          ...baseRegularLinks.slice(contactIdx),
        ];
      })();
  const ctaLinks = menuItems.filter((item) => Boolean(item.is_cta));
  const showTopBar = settings.top_bar_enabled !== "false";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        transparentMode
          ? "bg-gradient-to-b from-[#0C3323]/90 via-[#0C3323]/55 to-transparent"
          : "border-b border-[#C6A66C]/20 bg-[#0C3323]/96 shadow-lg backdrop-blur-md"
      }`}
    >
      {/* Top Information Bar */}
      {showTopBar && (
        <div
          className={`border-b border-white/10 transition-all duration-300 ${
            scrolled ? "hidden lg:block bg-[#082418]/92" : "bg-[#082418]/80"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1.5 text-[11px] text-white/85 sm:px-6 sm:py-2 lg:px-8">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <span className="truncate">{settings.contact_location || "Noida, Uttar Pradesh"}</span>
              </span>
              <a
                href={`tel:${(settings.contact_phone || "+91 82875 69844").replace(/\s+/g, "")}`}
                className="inline-flex shrink-0 items-center gap-1 transition hover:text-[#E0C796]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <span>{settings.contact_phone || "+91 82875 69844"}</span>
              </a>
              <a
                href={`mailto:${settings.contact_email_secondary || "care@growthrealtech.in"}`}
                className="hidden items-center gap-1.5 transition hover:text-[#E0C796] md:inline-flex"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <span>{settings.contact_email_secondary || "care@growthrealtech.in"}</span>
              </a>
              <a
                href={`mailto:${settings.contact_email || "growthrealtechnoida@gmail.com"}`}
                className="hidden items-center gap-1.5 transition hover:text-[#E0C796] lg:inline-flex"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#C6A66C]" aria-hidden="true" />
                <span>{settings.contact_email || "growthrealtechnoida@gmail.com"}</span>
              </a>
            </div>
            {settings.top_bar_announcement && (
              <div className="hidden items-center gap-1.5 text-[#E0C796] xl:inline-flex">
                <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="max-w-md truncate">{settings.top_bar_announcement}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Sticky Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        {/* Brand Logo (Larger, High-Impact Display) */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          {settings.logo_url ? (
            <div className="flex items-center rounded-xl bg-white/98 px-3 py-1.5 shadow-lg ring-1 ring-[#C6A66C]/55 transition group-hover:bg-white group-hover:ring-[#E0C796] sm:px-3.5 sm:py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logo_url}
                alt={settings.site_name || "Growth Realtech"}
                className="h-12 w-auto object-contain sm:h-14 xl:h-16"
              />
            </div>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C6A66C]/70 bg-[#164B34] shadow-inner transition group-hover:border-[#E0C796]">
                <span className="font-editorial text-xl font-bold tracking-wider text-[#E0C796]">
                  GR
                </span>
              </div>
              <div className="leading-tight">
                <span className="block font-editorial text-xl font-semibold tracking-wide text-white sm:text-2xl">
                  {settings.site_name || "Growth Realtech"}
                </span>
                <span className="block text-[9px] font-medium uppercase tracking-[0.26em] text-[#C6A66C]">
                  Real Estate Advisory
                </span>
              </div>
            </>
          )}
        </Link>

        {/* Single Semantic Primary Navigation */}
        <nav aria-label="Primary" className="flex items-center gap-2">
          <ul className="hidden items-center gap-0.5 lg:flex">
            {regularLinks.map((item) => {
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url);
              const isRegister = item.url === "/register";
              return (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    prefetch={true}
                    target={item.target || "_self"}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative whitespace-nowrap rounded-md px-2 py-2 text-[12px] font-medium tracking-wide transition-colors duration-100 xl:px-3 xl:text-[13px] ${
                      isRegister
                        ? isActive
                          ? "border border-[#C6A66C] bg-[#C6A66C]/20 text-[#E0C796]"
                          : "border border-[#C6A66C]/55 bg-white/5 text-[#E0C796] hover:border-[#E0C796] hover:bg-[#C6A66C]/15"
                        : isActive
                        ? "text-[#E0C796] after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-[2px] after:bg-[#C6A66C]"
                        : "text-white/85 hover:text-[#E0C796]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {ctaLinks.map((cta) => (
              <li key={cta.id} className="ml-2 xl:ml-3">
                <Link
                  href={cta.url}
                  prefetch={true}
                  target={cta.target || "_self"}
                  className="gr-btn inline-flex items-center gap-1.5 whitespace-nowrap bg-[var(--gr-gold)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--gr-deep)] shadow-md transition hover:bg-[var(--gr-light-gold)] xl:px-4 xl:py-2.5 xl:text-xs"
                >
                  <span>{cta.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet Quick Register + CTA + Mobile Menu Toggle */}
          <Link
            href="/register"
            prefetch={true}
            className="gr-btn inline-flex items-center gap-1 border border-[#C6A66C]/65 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#E0C796] transition hover:bg-[#C6A66C]/20 lg:hidden"
          >
            <span>Register</span>
          </Link>
          {ctaLinks[0] && (
            <Link
              href={ctaLinks[0].url}
              prefetch={true}
              className="gr-btn hidden items-center gap-1.5 bg-[var(--gr-gold)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--gr-deep)] shadow-sm transition hover:bg-[var(--gr-light-gold)] sm:inline-flex lg:hidden"
            >
              <span>{ctaLinks[0].label}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-site-menu"
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-[#C6A66C] hover:text-[#E0C796] lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Menu</span>
          </button>
        </nav>
      </div>

      {/* Mobile & Tablet Slide-Down Navigation Panel */}
      {mobileOpen && (
        <div
          id="mobile-site-menu"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-[#C6A66C]/25 bg-[#0C3323]/98 px-4 pb-6 pt-3 shadow-2xl backdrop-blur-lg lg:hidden"
        >
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {regularLinks.map((item) => {
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url);
              return (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    target={item.target || "_self"}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "border-l-2 border-[#C6A66C] bg-white/10 text-[#E0C796]"
                        : "text-white/85 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            {ctaLinks.map((cta) => (
              <Link
                key={cta.id}
                href={cta.url}
                className="gr-btn flex min-h-[44px] w-full items-center justify-center gap-2 bg-[var(--gr-gold)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)]"
              >
                <span>{cta.label}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-white/75">
              <a
                href={`tel:${(settings.contact_phone || "").replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-[#E0C796]"
              >
                <Phone className="h-3.5 w-3.5 text-[#C6A66C]" />
                {settings.contact_phone}
              </a>
              <a
                href={`mailto:${settings.contact_email}`}
                className="inline-flex items-center gap-1.5 break-all hover:text-[#E0C796]"
              >
                <Mail className="h-3.5 w-3.5 text-[#C6A66C]" />
                {settings.contact_email}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
