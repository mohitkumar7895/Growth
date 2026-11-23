# Growth Realtech — Luxury Real Estate Consulting Platform & Dynamic CMS

Production-ready full-stack real estate consulting website and complete MySQL-backed dynamic CMS built for **Growth Realtech** (Noida, Greater Noida & Yamuna Expressway).

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (TSX), Tailwind CSS v4, Framer Motion, GSAP, Three.js / React Three Fiber, Lucide React, Next.js Image Optimization
- **Backend:** Next.js Route Handlers (API Routes), Node.js, `mysql2/promise` (strictly no Prisma), Zod Validation
- **Database:** MySQL (`growth` — 25 normalized relational tables with foreign keys, unique slugs, and indexes)
- **Authentication & Security:** `bcryptjs` password hashing, `jose` HS256 JWT tokens in HTTP-only cookies, Edge Middleware route protection, Role-Based Access Control (RBAC), rate limiting, and audit activity logs
- **Media Storage:** Configurable Cloudinary integration with automatic local `/public/uploads/` fallback
- **SEO:** Dynamic metadata per page/project/property/blog, Open Graph, JSON-LD (`RealEstateAgent`, `BreadcrumbList`, `Article`), dynamic `/sitemap.xml`, and `/robots.txt`

---

## Brand Palette

| Token | Hex |
| --- | --- |
| Primary Forest Green | `#164B34` |
| Deep Green | `#0C3323` |
| Secondary Green | `#246C49` |
| Luxury Gold | `#C6A66C` |
| Light Gold | `#E0C796` |
| Premium Cream | `#F6F7F2` |
| Dark Text | `#1C2921` |

All palette variables are dynamically editable in **Admin Dashboard → Settings & Appearance**.

---

## Setup & Installation

### 1. Prerequisites
- Node.js 20+ (`node -v`)
- Running MySQL 8.0+ / MariaDB 10.4+ server

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and update credentials:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=growth

JWT_SECRET=<generate-a-64-char-random-secret>
SESSION_COOKIE_NAME=gr_admin_session
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Used once by `npm run db:setup` to provision the initial Super Admin
ADMIN_SEED_NAME=Growth Realtech Super Admin
ADMIN_SEED_EMAIL=admin@growthrealtech.com
ADMIN_SEED_PASSWORD=<your-strong-password>

# Optional Cloudinary credentials (uses local /public/uploads if left blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. Initialize MySQL Database & Seed Initial Content
```bash
npm run db:setup
```
This script runs:
1. `database/schema.sql` — Creates the `growth` database and all 25 tables.
2. `database/seed.sql` — Seeds initial settings, navigation, all 14 dynamic homepage sections, 6 property categories, 6 reference featured projects (`Orion One32`, `Onyx by Splendor`, `ACE Starlit`, `ACE HAN'EI`, `DXN Orion`, `Gaur Alaris`), 8 searchable properties, 8 consulting services, 8 blog categories + starter articles, FAQs, legal pages, SEO metadata, media assets, and sample CRM analytics data.
3. Hashes `ADMIN_SEED_PASSWORD` with `bcryptjs` and provisions your initial **Super Admin** account.

### 5. Run Development Server
```bash
npm run dev
```
- **Live Website:** `http://localhost:3000`
- **Admin Login:** `http://localhost:3000/admin/login`
- **Admin Dashboard:** `http://localhost:3000/admin`

---

## Admin CMS Modules (20 Complete Modules)

1. **Dashboard Overview (`/admin`):** Live MySQL KPIs, Monthly Enquiry Trends, Lead Status Pie Chart, Location Demand Bar Chart, Recent Leads, Notifications & Activity Logs.
2. **Enquiries CRM (`/admin/enquiries`):** Search, filter, paginate, assign staff, set follow-up dates, internal notes, 6 lead pipeline statuses (`New`, `Contacted`, `Interested`, `Site Visit Scheduled`, `Converted`, `Closed`), one-click Call & WhatsApp.
3. **Contact Requests (`/admin/contacts`):** View and manage contact form submissions.
4. **Homepage & About CMS (`/admin/homepage`):** Edit Hero, About Us, Trust Pillars, Approach Steps, Why Choose, Investment Desk; add custom sections; reorder, hide, or delete sections.
5. **Navigation Menus (`/admin/navigation`):** Add, edit, delete, toggle CTA style, and reorder header/footer links.
6. **Property Management (`/admin/properties`):** Full CRUD, multi-image galleries, amenities, specifications, SEO, and instant indexing into Smart Property Search.
7. **Project Management (`/admin/projects`):** Full CRUD for flagship developments, `project_images` galleries, UP-RERA notes, PDF brochures, maps, and SEO.
8. **Property Categories (`/admin/categories`):** Add, edit, delete, and reorder property verticals.
9. **Services Management (`/admin/services`):** Full CRUD with Rich Text Editor, advisory highlights, and engagement workflows.
10. **Blogs & Insights (`/admin/blogs`):** Rich Text Editor, categories, tags, Draft/Published/Scheduled status, canonical URLs, and SEO.
11. **Testimonials (`/admin/testimonials`):** Manage verified client feedback, ratings, and publish state.
12. **FAQs (`/admin/faqs`):** Complete FAQ CRUD.
13. **Media Library (`/admin/media`):** Upload images, videos, and PDF brochures (Cloudinary or local `/uploads/`), search, edit alt text, copy URLs, delete files, and pick media directly from any editor.
14. **SEO & Sitemap (`/admin/seo`):** Page-wise meta titles, descriptions, keywords, OG images, robots directives, canonical URLs, and sitemap flags.
15. **Legal Pages (`/admin/legal`):** Edit Privacy Policy, Terms & Conditions, and Real Estate & RERA Disclaimer.
16. **Settings, Footer & Appearance (`/admin/settings`):** Brand identity, contact details, WhatsApp settings, top bar announcement, footer content, live theme color pickers, header style, and 3D/animation toggles.
17. **Users & Roles (`/admin/users`):** Manage Super Admin, Admin, Content Manager, and Sales Manager accounts plus granular role permissions matrix.
18. **Activity Logs (`/admin/logs`):** Filterable security and content audit trail.

---

## Production Build & Deployment

```bash
npm run typecheck
npm run build
npm run start
```

Deploy on any Node.js host (VPS/PM2, Docker, Railway, Render, or Vercel with managed MySQL such as PlanetScale/RDS/DigitalOcean MySQL). Ensure `JWT_SECRET`, `DB_*`, and `NEXT_PUBLIC_SITE_URL` are configured in your production environment.
