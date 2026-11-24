import React from "react";
import type { Metadata } from "next";
import { getProperties, getPropertyCategories } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import PropertiesDirectoryClient from "@/components/properties/PropertiesDirectoryClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("properties", { path: "/properties" });
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const initialFilters = {
    property_type: sp.property_type || "All",
    location: sp.location || "All",
    budget_range: sp.budget_range || "All",
    purpose: sp.purpose || "All",
    category: sp.category || "",
    q: sp.q || "",
  };

  const [properties, categories] = await Promise.all([
    getProperties({
      property_type: initialFilters.property_type,
      location: initialFilters.location,
      budget_range: initialFilters.budget_range,
      purpose: initialFilters.purpose,
      category: initialFilters.category || undefined,
      q: initialFilters.q || undefined,
    }),
    getPropertyCategories(true),
  ]);

  return (
    <>
      <PageHeroBanner
        badge="Curated Real Estate Directory"
        title="Properties Across Noida, Greater Noida & NCR"
        description="Search residential, commercial, industrial, plotted, pre-rented, and resale consulting opportunities filtered directly from our advisory database."
        imageUrl="/images/projects/group-108-1.png"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Properties" }]}
      />
      <PropertiesDirectoryClient
        initialProperties={properties}
        categories={categories}
        initialFilters={initialFilters}
      />
    </>
  );
}
