import React from "react";
import type { Metadata } from "next";
import { getWebsiteSettings } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import ContactSection from "@/components/home/ContactSection";
import ContactForm from "@/components/common/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact", { path: "/contact" });
}

export default async function ContactPage() {
  const settings = await getWebsiteSettings();

  return (
    <>
      <PageHeroBanner
        badge="Connect With Growth Realtech"
        title="Schedule a Private Real Estate Consultation"
        description={`Reach our advisory desk in ${settings.contact_location || "Noida, Uttar Pradesh"} via phone, WhatsApp, email, or the structured consultation form below.`}
        imageUrl="/images/hero-skyline.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <ContactSection
        settings={settings}
        badge="Advisory Office"
        title="Speak With a Noida Property Specialist"
        description="Whether buying a residence, evaluating commercial suites, acquiring industrial plots, or listing a resale asset, we are here to help."
      />

      {/* General Contact Message Box stored in contact_submissions */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#164B34]/15 bg-white p-8 shadow-lg sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
              General Correspondence
            </p>
            <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-[#0C3323]">
              Send Us a Direct Message
            </h2>
            <p className="mt-2 text-sm text-[#1C2921]/70">
              For corporate partnerships, developer inquiries, leasing mandates, or general questions, use this direct contact form.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
