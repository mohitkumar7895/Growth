import React from "react";
import type { Metadata } from "next";
import {
  getHomepageSections,
  getWebsiteSettings,
  getPropertyCategories,
  getProjects,
  getServices,
  getTestimonials,
  getBlogs,
  getFaqs,
} from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import HomepageRenderer from "@/components/home/HomepageRenderer";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", { path: "/" });
}

export default async function HomePage() {
  const [
    sections,
    settings,
    categories,
    projects,
    services,
    testimonials,
    blogs,
    faqs,
  ] = await Promise.all([
    getHomepageSections(false),
    getWebsiteSettings(),
    getPropertyCategories(true),
    getProjects({ featuredOnly: true }),
    getServices(true),
    getTestimonials(true, 6),
    getBlogs({ limit: 3 }),
    getFaqs(true),
  ]);

  return (
    <HomepageRenderer
      sections={sections}
      settings={settings}
      categories={categories}
      projects={projects}
      services={services}
      testimonials={testimonials}
      blogs={blogs}
      faqs={faqs}
    />
  );
}
