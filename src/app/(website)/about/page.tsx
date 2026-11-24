import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomepageSections, getWebsiteSettings } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import { safeJsonParse } from "@/lib/security";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import { DynamicIcon } from "@/components/common/IconRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about", { path: "/about" });
}

export default async function AboutPage() {
  const [sections, settings] = await Promise.all([
    getHomepageSections(true),
    getWebsiteSettings(),
  ]);
  const aboutSection = sections.find((s) => s.section_key === "about");
  const whySection = sections.find((s) => s.section_key === "why_choose");
  const aboutData = safeJsonParse<{
    philosophy?: string;
    mission?: string;
    vision?: string;
    commitment?: string;
  }>(aboutSection?.content_json, {});
  const whyData = safeJsonParse<{
    features?: { icon: string; title: string; description: string }[];
  }>(whySection?.content_json, {});

  return (
    <>
      <PageHeroBanner
        badge="About Growth Realtech"
        title={aboutSection?.title || "A Refined Standard of Real Estate Consulting in Noida"}
        description={
          aboutSection?.description ||
          "Growth Realtech is a Noida-based real estate consulting brand helping clients navigate residential, commercial and investment property decisions."
        }
        imageUrl={aboutSection?.image_url || "/images/about-interior.jpg"}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#C6A66C]/35 shadow-2xl">
              <Image
                src={aboutSection?.image_url || "/images/about-interior.jpg"}
                alt="Growth Realtech Advisory Space"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
              Who We Are
            </p>
            <h2 className="font-editorial text-4xl font-semibold text-[#0C3323]">
              Personalised Consulting Rooted in Noida &amp; NCR
            </h2>
            <p className="text-base leading-relaxed text-[#1C2921]/80">
              {aboutSection?.description}
            </p>

            {aboutData.philosophy && (
              <blockquote className="rounded-xl border-l-4 border-[#C6A66C] bg-white p-6 font-editorial text-2xl italic text-[#0C3323] shadow-sm">
                &ldquo;{aboutData.philosophy}&rdquo;
              </blockquote>
            )}

            <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-6">
                <h3 className="font-editorial text-2xl font-semibold text-[#164B34]">
                  Our Mission
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1C2921]/75">
                  {aboutData.mission}
                </p>
              </div>
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-6">
                <h3 className="font-editorial text-2xl font-semibold text-[#164B34]">
                  Our Vision
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1C2921]/75">
                  {aboutData.vision}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-6 text-white shadow-lg sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                Our Commitment
              </p>
              <p className="mt-2.5 font-editorial text-2xl font-semibold uppercase tracking-wide text-[#E0C796] sm:text-3xl">
                Real Estate Solutions for Better Tomorrow
              </p>
              <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white sm:text-sm">
                Your Growth Our Commitment
              </p>
              {aboutData.commitment && (
                <p className="mt-3.5 border-t border-white/15 pt-3.5 text-sm leading-relaxed text-white/85">
                  {aboutData.commitment}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Principles Grid */}
        {whyData.features && whyData.features.length > 0 && (
          <div className="mt-24">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                Why Growth Realtech
              </p>
              <h2 className="mt-2 font-editorial text-4xl font-semibold text-[#0C3323]">
                {whySection?.title || "Our Core Consulting Principles"}
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {whyData.features.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#164B34]/12 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0C3323] text-[#E0C796]">
                    <DynamicIcon name={f.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1C2921]/75">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Band */}
        <div className="mt-20 rounded-2xl bg-[#0C3323] p-10 text-center text-white sm:p-14">
          <h2 className="font-editorial text-3xl font-semibold sm:text-4xl">
            Ready to Discuss Your Next Property Decision?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75">
            Speak directly with our advisory desk in {settings.contact_location || "Noida"} at{" "}
            {settings.contact_phone || "+91 82875 69844"}.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact#enquiry"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--gr-gold)] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)]"
            >
              Book a Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
