"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, CalendarCheck, ChevronDown } from "lucide-react";
import type { HomepageSection } from "@/types";
import { safeJsonParse } from "@/lib/security";

const Hero3DCanvas = dynamic(
  () => import("@/components/animations/Hero3DCanvas"),
  { ssr: false }
);

interface HeroConfig {
  enable3D?: boolean;
  overlayOpacity?: number;
  scrollIndicatorText?: string;
  stats?: { label: string; value: string }[];
}

export default function HeroSection({
  section,
  enable3DGlobal = true,
}: {
  section: HomepageSection;
  enable3DGlobal?: boolean;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const cfg = safeJsonParse<HeroConfig>(section.content_json, {});
  const show3D = enable3DGlobal && cfg.enable3D !== false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-stagger", {
        y: 22,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
      });
    }, heroRef);

    let rafId = 0;
    const onScroll = () => {
      if (window.innerWidth < 1024 || rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        if (!bgRef.current) return;
        const offset = Math.min(window.scrollY * 0.18, 90);
        bgRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ctx.revert();
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const stats = cfg.stats || [
    { label: "Corridors Covered", value: "Noida & NCR" },
    { label: "Advisory Verticals", value: "6+ Asset Classes" },
    { label: "Consulting Standard", value: "End-to-End Guidance" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[78dvh] items-center overflow-hidden bg-[var(--gr-deep)] pb-16 pt-28 text-white sm:min-h-[82dvh] sm:pb-20 sm:pt-32 lg:pt-36"
    >
      {/* Ultra-HD Cinematic Architectural Background Image (LCP high priority) */}
      <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
        {section.video_url ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={section.image_url || "/images/hero-skyline.jpg"}
            className="h-full w-full object-cover"
          >
            <source src={section.video_url} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={section.image_url || "/images/hero-skyline.jpg"}
            alt={section.title}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
      </div>

      {/* Editorial Forest Green Gradient Overlays */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(112deg, rgba(12,51,35,0.92) 0%, rgba(22,75,52,0.74) 48%, rgba(12,51,35,0.58) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#0C3323] to-transparent" />

      {/* Lazy-Loaded Three.js 3D Architectural Sculpture & Gold Motes */}
      {show3D && <Hero3DCanvas />}

      {/* Subtle Floating Luxury Geometric Framing Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 z-[3] hidden rounded-3xl border border-[#C6A66C]/15 xl:block"
      />

      {/* Main Content */}
      <div className="fluid-container relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {section.badge_text && (
            <div className="hero-stagger mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#C6A66C]/40 bg-[#0C3323]/65 px-3.5 py-1.5 backdrop-blur-md sm:px-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C6A66C]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E0C796] sm:text-[11px]">
                {section.badge_text}
              </span>
            </div>
          )}

          <h1 className="hero-stagger fluid-hero-title font-editorial font-semibold leading-[1.06] tracking-tight text-white">
            {section.title}
          </h1>

          {section.subtitle && (
            <p className="hero-stagger mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C] sm:text-sm">
              {section.subtitle}
            </p>
          )}

          {section.description && (
            <p className="hero-stagger mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base lg:text-lg">
              {section.description}
            </p>
          )}

          <div className="hero-stagger mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            {section.cta_primary_label && (
              <Link
                href={section.cta_primary_url || "/properties"}
                className="gr-btn group inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 bg-[var(--gr-gold)] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gr-deep)] shadow-xl transition hover:bg-[var(--gr-light-gold)] sm:w-auto"
              >
                <span>{section.cta_primary_label}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {section.cta_secondary_label && (
              <Link
                href={section.cta_secondary_url || "/contact#enquiry"}
                className="gr-btn inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 border border-[#C6A66C]/60 bg-white/5 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-[#E0C796] hover:bg-white/10 sm:w-auto"
              >
                <CalendarCheck className="h-4 w-4 text-[#C6A66C]" />
                <span>{section.cta_secondary_label}</span>
              </Link>
            )}
          </div>

          {/* Editorial Advisory Highlights Bar */}
          <div className="hero-stagger mt-8 grid grid-cols-1 gap-3.5 border-t border-white/15 pt-5 sm:mt-10 sm:grid-cols-3 sm:pt-6">
            {stats.map((item, idx) => (
              <div key={idx} className="border-l border-[#C6A66C]/45 pl-4">
                <p className="font-editorial text-xl font-semibold text-[#E0C796] sm:text-2xl">
                  {item.value}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/65 sm:text-xs">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <a
        href="#smart-search"
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E0C796]/80 transition hover:text-[#E0C796] sm:flex"
      >
        <span>{cfg.scrollIndicatorText || "Scroll to Explore"}</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
