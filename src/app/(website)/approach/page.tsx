import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomepageSections, getFaqs } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import { safeJsonParse } from "@/lib/security";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import ApproachTimeline from "@/components/home/ApproachTimeline";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("approach", { path: "/approach" });
}

export default async function ApproachPage() {
  const [sections, faqs] = await Promise.all([
    getHomepageSections(true),
    getFaqs(true),
  ]);
  const approach = sections.find((s) => s.section_key === "approach");
  const data = safeJsonParse<{
    steps?: { number: string; title: string; description: string }[];
  }>(approach?.content_json, {});

  return (
    <>
      <PageHeroBanner
        badge="Our Consulting Methodology"
        title={approach?.title || "A Disciplined Four-Step Advisory Methodology"}
        description={
          approach?.description ||
          "How Growth Realtech moves from understanding your brief to coordinating well-evaluated real estate decisions."
        }
        imageUrl="/images/projects/dxn-orion.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Our Approach" }]}
      />

      <ApproachTimeline
        badge="Step by Step"
        title="How We Work With Every Client"
        subtitle="Clear milestones, zero pressure, thorough diligence"
        steps={data.steps || []}
      />

      {faqs.length > 0 && (
        <section aria-labelledby="approach-faq" className="bg-[var(--gr-cream)] py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2
              id="approach-faq"
              className="text-center font-editorial text-4xl font-semibold text-[#0C3323]"
            >
              Common Questions About Our Process
            </h2>
            <div className="gr-accordion mt-10 border-t border-[#164B34]/15">
              {faqs.map((faq) => (
                <details key={faq.id}>
                  <summary className="text-base sm:text-lg">{faq.question}</summary>
                  <div className="pb-5 pl-8 pr-2 text-sm leading-relaxed text-[#1C2921]/80">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/contact#enquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gr-primary)] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white"
              >
                Start Step 01 — Share Your Requirement <ArrowRight className="h-4 w-4 text-[#E0C796]" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
