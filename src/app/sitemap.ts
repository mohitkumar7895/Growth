import type { MetadataRoute } from "next";
import {
  getProperties,
  getProjects,
  getServices,
  getBlogs,
  getWebsiteSettings,
} from "@/services/siteData";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getWebsiteSettings();
  if (settings.sitemap_enabled === "false") {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/properties",
    "/projects",
    "/services",
    "/about",
    "/approach",
    "/insights",
    "/register",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/disclaimer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const [properties, projects, services, blogs] = await Promise.all([
    getProperties(),
    getProjects(),
    getServices(),
    getBlogs(),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...properties.map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...services.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...blogs.map((b) => ({
      url: `${baseUrl}/insights/${b.slug}`,
      lastModified: b.published_at ? new Date(b.published_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
