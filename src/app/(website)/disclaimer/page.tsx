import React from "react";
import type { Metadata } from "next";
import { getLegalPage } from "@/services/siteData";
import PageHeroBanner from "@/components/common/PageHeroBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("disclaimer");
  return {
    title: page?.meta_title || "Disclaimer | Growth Realtech",
    description: page?.meta_description || "Growth Realtech Real Estate & RERA Disclaimer",
  };
}

export default async function DisclaimerPage() {
  const page = await getLegalPage("disclaimer");
  return (
    <>
      <PageHeroBanner
        badge="Regulatory Transparency"
        title={page?.title || "Real Estate & RERA Disclaimer"}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Disclaimer" }]}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="gr-prose rounded-2xl border border-[#164B34]/12 bg-white p-8 shadow-sm sm:p-12"
          dangerouslySetInnerHTML={{
            __html: page?.content || "<p>Disclaimer content is managed via Admin Dashboard.</p>",
          }}
        />
      </div>
    </>
  );
}
