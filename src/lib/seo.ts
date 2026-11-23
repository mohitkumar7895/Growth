import type { Metadata } from "next";
import { getSeoMetadata, getWebsiteSettings } from "@/services/siteData";
import type { WebsiteSettingsMap } from "@/types";

export async function buildPageMetadata(
  pageKey: string,
  overrides?: {
    title?: string | null;
    description?: string | null;
    ogImage?: string | null;
    canonical?: string | null;
    path?: string;
  }
): Promise<Metadata> {
  const [settings, seo] = await Promise.all([
    getWebsiteSettings(),
    getSeoMetadata(pageKey),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title =
    overrides?.title ||
    seo?.meta_title ||
    settings.global_meta_title ||
    `${settings.site_name} | Real Estate Consulting Noida`;
  const description =
    overrides?.description ||
    seo?.meta_description ||
    settings.global_meta_description;
  const ogImage =
    overrides?.ogImage ||
    seo?.og_image ||
    settings.global_og_image ||
    "/images/hero-skyline.jpg";
  const canonical =
    overrides?.canonical ||
    seo?.canonical_url ||
    (overrides?.path ? `${siteUrl}${overrides.path}` : siteUrl);

  const robotsStr = seo?.robots || "index, follow";
  const noindex = robotsStr.includes("noindex");
  const nofollow = robotsStr.includes("nofollow");

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: {
      canonical,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      siteName: settings.site_name || "Growth Realtech",
      type: "website",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function buildOrganizationJsonLd(settings: WebsiteSettingsMap) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sameAs = [
    settings.social_facebook,
    settings.social_instagram,
    settings.social_linkedin,
    settings.social_youtube,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: settings.site_name || "Growth Realtech",
    description: settings.footer_description || settings.global_meta_description,
    url: siteUrl,
    telephone: settings.contact_phone || "+91 82875 69844",
    email: settings.contact_email || "growthrealtechnoida@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    areaServed: [
      "Noida",
      "Greater Noida",
      "Greater Noida West",
      "Yamuna Expressway",
      "Delhi NCR",
    ],
    sameAs,
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}
