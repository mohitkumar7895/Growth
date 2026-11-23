import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(140),
  phone: z
    .string()
    .trim()
    .min(8, "Please provide a valid phone number")
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Phone number contains invalid characters"),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  enquiry_type: z
    .enum(["property", "project", "consultation", "investment", "site_visit", "general"])
    .default("general"),
  property_interest: z.string().max(200).optional().nullable(),
  project_id: z.coerce.number().int().positive().optional().nullable(),
  property_id: z.coerce.number().int().positive().optional().nullable(),
  preferred_location: z.string().max(120).optional().nullable(),
  budget_range: z.string().max(80).optional().nullable(),
  purpose: z.string().max(80).optional().nullable(),
  message: z.string().max(2500).optional().nullable(),
  source_page: z.string().max(255).optional().nullable(),
});

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(140),
  phone: z
    .string()
    .trim()
    .min(8, "Please enter a valid contact number")
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Phone number contains invalid characters"),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().min(10, "Please share a brief message (at least 10 characters)").max(3000),
});

export const propertySchema = z.object({
  title: z.string().trim().min(3).max(220),
  slug: z.string().trim().max(240).optional(),
  category_id: z.coerce.number().int().positive().optional().nullable(),
  property_type: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  sector: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  budget_range: z.string().trim().max(80).optional().nullable(),
  price_display: z.string().trim().max(120).optional().nullable(),
  purpose: z.string().trim().max(80).optional().nullable(),
  property_status: z.string().trim().max(80).optional().nullable(),
  area_size: z.string().trim().max(100).optional().nullable(),
  configuration: z.string().trim().max(150).optional().nullable(),
  short_description: z.string().max(400).optional().nullable(),
  description: z.string().optional().nullable(),
  specifications_json: z.string().optional().nullable(),
  amenities_json: z.string().optional().nullable(),
  featured_image: z.string().max(500).optional().nullable(),
  gallery_json: z.string().optional().nullable(),
  map_embed_url: z.string().max(600).optional().nullable(),
  brochure_url: z.string().max(500).optional().nullable(),
  is_featured: z.coerce.number().int().min(0).max(1).default(0),
  status: z.enum(["published", "draft"]).default("published"),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(350).optional().nullable(),
  canonical_url: z.string().max(400).optional().nullable(),
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(220).optional(),
  category: z.string().trim().min(2).max(80),
  property_category_id: z.coerce.number().int().positive().optional().nullable(),
  developer_name: z.string().max(160).optional().nullable(),
  location: z.string().trim().min(2).max(140),
  sector: z.string().max(120).optional().nullable(),
  region_filter: z.string().trim().min(2).max(80),
  short_description: z.string().max(400).optional().nullable(),
  description: z.string().optional().nullable(),
  featured_image: z.string().max(500).optional().nullable(),
  rera_number: z.string().max(180).optional().nullable(),
  rera_status_note: z.string().max(255).optional().nullable(),
  price_range: z.string().max(120).optional().nullable(),
  configuration: z.string().max(180).optional().nullable(),
  project_status: z.string().max(100).optional().nullable(),
  amenities_json: z.string().optional().nullable(),
  specifications_json: z.string().optional().nullable(),
  map_embed_url: z.string().max(600).optional().nullable(),
  brochure_url: z.string().max(500).optional().nullable(),
  official_website_url: z.string().max(400).optional().nullable(),
  is_featured: z.coerce.number().int().min(0).max(1).default(1),
  status: z.enum(["published", "draft"]).default("published"),
  sort_order: z.coerce.number().int().default(0),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(350).optional().nullable(),
  canonical_url: z.string().max(400).optional().nullable(),
  gallery: z
    .array(
      z.object({
        image_url: z.string().min(1),
        alt_text: z.string().optional().nullable(),
        caption: z.string().optional().nullable(),
      })
    )
    .optional(),
});

export const blogSchema = z.object({
  title: z.string().trim().min(3).max(240),
  slug: z.string().trim().max(260).optional(),
  category_id: z.coerce.number().int().positive().optional().nullable(),
  author_name: z.string().trim().max(120).default("Growth Realtech Advisory Desk"),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10),
  featured_image: z.string().max(500).optional().nullable(),
  reading_time: z.string().max(40).optional().nullable(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  published_at: z.string().optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(350).optional().nullable(),
  canonical_url: z.string().max(400).optional().nullable(),
  og_image: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional(),
});
