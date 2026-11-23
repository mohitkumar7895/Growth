export interface WebsiteSettingsMap {
  [key: string]: string;
}

export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  location: "header" | "footer_quick" | "footer_services" | "footer_categories";
  parent_id: number | null;
  target: string;
  sort_order: number;
  is_active: number;
  is_cta: number;
}

export interface HomepageSection {
  id: number;
  section_key: string;
  section_type: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  description: string | null;
  content_json: string | null;
  image_url: string | null;
  video_url: string | null;
  cta_primary_label: string | null;
  cta_primary_url: string | null;
  cta_secondary_label: string | null;
  cta_secondary_url: string | null;
  background_style: string;
  sort_order: number;
  is_visible: number;
  status: "published" | "draft";
}

export interface PropertyCategory {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  icon_name: string | null;
  sort_order: number;
  is_active: number;
  is_featured: number;
  meta_title: string | null;
  meta_description: string | null;
}

export interface PropertyItem {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  category_name?: string | null;
  property_type: string;
  location: string;
  sector: string | null;
  city: string | null;
  budget_range: string | null;
  price_display: string | null;
  purpose: string | null;
  property_status: string | null;
  area_size: string | null;
  configuration: string | null;
  short_description: string | null;
  description: string | null;
  specifications_json: string | null;
  amenities_json: string | null;
  featured_image: string | null;
  gallery_json: string | null;
  map_embed_url: string | null;
  brochure_url: string | null;
  is_featured: number;
  status: "published" | "draft";
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  created_at?: string;
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
}

export interface ProjectItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  property_category_id: number | null;
  developer_name: string | null;
  location: string;
  sector: string | null;
  region_filter: string;
  short_description: string | null;
  description: string | null;
  featured_image: string | null;
  rera_number: string | null;
  rera_status_note: string | null;
  price_range: string | null;
  configuration: string | null;
  project_status: string | null;
  amenities_json: string | null;
  specifications_json: string | null;
  map_embed_url: string | null;
  brochure_url: string | null;
  official_website_url: string | null;
  is_featured: number;
  status: "published" | "draft";
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  images?: ProjectImage[];
}

export interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  icon_name: string | null;
  featured_image: string | null;
  highlights_json: string | null;
  process_json: string | null;
  sort_order: number;
  is_featured: number;
  status: "published" | "draft";
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
}

export interface TestimonialItem {
  id: number;
  client_name: string;
  designation: string | null;
  company: string | null;
  profile_image: string | null;
  feedback: string;
  rating: number;
  property_context: string | null;
  is_featured: number;
  status: "published" | "draft";
  sort_order: number;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface BlogItem {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  author_name: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  reading_time: string | null;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  views_count: number;
  tags?: { id: number; name: string; slug: string }[];
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: number;
}

export interface EnquiryItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  enquiry_type: string;
  property_interest: string | null;
  project_id: number | null;
  property_id: number | null;
  preferred_location: string | null;
  budget_range: string | null;
  purpose: string | null;
  message: string | null;
  source_page: string | null;
  status: "New" | "Contacted" | "Interested" | "Site Visit Scheduled" | "Converted" | "Closed";
  internal_notes: string | null;
  assigned_to: number | null;
  assigned_name?: string | null;
  follow_up_date: string | null;
  created_at: string;
}

export interface ContactSubmissionItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  location: string | null;
  message: string;
  status: "New" | "Reviewed" | "Responded" | "Archived";
  internal_notes: string | null;
  created_at: string;
}

export interface MediaAsset {
  id: number;
  file_name: string;
  original_name: string;
  file_url: string;
  file_type: "image" | "video" | "document";
  mime_type: string;
  file_size: number;
  alt_text: string | null;
  folder: string;
  storage_provider: "local" | "cloudinary";
  public_id: string | null;
  created_at: string;
}

export interface SeoMetadataItem {
  id: number;
  page_key: string;
  page_label: string;
  meta_title: string;
  meta_description: string | null;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots: string;
  schema_json: string | null;
  include_in_sitemap: number;
  updated_at?: string;
}

export interface LegalPageItem {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  status: "published" | "draft";
  updated_at?: string;
}

export const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Plots & Land",
  "Pre-rented / Investment",
  "Resale",
] as const;

export const LOCATIONS = [
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Yamuna Expressway",
  "Jewar / Airport Region",
  "Delhi NCR",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "Below ₹50 Lakh",
  "₹50 Lakh – ₹1 Crore",
  "₹1–2 Crore",
  "₹2–5 Crore",
  "₹5–10 Crore",
  "Above ₹10 Crore",
  "Open to Options",
] as const;

export const PURPOSES = [
  "End Use",
  "Investment",
  "Rental Income",
  "Business Use",
  "Sell / Exit",
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Site Visit Scheduled",
  "Converted",
  "Closed",
] as const;
