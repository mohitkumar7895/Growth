import React from "react";
import type { Metadata } from "next";
import { getProjects } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import FeaturedProjectsSection from "@/components/home/FeaturedProjectsSection";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("projects", { path: "/projects" });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeroBanner
        badge="Curated Developments"
        title="Featured Projects Across Noida, Greater Noida & Yamuna Expressway"
        description="Explore prominent commercial and residential reference projects. Official pricing, unit configurations, and UP-RERA disclosures are verified during your consultation."
        imageUrl="/images/projects/orion-one32.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />
      <FeaturedProjectsSection
        projects={projects}
        badge="Filter by Corridor & Asset Class"
        title="Browse All Showcase Developments"
        description="Use the interactive filters below to explore Noida, Greater Noida, Yamuna Expressway, commercial, and residential projects."
        showAllCta={false}
      />
    </>
  );
}
