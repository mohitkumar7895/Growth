import React from "react";
import type { Metadata } from "next";
import { getLegalPage } from "@/services/siteData";
import PageHeroBanner from "@/components/common/PageHeroBanner";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("privacy-policy");
  return {
    title: page?.meta_title || "Privacy Policy | Growth Realtech",
    description: page?.meta_description || "Growth Realtech Privacy Policy",
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getLegalPage("privacy-policy");
  return (
    <>
      <PageHeroBanner
        badge="Legal & Compliance"
        title={page?.title || "Privacy Policy"}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="gr-prose rounded-2xl border border-[#164B34]/12 bg-white p-8 shadow-sm sm:p-12"
          dangerouslySetInnerHTML={{
            __html: page?.content || "<p>Privacy policy content is managed via Admin Dashboard.</p>",
          }}
        />
      </div>
    </>
  );
}
