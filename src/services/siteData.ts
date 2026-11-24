import { unstable_cache } from "next/cache";
import { query, queryOne } from "@/lib/db";
import { SITE_CACHE_TAG } from "@/lib/cache";
import type {
  WebsiteSettingsMap,
  NavigationItem,
  HomepageSection,
  PropertyCategory,
  PropertyItem,
  ProjectItem,
  ProjectImage,
  ServiceItem,
  TestimonialItem,
  BlogCategory,
  BlogItem,
  FaqItem,
  SeoMetadataItem,
  LegalPageItem,
} from "@/types";

export const DEFAULT_SETTINGS: WebsiteSettingsMap = {
  site_name: "Growth Realtech",
  site_tagline: "Real Estate Solutions for Better Tomorrow — Your Growth, Our Commitment!",
  logo_url: "/images/growth-realtech-logo.png",
  favicon_url: "/images/growth-realtech-logo.png",
  contact_phone: "+91 82875 69844",
  contact_email: "growthrealtechnoida@gmail.com",
  contact_email_secondary: "care@growthrealtech.in",
  contact_location: "Noida, Uttar Pradesh",
  contact_address: "Noida, Uttar Pradesh, India",
  whatsapp_number: "918287569844",
  whatsapp_default_message:
    "Hello Growth Realtech, I would like to request a personalised real estate consultation.",
  business_timings: "Monday – Sunday: 9:30 AM – 7:30 PM IST",
  google_maps_embed: "https://www.google.com/maps?q=Noida,Uttar+Pradesh,India&output=embed",
  top_bar_announcement:
    "Personalised Advisory for Residential, Commercial, Industrial & Expressway Opportunities in NCR",
  top_bar_enabled: "true",
  social_facebook: "",
  social_instagram: "",
  social_linkedin: "",
  social_youtube: "",
  footer_description:
    "Growth Realtech is a Noida-based real estate consulting brand helping clients navigate residential, commercial and investment property decisions.",
  footer_copyright: "© 2026 Growth Realtech. All rights reserved.",
  footer_disclaimer_short:
    "All project visuals are conceptual architectural representations unless verified on site. Pricing, RERA registrations, and availability are subject to official developer documentation.",
  color_primary: "#164B34",
  color_deep: "#0C3323",
  color_secondary: "#246C49",
  color_gold: "#C6A66C",
  color_light_gold: "#E0C796",
  color_cream: "#F6F7F2",
  color_dark_text: "#1C2921",
  font_heading: "Cormorant Garamond",
  font_body: "Plus Jakarta Sans",
  button_style: "luxury-sharp",
  header_style: "transparent-sticky",
  footer_style: "deep-emerald",
  animations_enabled: "true",
  three_d_hero_enabled: "true",
  global_meta_title:
    "Growth Realtech | Real Estate Consultant in Noida, Greater Noida & Yamuna Expressway",
  global_meta_description:
    "Growth Realtech offers personalised residential, commercial, industrial, plot, and investment real estate consulting across Noida, Greater Noida, and the Yamuna Expressway.",
  global_og_image: "/images/hero-skyline.jpg",
  sitemap_enabled: "true",
};

const CACHE_OPTS = { tags: [SITE_CACHE_TAG], revalidate: 300 };

const fetchSettingsCached = unstable_cache(
  async (): Promise<WebsiteSettingsMap> => {
    try {
      const rows = await query<{ setting_key: string; setting_value: string | null }>(
        "SELECT setting_key, setting_value FROM website_settings"
      );
      const map: WebsiteSettingsMap = { ...DEFAULT_SETTINGS };
      for (const row of rows) {
        if (row.setting_value !== null) {
          map[row.setting_key] = row.setting_value;
        }
      }
      return map;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },
  ["website-settings"],
  CACHE_OPTS
);

export async function getWebsiteSettings(): Promise<WebsiteSettingsMap> {
  return fetchSettingsCached();
}

const fetchNavigationCached = unstable_cache(
  async (location: string, activeOnly: boolean): Promise<NavigationItem[]> => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (location !== "ALL") {
      conditions.push("location = ?");
      params.push(location);
    }
    if (activeOnly) {
      conditions.push("is_active = 1");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return query<NavigationItem>(
      `SELECT * FROM navigation_menus ${where} ORDER BY sort_order ASC, id ASC`,
      params
    );
  },
  ["navigation-menus"],
  CACHE_OPTS
);

export async function getNavigationMenus(
  location?: NavigationItem["location"],
  activeOnly = true
): Promise<NavigationItem[]> {
  return fetchNavigationCached(location || "ALL", activeOnly);
}

const fetchHomepageSectionsCached = unstable_cache(
  async (includeHidden: boolean): Promise<HomepageSection[]> => {
    const where = includeHidden
      ? ""
      : "WHERE is_visible = 1 AND status = 'published'";
    return query<HomepageSection>(
      `SELECT * FROM homepage_sections ${where} ORDER BY sort_order ASC, id ASC`
    );
  },
  ["homepage-sections"],
  CACHE_OPTS
);

export async function getHomepageSections(
  includeHidden = false
): Promise<HomepageSection[]> {
  return fetchHomepageSectionsCached(includeHidden);
}

const fetchCategoriesCached = unstable_cache(
  async (activeOnly: boolean): Promise<PropertyCategory[]> => {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    return query<PropertyCategory>(
      `SELECT * FROM property_categories ${where} ORDER BY sort_order ASC, id ASC`
    );
  },
  ["property-categories"],
  CACHE_OPTS
);

export async function getPropertyCategories(
  activeOnly = true
): Promise<PropertyCategory[]> {
  return fetchCategoriesCached(activeOnly);
}

export interface PropertyFilterParams {
  property_type?: string;
  location?: string;
  budget_range?: string;
  purpose?: string;
  property_status?: string;
  category?: string;
  q?: string;
  featured?: boolean;
  includeDrafts?: boolean;
  limit?: number;
}

const fetchPropertiesCached = unstable_cache(
  async (serializedKey: string): Promise<PropertyItem[]> => {
    const filters = JSON.parse(serializedKey) as PropertyFilterParams;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (!filters.includeDrafts) {
      conditions.push("p.status = 'published'");
    }
    if (filters.property_type && filters.property_type !== "All") {
      conditions.push("p.property_type = ?");
      params.push(filters.property_type);
    }
    if (filters.location && filters.location !== "All") {
      conditions.push("(p.location = ? OR p.city = ?)");
      params.push(filters.location, filters.location);
    }
    if (
      filters.budget_range &&
      filters.budget_range !== "All" &&
      filters.budget_range !== "Open to Options"
    ) {
      conditions.push("p.budget_range = ?");
      params.push(filters.budget_range);
    }
    if (filters.purpose && filters.purpose !== "All") {
      conditions.push("p.purpose = ?");
      params.push(filters.purpose);
    }
    if (filters.property_status && filters.property_status !== "All") {
      conditions.push("p.property_status LIKE ?");
      params.push(`%${filters.property_status}%`);
    }
    if (filters.category) {
      conditions.push("c.slug = ?");
      params.push(filters.category);
    }
    if (filters.q) {
      conditions.push(
        "(p.title LIKE ? OR p.location LIKE ? OR p.sector LIKE ? OR p.short_description LIKE ? OR p.property_type LIKE ?)"
      );
      const term = `%${filters.q}%`;
      params.push(term, term, term, term, term);
    }
    if (filters.featured) {
      conditions.push("p.is_featured = 1");
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const limitSql = filters.limit ? `LIMIT ${Number(filters.limit)}` : "";

    return query<PropertyItem>(
      `SELECT p.*, c.name AS category_name
       FROM properties p
       LEFT JOIN property_categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.is_featured DESC, p.created_at DESC
       ${limitSql}`,
      params
    );
  },
  ["properties-list"],
  CACHE_OPTS
);

export async function getProperties(
  filters: PropertyFilterParams = {}
): Promise<PropertyItem[]> {
  return fetchPropertiesCached(JSON.stringify(filters));
}

const fetchPropertyBySlugCached = unstable_cache(
  async (slug: string): Promise<PropertyItem | null> => {
    return queryOne<PropertyItem>(
      `SELECT p.*, c.name AS category_name
       FROM properties p
       LEFT JOIN property_categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.status = 'published'
       LIMIT 1`,
      [slug]
    );
  },
  ["property-by-slug"],
  CACHE_OPTS
);

export async function getPropertyBySlug(slug: string): Promise<PropertyItem | null> {
  return fetchPropertyBySlugCached(slug);
}

const fetchProjectsCached = unstable_cache(
  async (serializedKey: string): Promise<ProjectItem[]> => {
    const filters = JSON.parse(serializedKey) as {
      region?: string;
      category?: string;
      featuredOnly?: boolean;
      includeDrafts?: boolean;
      limit?: number;
    };
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (!filters?.includeDrafts) {
      conditions.push("status = 'published'");
    }
    if (filters?.region && filters.region !== "All Projects") {
      conditions.push("(region_filter = ? OR location LIKE ?)");
      params.push(filters.region, `%${filters.region}%`);
    }
    if (filters?.category && filters.category !== "All Projects") {
      conditions.push("category = ?");
      params.push(filters.category);
    }
    if (filters?.featuredOnly) {
      conditions.push("is_featured = 1");
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const limitSql = filters?.limit ? `LIMIT ${Number(filters.limit)}` : "";

    return query<ProjectItem>(
      `SELECT * FROM projects ${where} ORDER BY sort_order ASC, is_featured DESC, id ASC ${limitSql}`,
      params
    );
  },
  ["projects-list"],
  CACHE_OPTS
);

export async function getProjects(filters?: {
  region?: string;
  category?: string;
  featuredOnly?: boolean;
  includeDrafts?: boolean;
  limit?: number;
}): Promise<ProjectItem[]> {
  return fetchProjectsCached(JSON.stringify(filters || {}));
}

const fetchProjectBySlugCached = unstable_cache(
  async (slug: string): Promise<ProjectItem | null> => {
    const project = await queryOne<ProjectItem>(
      `SELECT * FROM projects WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug]
    );
    if (!project) return null;
    const images = await query<ProjectImage>(
      `SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC`,
      [project.id]
    );
    return { ...project, images };
  },
  ["project-by-slug"],
  CACHE_OPTS
);

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  return fetchProjectBySlugCached(slug);
}

const fetchServicesCached = unstable_cache(
  async (publishedOnly: boolean): Promise<ServiceItem[]> => {
    const where = publishedOnly ? "WHERE status = 'published'" : "";
    return query<ServiceItem>(
      `SELECT * FROM services ${where} ORDER BY sort_order ASC, id ASC`
    );
  },
  ["services-list"],
  CACHE_OPTS
);

export async function getServices(publishedOnly = true): Promise<ServiceItem[]> {
  return fetchServicesCached(publishedOnly);
}

const fetchServiceBySlugCached = unstable_cache(
  async (slug: string): Promise<ServiceItem | null> => {
    return queryOne<ServiceItem>(
      `SELECT * FROM services WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug]
    );
  },
  ["service-by-slug"],
  CACHE_OPTS
);

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  return fetchServiceBySlugCached(slug);
}

const fetchTestimonialsCached = unstable_cache(
  async (publishedOnly: boolean, limit: number): Promise<TestimonialItem[]> => {
    const where = publishedOnly ? "WHERE status = 'published'" : "";
    const limitSql = limit > 0 ? `LIMIT ${Number(limit)}` : "";
    return query<TestimonialItem>(
      `SELECT * FROM testimonials ${where} ORDER BY sort_order ASC, id DESC ${limitSql}`
    );
  },
  ["testimonials-list"],
  CACHE_OPTS
);

export async function getTestimonials(
  publishedOnly = true,
  limit?: number
): Promise<TestimonialItem[]> {
  return fetchTestimonialsCached(publishedOnly, limit || 0);
}

const fetchBlogCategoriesCached = unstable_cache(
  async (): Promise<BlogCategory[]> => {
    return query<BlogCategory>(
      `SELECT * FROM blog_categories ORDER BY sort_order ASC, name ASC`
    );
  },
  ["blog-categories"],
  CACHE_OPTS
);

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return fetchBlogCategoriesCached();
}

const fetchBlogsCached = unstable_cache(
  async (serializedKey: string): Promise<BlogItem[]> => {
    const filters = JSON.parse(serializedKey) as {
      categorySlug?: string;
      tagSlug?: string;
      q?: string;
      includeAllStatuses?: boolean;
      limit?: number;
    };
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (!filters?.includeAllStatuses) {
      conditions.push("b.status = 'published' AND (b.published_at IS NULL OR b.published_at <= NOW())");
    }
    if (filters?.categorySlug) {
      conditions.push("bc.slug = ?");
      params.push(filters.categorySlug);
    }
    if (filters?.tagSlug) {
      conditions.push(
        "EXISTS (SELECT 1 FROM blog_tag_relations btr JOIN blog_tags bt ON bt.id = btr.tag_id WHERE btr.blog_id = b.id AND bt.slug = ?)"
      );
      params.push(filters.tagSlug);
    }
    if (filters?.q) {
      conditions.push("(b.title LIKE ? OR b.excerpt LIKE ?)");
      const t = `%${filters.q}%`;
      params.push(t, t);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const limitSql = filters?.limit ? `LIMIT ${Number(filters.limit)}` : "";

    return query<BlogItem>(
      `SELECT b.*, bc.name AS category_name, bc.slug AS category_slug
       FROM blogs b
       LEFT JOIN blog_categories bc ON bc.id = b.category_id
       ${where}
       ORDER BY COALESCE(b.published_at, b.created_at) DESC
       ${limitSql}`,
      params
    );
  },
  ["blogs-list"],
  CACHE_OPTS
);

export async function getBlogs(filters?: {
  categorySlug?: string;
  tagSlug?: string;
  q?: string;
  includeAllStatuses?: boolean;
  limit?: number;
}): Promise<BlogItem[]> {
  return fetchBlogsCached(JSON.stringify(filters || {}));
}

const fetchBlogBySlugCached = unstable_cache(
  async (slug: string): Promise<BlogItem | null> => {
    const blog = await queryOne<BlogItem>(
      `SELECT b.*, bc.name AS category_name, bc.slug AS category_slug
       FROM blogs b
       LEFT JOIN blog_categories bc ON bc.id = b.category_id
       WHERE b.slug = ? AND b.status = 'published'
       LIMIT 1`,
      [slug]
    );
    if (!blog) return null;
    const tags = await query<{ id: number; name: string; slug: string }>(
      `SELECT bt.id, bt.name, bt.slug
       FROM blog_tags bt
       JOIN blog_tag_relations btr ON btr.tag_id = bt.id
       WHERE btr.blog_id = ?`,
      [blog.id]
    );
    return { ...blog, tags };
  },
  ["blog-by-slug"],
  CACHE_OPTS
);

export async function getBlogBySlug(slug: string): Promise<BlogItem | null> {
  return fetchBlogBySlugCached(slug);
}

const fetchFaqsCached = unstable_cache(
  async (activeOnly: boolean): Promise<FaqItem[]> => {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    return query<FaqItem>(
      `SELECT * FROM faqs ${where} ORDER BY sort_order ASC, id ASC`
    );
  },
  ["faqs-list"],
  CACHE_OPTS
);

export async function getFaqs(activeOnly = true): Promise<FaqItem[]> {
  return fetchFaqsCached(activeOnly);
}

const fetchSeoMetadataCached = unstable_cache(
  async (pageKey: string): Promise<SeoMetadataItem | null> => {
    return queryOne<SeoMetadataItem>(
      `SELECT * FROM seo_metadata WHERE page_key = ? LIMIT 1`,
      [pageKey]
    );
  },
  ["seo-metadata"],
  CACHE_OPTS
);

export async function getSeoMetadata(pageKey: string): Promise<SeoMetadataItem | null> {
  return fetchSeoMetadataCached(pageKey);
}

const fetchLegalPageCached = unstable_cache(
  async (slug: string): Promise<LegalPageItem | null> => {
    return queryOne<LegalPageItem>(
      `SELECT * FROM legal_pages WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug]
    );
  },
  ["legal-page"],
  CACHE_OPTS
);

export async function getLegalPage(slug: string): Promise<LegalPageItem | null> {
  return fetchLegalPageCached(slug);
}
