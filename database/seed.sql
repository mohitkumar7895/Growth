-- Growth Realtech Initial Dynamic CMS Seed Data
-- Database: growth

USE `growth`;

-- 1. Roles
INSERT IGNORE INTO `roles` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Super Admin', 'super_admin', 'Full unrestricted access to all modules, settings, users, and security controls.'),
(2, 'Admin', 'admin', 'Full operational management of website content, properties, projects, blogs, and leads.'),
(3, 'Content Manager', 'content_manager', 'Manages homepage sections, blogs, categories, services, FAQs, media, and SEO.'),
(4, 'Sales Manager', 'sales_manager', 'Manages client enquiries, contact submissions, follow-ups, and views properties/projects.');

-- 2. Permissions
INSERT IGNORE INTO `permissions` (`id`, `name`, `slug`, `module`, `description`) VALUES
(1, 'View Dashboard', 'dashboard.view', 'dashboard', 'Access dashboard analytics and overview'),
(2, 'Manage Settings', 'settings.manage', 'settings', 'Edit website settings, appearance, and footer'),
(3, 'Manage Homepage', 'homepage.manage', 'homepage', 'Edit, reorder, add, or hide homepage sections'),
(4, 'Manage Navigation', 'navigation.manage', 'navigation', 'Edit header and footer navigation menus'),
(5, 'Manage Properties', 'properties.manage', 'properties', 'Create, update, publish, and delete properties'),
(6, 'Manage Projects', 'projects.manage', 'projects', 'Create, update, publish, and delete projects'),
(7, 'Manage Categories', 'categories.manage', 'categories', 'Manage property categories'),
(8, 'Manage Services', 'services.manage', 'services', 'Manage consulting services'),
(9, 'Manage Testimonials', 'testimonials.manage', 'testimonials', 'Manage client testimonials'),
(10, 'Manage Blogs', 'blogs.manage', 'blogs', 'Create, edit, schedule, and publish blog articles'),
(11, 'Manage FAQs', 'faqs.manage', 'faqs', 'Manage frequently asked questions'),
(12, 'Manage Media', 'media.manage', 'media', 'Upload, edit alt text, and delete media assets'),
(13, 'Manage Enquiries', 'enquiries.manage', 'enquiries', 'View, assign, annotate, and update lead statuses'),
(14, 'Manage Contacts', 'contacts.manage', 'contacts', 'View and respond to contact form submissions'),
(15, 'Manage SEO', 'seo.manage', 'seo', 'Manage global and page-level SEO and sitemap settings'),
(16, 'Manage Legal Pages', 'legal.manage', 'legal', 'Edit Privacy Policy, Terms & Conditions, and Disclaimer'),
(17, 'Manage Users & Roles', 'users.manage', 'users', 'Create and manage admin accounts and role permissions'),
(18, 'View Activity Logs', 'logs.view', 'logs', 'Inspect system and admin audit activity logs');

-- 3. Role Permissions
-- Super Admin gets all
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Admin gets all except users.manage
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` WHERE slug <> 'users.manage';

-- Content Manager
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(3, 1), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 15), (3, 16);

-- Sales Manager
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(4, 1), (4, 13), (4, 14);

-- 4. Website Settings
INSERT INTO `website_settings` (`setting_key`, `setting_group`, `setting_value`, `value_type`) VALUES
('site_name', 'general', 'Growth Realtech', 'string'),
('site_tagline', 'general', 'Bespoke Real Estate Consulting Across Noida, Greater Noida & Yamuna Expressway', 'string'),
('logo_url', 'general', '/images/growth-realtech-logo.png', 'url'),
('favicon_url', 'general', '/images/growth-realtech-logo.png', 'url'),
('contact_phone', 'contact', '+91 82875 69844', 'string'),
('contact_email', 'contact', 'growthrealtechnoida@gmail.com', 'string'),
('contact_email_secondary', 'contact', 'care@growthrealtech.in', 'string'),
('contact_location', 'contact', 'Noida, Uttar Pradesh', 'string'),
('contact_address', 'contact', 'Noida, Uttar Pradesh, India — Serving Noida, Greater Noida, Greater Noida West & Yamuna Expressway', 'text'),
('whatsapp_number', 'contact', '918287569844', 'string'),
('whatsapp_default_message', 'contact', 'Hello Growth Realtech, I would like to request a personalised real estate consultation.', 'text'),
('business_timings', 'contact', 'Monday – Sunday: 9:30 AM – 7:30 PM IST (Site Visits by Appointment)', 'string'),
('google_maps_embed', 'contact', 'https://www.google.com/maps?q=Noida,Uttar+Pradesh,India&output=embed', 'url'),
('top_bar_announcement', 'topbar', 'Personalised Advisory for Residential, Commercial, Industrial & Expressway Opportunities in NCR', 'string'),
('top_bar_enabled', 'topbar', 'true', 'boolean'),
('social_facebook', 'social', 'https://facebook.com', 'url'),
('social_instagram', 'social', 'https://instagram.com', 'url'),
('social_linkedin', 'social', 'https://linkedin.com', 'url'),
('social_youtube', 'social', 'https://youtube.com', 'url'),
('footer_description', 'footer', 'Growth Realtech is a Noida-based real estate consulting brand guiding homebuyers, corporate occupiers, and investors across residential, commercial, industrial, and land opportunities in Noida, Greater Noida, and the Yamuna Expressway corridor.', 'text'),
('footer_copyright', 'footer', '© 2026 Growth Realtech. All rights reserved.', 'string'),
('footer_disclaimer_short', 'footer', 'All project visuals are conceptual architectural representations unless verified on site. Pricing, RERA registrations, and availability are subject to official developer documentation.', 'text'),
('color_primary', 'appearance', '#164B34', 'color'),
('color_deep', 'appearance', '#0C3323', 'color'),
('color_secondary', 'appearance', '#246C49', 'color'),
('color_gold', 'appearance', '#C6A66C', 'color'),
('color_light_gold', 'appearance', '#E0C796', 'color'),
('color_cream', 'appearance', '#F6F7F2', 'color'),
('color_dark_text', 'appearance', '#1C2921', 'color'),
('font_heading', 'appearance', 'Cormorant Garamond', 'string'),
('font_body', 'appearance', 'Plus Jakarta Sans', 'string'),
('button_style', 'appearance', 'luxury-sharp', 'string'),
('header_style', 'appearance', 'transparent-sticky', 'string'),
('footer_style', 'appearance', 'deep-emerald', 'string'),
('animations_enabled', 'appearance', 'true', 'boolean'),
('three_d_hero_enabled', 'appearance', 'true', 'boolean'),
('global_meta_title', 'seo', 'Growth Realtech | Real Estate Consultant in Noida, Greater Noida & Yamuna Expressway', 'string'),
('global_meta_description', 'seo', 'Growth Realtech offers personalised residential, commercial, industrial, plot, and investment real estate consulting across Noida, Greater Noida, and the Yamuna Expressway.', 'text'),
('global_og_image', 'seo', '/images/hero-skyline.jpg', 'url'),
('robots_txt_extra', 'seo', '', 'text'),
('sitemap_enabled', 'seo', 'true', 'boolean')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- 5. Navigation Menus
INSERT INTO `navigation_menus` (`id`, `label`, `url`, `location`, `sort_order`, `is_active`, `is_cta`) VALUES
(1, 'Home', '/', 'header', 1, 1, 0),
(2, 'Properties', '/properties', 'header', 2, 1, 0),
(3, 'Projects', '/projects', 'header', 3, 1, 0),
(4, 'Services', '/services', 'header', 4, 1, 0),
(5, 'About Us', '/about', 'header', 5, 1, 0),
(6, 'Our Approach', '/approach', 'header', 6, 1, 0),
(7, 'Insights', '/insights', 'header', 7, 1, 0),
(8, 'Contact', '/contact', 'header', 8, 1, 0),
(9, 'Enquire Now', '/contact#enquiry', 'header', 9, 1, 1),
(10, 'Home', '/', 'footer_quick', 1, 1, 0),
(11, 'Properties', '/properties', 'footer_quick', 2, 1, 0),
(12, 'Featured Projects', '/projects', 'footer_quick', 3, 1, 0),
(13, 'About Growth Realtech', '/about', 'footer_quick', 4, 1, 0),
(14, 'Our Approach', '/approach', 'footer_quick', 5, 1, 0),
(15, 'Insights & Blogs', '/insights', 'footer_quick', 6, 1, 0),
(16, 'Contact Us', '/contact', 'footer_quick', 7, 1, 0)
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`), `url` = VALUES(`url`);

-- 6. Homepage Sections (100% database-driven)
INSERT INTO `homepage_sections` (
  `section_key`, `section_type`, `title`, `subtitle`, `badge_text`, `description`, `content_json`,
  `image_url`, `video_url`, `cta_primary_label`, `cta_primary_url`, `cta_secondary_label`, `cta_secondary_url`,
  `background_style`, `sort_order`, `is_visible`, `status`
) VALUES
(
  'hero', 'hero',
  'Find the Right Property. Invest in Your Future.',
  'Noida • Greater Noida • Yamuna Expressway',
  'Premier Real Estate Advisory',
  'Discover exceptional residential, commercial and investment opportunities across Noida, Greater Noida and the Yamuna Expressway with Growth Realtech.',
  JSON_OBJECT(
    'enable3D', true,
    'overlayOpacity', 0.62,
    'scrollIndicatorText', 'Scroll to Explore',
    'stats', JSON_ARRAY(
      JSON_OBJECT('label', 'Corridors Covered', 'value', 'Noida & NCR'),
      JSON_OBJECT('label', 'Advisory Verticals', 'value', '6+ Asset Classes'),
      JSON_OBJECT('label', 'Consulting Standard', 'value', 'End-to-End Guidance')
    )
  ),
  '/images/hero-skyline.jpg', '',
  'Explore Opportunities', '/properties',
  'Book a Consultation', '/contact#enquiry',
  'deep-green', 1, 1, 'published'
),
(
  'property_search', 'property_search',
  'Curated Property Discovery',
  'Filter by asset class, micro-market, budget band, and objective',
  'Smart Search',
  'Search active residential, commercial, industrial, plotted, and pre-rented consulting opportunities tailored to your criteria.',
  JSON_OBJECT('showStatusFilter', true),
  '', '', 'Search Opportunities', '/properties', '', '',
  'cream', 2, 1, 'published'
),
(
  'trust_highlights', 'trust_highlights',
  'Built on Clarity, Market Discipline & Client Advocacy',
  'Why discerning buyers and investors consult Growth Realtech',
  'Our Pillars',
  'Every recommendation is anchored in transparent communication, grounded local insight, and structured transaction coordination.',
  JSON_OBJECT(
    'tagline', 'TRUST | TRANSPARENCY | SAFE INVESTMENT',
    'items', JSON_ARRAY(
      JSON_OBJECT('icon', 'Compass', 'title', 'Personalised Advisory', 'description', 'Tailored shortlists aligned to your purpose, horizon, and risk profile—never one-size-fits-all inventory pushing.'),
      JSON_OBJECT('icon', 'ShieldCheck', 'title', 'Transparent Process', 'description', 'Clear documentation checklists, RERA verification guidance, and straightforward fee and cost communication.'),
      JSON_OBJECT('icon', 'MapPinned', 'title', 'Local Market Focus', 'description', 'Deep ground-level understanding of Noida sectors, Greater Noida West, and the Yamuna Expressway growth corridor.'),
      JSON_OBJECT('icon', 'Handshake', 'title', 'End-to-End Support', 'description', 'Dedicated coordination from initial requirement discovery and site visits through evaluation and closure milestones.')
    )
  ),
  '', '', '', '', '', '',
  'white', 3, 1, 'published'
),
(
  'property_categories', 'property_categories',
  'Real Estate Verticals We Advise On',
  'Explore curated opportunities across every key asset class',
  'Property Categories',
  'From refined residences and Grade-A offices to industrial estates, plotted developments, and income-producing pre-rented assets.',
  JSON_OBJECT('columns', 3),
  '', '', 'View All Properties', '/properties', '', '',
  'cream', 4, 1, 'published'
),
(
  'featured_projects', 'featured_projects',
  'Signature Developments Across the Corridor',
  'Reference showcase of prominent commercial and residential destinations',
  'Featured Projects',
  'Explore notable developments across Noida, Greater Noida West, and the Yamuna Expressway. Project specifications, pricing, and UP-RERA details are verified with official documentation during your consultation.',
  JSON_OBJECT('showFilters', true, 'maxItems', 6),
  '', '', 'Explore All Projects', '/projects', 'Request Site Visit', '/contact#enquiry',
  'white', 5, 1, 'published'
),
(
  'about', 'about',
  'A Refined Standard of Real Estate Consulting in Noida',
  'About Growth Realtech',
  'The Brand',
  'Growth Realtech is a Noida-based real estate consulting brand helping clients navigate residential, commercial and investment property decisions with clarity, diligence, and personalised guidance.',
  JSON_OBJECT(
    'philosophy', 'We believe real estate decisions deserve thoughtful advisory rather than hurried sales pitches. Our practice centres on listening carefully, shortlisting selectively, and standing beside our clients at every step.',
    'mission', 'To empower homebuyers, businesses, and investors with transparent market intelligence, verified project evaluation, and responsive end-to-end consulting across Noida and NCR.',
    'vision', 'To be recognised as the most trusted, client-first real estate advisory partner across Noida, Greater Noida, and the emerging Yamuna Expressway corridor.',
    'commitment', 'Clear communication, disciplined property sourcing, RERA-conscious verification support, and steadfast representation of your long-term interests.'
  ),
  '/images/about-interior.jpg', '',
  'Discover Our Story', '/about',
  'Schedule an Advisory Call', '/contact#enquiry',
  'deep-green', 6, 1, 'published'
),
(
  'services', 'services',
  'Comprehensive Consulting Across Every Property Milestone',
  'Bespoke advisory designed around end-users, corporates, and investors',
  'Our Services',
  'Whether acquiring a residence, expanding commercial operations, leasing Grade-A space, or exiting an existing holding, our advisors bring structure and precision.',
  JSON_OBJECT('maxItems', 8),
  '', '', 'Explore All Services', '/services', '', '',
  'cream', 7, 1, 'published'
),
(
  'approach', 'approach',
  'A Disciplined Four-Step Advisory Methodology',
  'How we move from your brief to a well-evaluated decision',
  'Our Approach',
  'Our structured consulting process replaces guesswork with methodical discovery, curated sourcing, transparent evaluation, and seamless coordination.',
  JSON_OBJECT(
    'steps', JSON_ARRAY(
      JSON_OBJECT('number', '01', 'title', 'Understand Your Requirement', 'description', 'We begin with an in-depth consultation to clarify your objective, preferred micro-markets, budget comfort, timeline, and non-negotiable criteria.'),
      JSON_OBJECT('number', '02', 'title', 'Source Relevant Opportunities', 'description', 'Drawing on local market intelligence, we curate a focused shortlist of residential, commercial, industrial, or plotted options matching your brief.'),
      JSON_OBJECT('number', '03', 'title', 'Evaluate the Details', 'description', 'We arrange guided site visits and help you review developer credentials, connectivity, RERA registration details, layout efficiency, and total cost structure.'),
      JSON_OBJECT('number', '04', 'title', 'Coordinate Your Next Step', 'description', 'From developer or seller coordination to documentation checklists and handover readiness, we remain accessible throughout your decision journey.')
    )
  ),
  '', '', 'Learn More About Our Process', '/approach', '', '',
  'white', 8, 1, 'published'
),
(
  'why_choose', 'why_choose',
  'Why Discerning Clients Choose Growth Realtech',
  'Principles that shape every consultation we conduct',
  'The Growth Advantage',
  'Real estate is a high-conviction commitment. We earn trust through preparation, candour, and attentive execution.',
  JSON_OBJECT(
    'features', JSON_ARRAY(
      JSON_OBJECT('icon', 'UserCheck', 'title', 'Client-first Approach', 'description', 'Your requirements, budget discipline, and comfort pace dictate every shortlist and recommendation.'),
      JSON_OBJECT('icon', 'MessageSquareText', 'title', 'Transparent Communication', 'description', 'Straightforward discussions around strengths, trade-offs, documentation, and verification steps.'),
      JSON_OBJECT('icon', 'TrendingUp', 'title', 'Market-aware Consulting', 'description', 'Grounded perspective on infrastructure catalysts, sector connectivity, and micro-market livability.'),
      JSON_OBJECT('icon', 'HeartHandshake', 'title', 'Personalised Support', 'description', 'Dedicated advisor continuity from first phone call through site inspections and next steps.'),
      JSON_OBJECT('icon', 'Award', 'title', 'Professional Assistance', 'description', 'Structured coordination with developers, landlords, and channel stakeholders without friction.'),
      JSON_OBJECT('icon', 'Building', 'title', 'Property-focused Guidance', 'description', 'Objective evaluation of asset fundamentals—location, layout, access, and practical usability.')
    )
  ),
  '', '', '', '', '', '',
  'cream', 9, 1, 'published'
),
(
  'investment_opportunities', 'investment_opportunities',
  'Strategic Real Estate Investment Advisory',
  'Structured evaluation across high-attention NCR asset classes',
  'Investment Desk',
  'Explore commercial hubs, pre-rented assets, residential growth pockets, industrial land, and business spaces with objective market context. All real estate investments carry market risk; we focus on prudent diligence rather than speculative return claims.',
  JSON_OBJECT(
    'disclaimer', 'Real estate markets are subject to regulatory, economic, and location dynamics. Growth Realtech does not promise or guarantee fixed returns.',
    'highlights', JSON_ARRAY(
      JSON_OBJECT('title', 'Commercial Opportunities', 'description', 'IT/ITES offices, business suites, and high-visibility retail corridors along the Noida-Greater Noida Expressway.', 'tag', 'Expressway & Sector Nodes'),
      JSON_OBJECT('title', 'Pre-rented Assets', 'description', 'Operational commercial spaces with existing lease profiles evaluated for tenant quality, lock-in terms, and documentation.', 'tag', 'Lease-Evaluated'),
      JSON_OBJECT('title', 'Residential Investments', 'description', 'Well-connected residential communities in emerging sectors backed by civic infrastructure and end-user livability.', 'tag', 'End-User Driven'),
      JSON_OBJECT('title', 'Industrial Land', 'description', 'Industrial plots and logistics warehousing zones along Yamuna Expressway and Greater Noida industrial belts.', 'tag', 'Logistics & Manufacturing'),
      JSON_OBJECT('title', 'Business Spaces', 'description', 'Flexible office floors, studio suites, and boutique corporate addresses for growing enterprises.', 'tag', 'Corporate Occupancy')
    )
  ),
  '/images/category-investment.jpg', '',
  'Request Investment Consultation', '/contact#enquiry',
  'Browse Investment Listings', '/properties?purpose=Investment',
  'deep-green', 10, 1, 'published'
),
(
  'testimonials', 'testimonials',
  'Words From Clients We Have Advised',
  'Client perspectives on working with Growth Realtech',
  'Client Experiences',
  'Genuine feedback from families, business owners, and property buyers guided through Noida and Greater Noida.',
  JSON_OBJECT('maxItems', 3),
  '', '', '', '', '', '',
  'white', 11, 1, 'published'
),
(
  'blogs', 'blogs',
  'Market Perspectives & Buying Guides',
  'Informed reading on Noida, Greater Noida & Yamuna Expressway real estate',
  'Insights & Research',
  'Stay updated with practical guides on property diligence, UP-RERA checks, commercial corridors, and regional infrastructure updates.',
  JSON_OBJECT('maxItems', 3),
  '', '', 'Read All Insights', '/insights', '', '',
  'cream', 12, 1, 'published'
),
(
  'faqs', 'faqs',
  'Frequently Asked Questions',
  'Clear answers on how we work, locations covered, and verification practices',
  'Advisory FAQ',
  'Everything you need to know before beginning your property search or consultation with Growth Realtech.',
  JSON_OBJECT('maxItems', 8),
  '', '', 'Have Another Question? Contact Us', '/contact', '', '',
  'white', 13, 1, 'published'
),
(
  'contact', 'contact',
  'Begin Your Property Conversation',
  'Speak directly with a Growth Realtech advisor in Noida',
  'Private Consultation',
  'Share your requirements for residential, commercial, industrial, plotted, or pre-rented properties and receive a structured advisory response.',
  JSON_OBJECT('showMap', true, 'showWhatsApp', true),
  '', '', 'Submit Consultation Request', '/contact', '', '',
  'cream', 14, 1, 'published'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `content_json` = VALUES(`content_json`);

-- 7. Property Categories
INSERT INTO `property_categories` (
  `id`, `name`, `slug`, `short_description`, `description`, `image_url`, `icon_name`, `sort_order`, `is_active`, `is_featured`, `meta_title`, `meta_description`
) VALUES
(1, 'Residential Properties', 'residential-properties', 'Thoughtfully selected apartments, penthouses, and family residences across prime Noida & Greater Noida sectors.', 'Explore luxury apartments, low-density gated residences, and ready or developing family homes curated for livability, connectivity, and builder track record.', '/images/category-residential.jpg', 'Home', 1, 1, 1, 'Residential Properties in Noida & Greater Noida | Growth Realtech', 'Explore residential apartments and homes across Noida, Greater Noida, and Greater Noida West with Growth Realtech.'),
(2, 'Commercial Properties', 'commercial-properties', 'Grade-A office suites, high-street retail spaces, and corporate hubs along major expressway corridors.', 'Discover business spaces, IT/ITES office floors, and retail destinations positioned for visibility, transit access, and institutional infrastructure.', '/images/category-commercial.jpg', 'Building2', 2, 1, 1, 'Commercial Properties in Noida | Growth Realtech', 'Commercial office spaces and retail opportunities along Noida Expressway and key business districts.'),
(3, 'Industrial Properties', 'industrial-properties', 'Industrial plots, factory units, and logistics warehousing spaces in planned NCR industrial corridors.', 'Structured advisory for manufacturing setups, warehousing facilities, and authority-planned industrial sectors across Greater Noida and Yamuna Expressway.', '/images/category-industrial.jpg', 'Factory', 3, 1, 1, 'Industrial Property Consultant Noida & Yamuna Expressway | Growth Realtech', 'Industrial plots, warehouses, and manufacturing spaces in Noida, Greater Noida, and Yamuna Expressway.'),
(4, 'Plots & Land', 'plots-and-land', 'Authority-planned residential plots, township parcels, and strategic land opportunities with clear diligence.', 'Guided acquisition and evaluation of residential plots, mixed-use land parcels, and plotted developments across Noida, Greater Noida, and the Jewar region.', '/images/category-plots.jpg', 'Map', 4, 1, 1, 'Plots & Land in Noida and Yamuna Expressway | Growth Realtech', 'Find verified residential plots and strategic land opportunities across Greater Noida and Yamuna Expressway.'),
(5, 'Pre-rented Properties', 'pre-rented-properties', 'Operational commercial and retail units with existing tenant profiles and lease documentation review.', 'Consultative sourcing of pre-leased retail and office properties with focus on tenant credentials, lease tenure, and micro-market demand.', '/images/category-prerented.jpg', 'KeyRound', 5, 1, 1, 'Pre-rented Properties in Noida | Growth Realtech', 'Evaluate pre-rented commercial and office assets in Noida and NCR with transparent lease guidance.'),
(6, 'Investment Opportunities', 'investment-opportunities', 'Curated real estate opportunities across emerging infrastructure corridors evaluated on fundamentals.', 'Explore diversified residential, commercial, and land opportunities positioned along high-growth NCR infrastructure corridors with transparent advisory.', '/images/category-investment.jpg', 'Landmark', 6, 1, 1, 'Real Estate Investment Consulting Noida | Growth Realtech', 'Strategic real estate investment consulting across Noida, Greater Noida, and the Yamuna Expressway.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `image_url` = VALUES(`image_url`);

-- 8. Featured Projects (Reference Projects with Verified-on-Consultation Integrity)
INSERT INTO `projects` (
  `id`, `name`, `slug`, `category`, `property_category_id`, `developer_name`, `location`, `sector`, `region_filter`,
  `short_description`, `description`, `featured_image`, `rera_number`, `rera_status_note`,
  `price_range`, `configuration`, `project_status`, `amenities_json`, `specifications_json`,
  `map_embed_url`, `brochure_url`, `official_website_url`, `is_featured`, `status`, `sort_order`,
  `meta_title`, `meta_description`
) VALUES
(
  1, 'Orion One32', 'orion-one32', 'Commercial', 2, 'Wellgrow Infotech / Orion Group (Reference)',
  'Sector 132, Noida', 'Sector 132', 'Noida',
  'A landmark mixed-use commercial and IT/ITES destination strategically positioned along the Noida-Greater Noida Expressway.',
  '<p>Orion One32 is a prominent commercial development located in Sector 132 along the Noida-Greater Noida Expressway, positioned amidst established corporate campuses, educational institutions, and dense residential catchments.</p><p>The development integrates contemporary IT/ITES office spaces with landscaped retail plazas designed for modern business ecosystems. Growth Realtech assists clients with current inventory orientation, floor plate suitability, and verification of official developer documentation and UP-RERA filings prior to any commitment.</p><p><em>Advisory Note: All pricing, current unit availability, delivery schedules, and RERA registration particulars are confirmed strictly against official developer disclosures during consultation.</em></p>',
  '/images/projects/orion-one32.jpg',
  'Verify official UP-RERA registration during consultation',
  'Reference project showcase — official UP-RERA details and developer disclosures verified on enquiry.',
  'Price on Request', 'IT/ITES Office Spaces & High-Street Retail (Enquire for Sizes)',
  'Enquire for Latest Status',
  JSON_ARRAY('Noida Expressway Connectivity', 'Contemporary Architectural Facade', 'Multi-level Parking Provision', 'Landscaped Open Courtyards', '24x7 Security & Access Control', 'High-Speed Elevators'),
  JSON_OBJECT('Location Corridor', 'Noida-Greater Noida Expressway', 'Sector', 'Sector 132, Noida', 'Asset Class', 'Commercial / IT-ITES & Retail', 'Verification', 'Official UP-RERA & Developer Documents Reviewed on Request'),
  'https://www.google.com/maps?q=Sector+132,Noida,Uttar+Pradesh&output=embed', '', '', 1, 'published', 1,
  'Orion One32 Sector 132 Noida | Commercial Consulting by Growth Realtech',
  'Explore commercial office and retail consulting for Orion One32 in Sector 132, Noida with Growth Realtech.'
),
(
  2, 'Onyx by Splendor', 'onyx-by-splendor', 'Commercial', 2, 'Splendor Group (Reference)',
  'Sector 142, Noida', 'Sector 142', 'Noida',
  'Contemporary commercial office and retail destination near Sector 142 Metro Station on the Noida Expressway.',
  '<p>Onyx by Splendor in Sector 142, Noida sits along one of the most active IT and corporate hubs of the Noida-Greater Noida Expressway, benefiting from proximity to the Sector 142 Aqua Line Metro connectivity.</p><p>Designed to cater to modern enterprises, consulting firms, and curated retail operators, the project attracts both end-user corporate occupiers and commercial investors. Connect with Growth Realtech for a guided evaluation, site tour, and verification of current official specifications.</p>',
  '/images/projects/onyx-by-splendor.jpg',
  'Verify official UP-RERA registration during consultation',
  'Reference project showcase — official UP-RERA details and developer disclosures verified on enquiry.',
  'Price on Request', 'Commercial Office Spaces & Retail Units (Enquire for Details)',
  'Enquire for Latest Status',
  JSON_ARRAY('Proximity to Sector 142 Metro', 'Expressway Frontage Access', 'Modern Glass Elevation', 'Power Backup & BMS Infrastructure', 'Dedicated Drop-off Zones', 'Business-friendly Floor Plates'),
  JSON_OBJECT('Location Corridor', 'Sector 142 IT Hub, Noida Expressway', 'Transit', 'Near Sector 142 Metro Station', 'Asset Class', 'Commercial Offices & Retail', 'Verification', 'Official Developer & UP-RERA Check on Request'),
  'https://www.google.com/maps?q=Sector+142,Noida,Uttar+Pradesh&output=embed', '', '', 1, 'published', 2,
  'Onyx by Splendor Sector 142 Noida | Growth Realtech Advisory',
  'Request commercial consulting, site visit, and verified documentation guidance for Onyx by Splendor, Sector 142, Noida.'
),
(
  3, 'Group 108 Project', 'group-108-project', 'Commercial', 2, 'Group 108 (Reference)',
  'Sector 142, Noida & Greater Noida West', 'Sector 142 / Techzone 4', 'Noida',
  'Landmark iconic twin-tower IT/ITES commercial and high-street retail developments by Group 108 across Noida & NCR.',
  '<p>Group 108 developments—including iconic twin-tower IT/ITES office spaces, waterfront-inspired high-street retail, and modern lifestyle plazas across Sector 142 Noida Expressway and Greater Noida West—stand out for architectural scale and business-ready infrastructure.</p><p>Designed for enterprises, retail brands, and discerning commercial evaluators, Group 108 projects combine strong expressway connectivity with integrated dining and workspace amenities. Growth Realtech assists with layout comparisons, site tours, and transparent verification of official UP-RERA filings.</p>',
  '/images/projects/group-108-1.png',
  'Verify official UP-RERA registration during consultation',
  'Reference project showcase — official UP-RERA details and developer disclosures verified on enquiry.',
  'Price on Request', 'IT/ITES Office Spaces & High-Street Retail (Enquire for Configurations)',
  'Enquire for Latest Status',
  JSON_ARRAY('Iconic Twin-Tower Architecture', 'High-Street Retail & Dining Plazas', 'Expressway & Metro Corridor Connectivity', 'Modern Glass Facade & Sky Decks', 'Multi-Level Basement Parking', '24x7 Managed Security & BMS'),
  JSON_OBJECT('Developer', 'Group 108', 'Key Corridors', 'Sector 142 Noida Expressway & Greater Noida West', 'Asset Class', 'Commercial / IT-ITES & High-Street Retail', 'Verification', 'Official UP-RERA & Brochure Verification Provided'),
  'https://www.google.com/maps?q=Sector+142,Noida,Uttar+Pradesh&output=embed', '', '', 1, 'published', 3,
  'Group 108 Project Noida | Commercial Advisory by Growth Realtech',
  'Discover commercial consulting, office floors, and high-street retail opportunities in Group 108 projects across Noida with Growth Realtech.'
),
(
  4, 'KB West Walk', 'kb-west-walk', 'Commercial', 2, 'Shree KB Group (Reference)',
  'Greater Noida West', 'Sector Ecotech-12, Greater Noida West', 'Greater Noida',
  'A modern mixed-use high-street retail, dining, entertainment, and luxury studio destination in Greater Noida West.',
  '<p>KB West Walk is a landmark mixed-use commercial development positioned at Plot C-3, Sector Ecotech-12 near Ek Murti Chowk in Greater Noida West, enjoying wide road-junction visibility along the 130-meter corridor.</p><p>Integrating multi-level high-street retail storefronts, fine-dining food courts, entertainment zones, a sunlit central atrium, and contemporary studio suites, KB West Walk serves a dense surrounding residential catchment. Connect with Growth Realtech for guided site walkthroughs, unit comparisons, and official UP-RERA verification.</p>',
  '/images/projects/kb-west-walk-2.jpg',
  'Verify official UP-RERA registration during consultation',
  'Reference project showcase — official UP-RERA details and developer disclosures verified on enquiry.',
  'Price on Request', 'High-Street Retail Shops, Food Court & Luxury Studio Suites (Enquire for Layouts)',
  'Enquire for Latest Status',
  JSON_ARRAY('Prime 130m Road Junction Visibility', 'Sunlit Grand Central Atrium', 'High-Street Retail & Hypermarket Zone', 'Fine-Dining Food Court & Multiplex', 'Rooftop Amenities & High-Speed Elevators', 'Multi-Level Basement Parking'),
  JSON_OBJECT('Micro-market', 'Sector Ecotech-12, Greater Noida West', 'Asset Class', 'Mixed-Use Commercial & Studio Suites', 'Connectivity', 'Near Ek Murti Chowk & Proposed Metro Corridor', 'Verification', 'Official Developer & UP-RERA Check on Request'),
  'https://www.google.com/maps?q=KB+West+Walk,Greater+Noida+West,Uttar+Pradesh&output=embed', '', '', 1, 'published', 4,
  'KB West Walk Greater Noida West | Growth Realtech Consulting',
  'Enquire with Growth Realtech for commercial retail and studio consulting, layouts, and site visits at KB West Walk, Greater Noida West.'
),
(
  5, 'DXN Orion', 'dxn-orion', 'Residential', 1, 'Orion Group (Reference)',
  'Sector 22D, Yamuna Expressway', 'Sector 22D, Yamuna Expressway', 'Yamuna Expressway',
  'Modern high-rise luxury residences positioned along the fast-emerging Sector 22D Yamuna Expressway corridor.',
  '<p>DXN Orion is positioned in Sector 22D along the Yamuna Expressway corridor, a region witnessing significant long-term infrastructure attention due to regional aviation, industrial, and institutional planning.</p><p>Growth Realtech helps homebuyers and long-term evaluators examine location fundamentals, tower layouts, access roads, surrounding township development, and official UP-RERA regulatory filings before making any decision.</p>',
  '/images/projects/dxn-orion.jpg',
  'Verify official UP-RERA registration during consultation',
  'Reference project showcase — official UP-RERA details and developer disclosures verified on enquiry.',
  'Price on Request', 'Luxury 3 & 4 BHK Residences (Enquire for Options)',
  'Enquire for Latest Status',
  JSON_ARRAY('Yamuna Expressway Corridor Access', 'Contemporary High-Rise Architecture', 'Landscaped Gardens & Sports Courts', 'Resident Clubhouse & Pool', 'Planned YEIDA Sector Infrastructure', '24x7 Gated Security'),
  JSON_OBJECT('Corridor', 'Sector 22D, Yamuna Expressway', 'Region', 'Greater Noida / YEIDA Influence Belt', 'Asset Class', 'Luxury Residential', 'Verification', 'Official Regulatory & RERA Review on Request'),
  'https://www.google.com/maps?q=Sector+22D,Yamuna+Expressway,Uttar+Pradesh&output=embed', '', '', 1, 'published', 5,
  'DXN Orion Yamuna Expressway | Growth Realtech Advisory',
  'Explore residential real estate guidance for DXN Orion in Sector 22D along the Yamuna Expressway with Growth Realtech.'
),
(
  6, 'Gaur Alaris', 'gaur-alaris', 'Residential', 1, 'Gaurs Group (Reference)',
  'Sector 22D, Yamuna Expressway', 'Sector 22D, Yamuna Expressway', 'Yamuna Expressway',
  'Contemporary residential living situated within the rapidly evolving Sector 22D Yamuna Expressway township ecosystem.',
  '<p>Gaur Alaris represents modern residential living in Sector 22D along the Yamuna Expressway belt, offering connectivity to major expressway corridors, institutional hubs, and the upcoming airport influence region.</p><p>Our advisors provide balanced perspective on end-use suitability, neighbourhood infrastructure progress, official RERA details, and unit configurations through a transparent consultation process.</p>',
  '/images/projects/gaur-alaris.webp',
  'Verify official UP-RERA registration during consultation',
  'Reference project showcase — official UP-RERA details and developer disclosures verified on enquiry.',
  'Price on Request', 'Modern 3 & 4 BHK Residences (Enquire for Configurations)',
  'Enquire for Latest Status',
  JSON_ARRAY('Integrated Township Ecosystem', 'Landscaped Parks & Walkways', 'Clubhouse & Community Spaces', 'Expressway Connectivity', 'Gated Residential Security', 'Sports & Leisure Facilities'),
  JSON_OBJECT('Corridor', 'Sector 22D, Yamuna Expressway', 'Asset Class', 'Residential', 'Advisory Focus', 'End-Use & Long-Term Corridor Evaluation', 'Verification', 'Official UP-RERA & Developer Verification on Request'),
  'https://www.google.com/maps?q=Sector+22D,Yamuna+Expressway,Uttar+Pradesh&output=embed', '', '', 1, 'published', 6,
  'Gaur Alaris Yamuna Expressway | Growth Realtech Residential Advisory',
  'Get personalised consulting and verified information on Gaur Alaris along the Yamuna Expressway with Growth Realtech.'
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `featured_image` = VALUES(`featured_image`);

-- Project Gallery Images (Actual Project Elevations & Views)
INSERT IGNORE INTO `project_images` (`id`, `project_id`, `image_url`, `alt_text`, `caption`, `sort_order`) VALUES
(1, 1, '/images/projects/orion-one32.jpg', 'Orion One32 Sector 132 Noida Elevation', 'Orion One32 — Sector 132, Noida Expressway Exterior Elevation', 1),
(2, 1, '/images/projects/orion-one32-2.jpg', 'Orion One32 Aerial View', 'Orion One32 — IT/ITES Office, Studio & Retail Master View', 2),
(3, 1, '/images/projects/orion-one32-3.jpg', 'Orion One32 High Street Retail Entrance', 'Orion One32 — European High-Street Retail Entrance', 3),
(4, 2, '/images/projects/onyx-by-splendor.jpg', 'Onyx by Splendor Sector 142 Noida', 'Onyx by Splendor — Sector 142, Noida Twilight Elevation', 1),
(5, 2, '/images/projects/onyx-blue-2.jpg', 'Onyx by Splendor Plaza & Facade', 'Onyx by Splendor — Landscaped Commercial Plaza & Facade', 2),
(6, 2, '/images/projects/onyx-by-splendor-2.jpg', 'Onyx by Splendor Noida Corridor View', 'Onyx by Splendor — Noida Expressway Commercial Hub View', 3),
(7, 3, '/images/projects/group-108-1.png', 'Group 108 Project Iconic Twin Towers', 'Group 108 Project — Iconic Twin Towers & Commercial Elevation', 1),
(8, 3, '/images/projects/group-108-2.png', 'Group 108 Waterfront Retail Plaza', 'Group 108 Project — Waterfront-Inspired High-Street Retail Plaza', 2),
(9, 3, '/images/projects/group-108-3.png', 'Group 108 Commercial Promenade', 'Group 108 Project — Flagship Retail & Business Promenade', 3),
(10, 4, '/images/projects/kb-west-walk-2.jpg', 'KB West Walk Greater Noida West Main Entrance', 'KB West Walk — Greater Noida West Main Entrance & Facade', 1),
(11, 4, '/images/projects/kb-west-walk.jpg', 'KB West Walk Aerial Night Elevation', 'KB West Walk — Greater Noida West Aerial Night Elevation', 2),
(12, 4, '/images/projects/kb-west-walk-3.jpg', 'KB West Walk Retail Promenade', 'KB West Walk — High-Street Retail Plaza & Boulevard', 3),
(13, 5, '/images/projects/dxn-orion.jpg', 'DXN Orion Yamuna Expressway Elevation', 'DXN Orion — Sector 22D, Yamuna Expressway Twilight Towers Elevation', 1),
(14, 5, '/images/projects/dxn-orion-3.webp', 'DXN Orion Aerial Master View', 'DXN Orion — Yamuna Expressway Aerial Township Perspective', 2),
(15, 5, '/images/projects/dxn-orion-2.jpg', 'DXN Orion Landscaped Court View', 'DXN Orion — Landscaped Recreation & Tower View', 3),
(16, 6, '/images/projects/gaur-alaris.webp', 'Gaur Alaris Yamuna Expressway Elevation', 'Gaur Alaris — Sector 22D, Yamuna Expressway Illuminated Towers', 1),
(17, 6, '/images/projects/gaur-alaris-2.webp', 'Gaur Alaris Yamuna Expressway Corridor View', 'Gaur Alaris — Landmark Living on Yamuna Expressway', 2),
(18, 6, '/images/projects/gaur-alaris-3.webp', 'Gaur Alaris Interior Residence', 'Gaur Alaris — Contemporary Luxury Residence Interior', 3);

-- 9. Properties (Powering Smart Property Search with real DB records)
INSERT INTO `properties` (
  `id`, `title`, `slug`, `category_id`, `property_type`, `location`, `sector`, `city`,
  `budget_range`, `price_display`, `purpose`, `property_status`, `area_size`, `configuration`,
  `short_description`, `description`, `specifications_json`, `amenities_json`,
  `featured_image`, `gallery_json`, `is_featured`, `status`, `meta_title`, `meta_description`
) VALUES
(
  1, 'Expressway View Luxury Residences — Sector 150 / 152 Belt', 'expressway-luxury-residences-noida',
  1, 'Residential', 'Noida', 'Sector 152', 'Noida',
  '₹2–5 Crore', 'Price on Request', 'End Use', 'Available for Consultation',
  'Enquire for Carpet & Super Area', '3 & 4 BHK Luxury Residences',
  'Curated low-density luxury residential apartments along the green Noida-Greater Noida Expressway belt.',
  '<p>Designed for families prioritizing open greens, low-density planning, and swift access to Noida corporate corridors. Our advisors compare tower orientation, maintenance standards, and verified RERA status across shortlisted options.</p>',
  JSON_OBJECT('Corridor', 'Noida Expressway', 'Occupancy Suitability', 'End Use & Family Living', 'Documentation', 'UP-RERA & Title Diligence Assisted'),
  JSON_ARRAY('Clubhouse', 'Landscaped Central Greens', '24x7 Tiered Security', 'Covered Parking', 'Fitness & Wellness Zone'),
  '/images/project-luxury-residences.jpg',
  JSON_ARRAY('/images/project-luxury-residences.jpg', '/images/about-interior.jpg', '/images/category-residential.jpg'),
  1, 'published', 'Luxury Residences on Noida Expressway | Growth Realtech',
  'Explore 3 & 4 BHK luxury residential opportunities along the Noida Expressway with Growth Realtech.'
),
(
  2, 'Grade-A IT/ITES Office Floor — Sector 132 & 142 Corridor', 'grade-a-office-suite-noida-expressway',
  2, 'Commercial', 'Noida', 'Sector 132', 'Noida',
  '₹1–2 Crore', 'Price on Request', 'Business Use', 'Ready / Developing Options',
  'Flexible Commercial Suites', 'Lockable & Open Office Suites',
  'Modern corporate office spaces along the Noida Expressway IT corridor with metro and arterial connectivity.',
  '<p>Ideal for growing enterprises, professional practices, and commercial asset evaluators seeking Grade-A specifications near Sector 132 and Sector 142 corporate nodes.</p>',
  JSON_OBJECT('Location', 'Sector 132 / 142, Noida', 'Building Grade', 'Contemporary Commercial IT Park', 'Connectivity', 'Noida Expressway & Aqua Line Metro'),
  JSON_ARRAY('High-Speed Elevators', '100% Power Backup Provision', 'Central Air Conditioning', 'Multi-level Parking', 'Cafeteria & Business Lounge'),
  '/images/project-commercial-plaza.jpg',
  JSON_ARRAY('/images/project-commercial-plaza.jpg', '/images/category-commercial.jpg'),
  1, 'published', 'Commercial Office Space in Sector 132 & 142 Noida | Growth Realtech',
  'Grade-A commercial office suites on Noida Expressway advised by Growth Realtech.'
),
(
  3, 'High-Street Retail & Pre-Rented Opportunity — Noida Commercial Hub', 'pre-rented-retail-noida-hub',
  5, 'Pre-rented / Investment', 'Noida', 'Sector 142', 'Noida',
  '₹2–5 Crore', 'Price on Request', 'Rental Income', 'Operational / Pre-leased',
  'Enquire for Unit Area', 'Ground & First Floor Retail / Office',
  'Carefully evaluated pre-leased commercial options with transparent review of lease agreements and tenant profiles.',
  '<p>We assist buyers in reviewing lease tenure, lock-in clauses, escalation terms, and catchment footfall fundamentals—without speculative promises.</p>',
  JSON_OBJECT('Asset Profile', 'Pre-rented Commercial', 'Review Scope', 'Lease Agreement & Title Review Support', 'Location', 'Noida Commercial Nodes'),
  JSON_ARRAY('High Visibility Frontage', 'Established Catchment', 'Managed Facility Maintenance', 'Ample Visitor Parking'),
  '/images/category-prerented.jpg',
  JSON_ARRAY('/images/category-prerented.jpg', '/images/category-commercial.jpg'),
  1, 'published', 'Pre-rented Commercial Property in Noida | Growth Realtech',
  'Explore pre-rented commercial spaces in Noida with Growth Realtech.'
),
(
  4, 'Spacious Family Apartments — Greater Noida West', 'family-apartments-greater-noida-west',
  1, 'Residential', 'Greater Noida West', 'Sector 12 / Techzone IV', 'Greater Noida',
  '₹1–2 Crore', 'Price on Request', 'End Use', 'Available for Consultation',
  'Enquire for Floor Plans', '3 & 4 BHK Modern Residences',
  'Well-planned residential communities in Greater Noida West offering spacious layouts and social infrastructure.',
  '<p>Shortlisted gated developments in Greater Noida West selected for practical room dimensions, family amenities, and improving NCR connectivity.</p>',
  JSON_OBJECT('Micro-market', 'Greater Noida West', 'Ideal For', 'End-User Families', 'Advisory', 'Layout & Cost Sheet Comparison'),
  JSON_ARRAY('Gated Community', 'Children Play Zones', 'Swimming Pool', 'Community Clubhouse', 'Power Backup'),
  '/images/category-residential.jpg',
  JSON_ARRAY('/images/category-residential.jpg', '/images/about-interior.jpg'),
  1, 'published', 'Residential Apartments in Greater Noida West | Growth Realtech',
  'Find spacious 3 & 4 BHK apartments in Greater Noida West with Growth Realtech.'
),
(
  5, 'Authority-Planned Residential Plots — Yamuna Expressway Belt', 'residential-plots-yamuna-expressway',
  4, 'Plots & Land', 'Yamuna Expressway', 'YEIDA Sectors', 'Greater Noida',
  '₹50 Lakh – ₹1 Crore', 'Price on Request', 'Investment', 'Available for Consultation',
  'Multiple Plot Sizes Available', 'Authority & Township Residential Plots',
  'Planned residential plots along the Yamuna Expressway with structured documentation and site inspection guidance.',
  '<p>Navigate residential plot opportunities in the Yamuna Expressway corridor with grounded checks on sector development progress, approach roads, and transfer documentation.</p>',
  JSON_OBJECT('Corridor', 'Yamuna Expressway', 'Property Type', 'Residential Plots', 'Verification', 'Allotment & Transfer Process Guidance'),
  JSON_ARRAY('Wide Planned Roads', 'Green Belt Buffers', 'Expressway Connectivity', 'Planned Civic Infrastructure'),
  '/images/category-plots.jpg',
  JSON_ARRAY('/images/category-plots.jpg', '/images/category-investment.jpg'),
  1, 'published', 'Residential Plots on Yamuna Expressway | Growth Realtech',
  'Explore authority and township plots along the Yamuna Expressway with Growth Realtech.'
),
(
  6, 'Industrial & Logistics Land Parcel — Jewar / Airport Region', 'industrial-logistics-parcel-jewar-region',
  3, 'Industrial', 'Jewar / Airport Region', 'YEIDA Industrial Belt', 'Greater Noida',
  '₹5–10 Crore', 'Price on Request', 'Business Use', 'Available for Consultation',
  'Custom Industrial Plot Sizes', 'Industrial & Warehousing Plots',
  'Strategic industrial and warehousing plots in the Yamuna Expressway and Jewar airport influence belt.',
  '<p>Tailored industrial property consulting for manufacturing units, warehousing operators, and logistics companies evaluating Greater Noida and Yamuna Expressway industrial sectors.</p>',
  JSON_OBJECT('Zone', 'Yamuna Expressway / Jewar Region', 'Suitable For', 'Manufacturing, Warehousing & Logistics', 'Support', 'Zoning & Compliance Orientation'),
  JSON_ARRAY('Expressway Freight Access', 'Wide Industrial Roads', 'Planned Utility Corridors', 'Clear Industrial Zoning'),
  '/images/category-industrial.jpg',
  JSON_ARRAY('/images/category-industrial.jpg', '/images/category-investment.jpg'),
  1, 'published', 'Industrial Plots near Jewar & Yamuna Expressway | Growth Realtech',
  'Industrial land and logistics warehousing consulting along Yamuna Expressway and Jewar region.'
),
(
  7, 'Curated Resale Luxury Residence — Central Noida', 'resale-luxury-residence-central-noida',
  1, 'Resale', 'Noida', 'Central Noida', 'Noida',
  '₹2–5 Crore', 'Price on Request', 'End Use', 'Ready to Move',
  'Verified Ready Inventory', 'Ready 3 & 4 BHK Resale Homes',
  'Ready-to-move luxury resale apartments in established Central Noida sectors with immediate livability.',
  '<p>For buyers seeking immediate possession in mature neighbourhoods with established schools, hospitals, and metro access, we coordinate verified resale visits and smooth transfer workflows.</p>',
  JSON_OBJECT('Category', 'Resale Residential', 'Status', 'Ready to Move', 'Service', 'End-to-End Resale Coordination'),
  JSON_ARRAY('Established Neighbourhood', 'Immediate Livability', 'Metro Connectivity', 'Gated Society Amenities'),
  '/images/about-interior.jpg',
  JSON_ARRAY('/images/about-interior.jpg', '/images/category-residential.jpg'),
  0, 'published', 'Ready Resale Luxury Homes in Central Noida | Growth Realtech',
  'Buy or sell verified ready-to-move luxury resale residences in Noida with Growth Realtech.'
),
(
  8, 'Corporate Headquarters & Large-Format Commercial Floor — Delhi NCR', 'corporate-commercial-floor-delhi-ncr',
  2, 'Commercial', 'Delhi NCR', 'Noida / NCR Business Corridor', 'Noida',
  'Above ₹10 Crore', 'Price on Request', 'Business Use', 'Available for Consultation',
  'Large Contiguous Floor Plates', 'Full Floor / Institutional Commercial',
  'Large-format commercial office floors for corporate headquarters, GCCs, and institutional investors across Noida and Delhi NCR.',
  '<p>Bespoke transaction advisory for institutional buyers and corporate occupiers requiring large contiguous floor plates, high parking ratios, and Grade-A sustainability certifications.</p>',
  JSON_OBJECT('Target Occupier', 'Corporates & Institutional Investors', 'Region', 'Noida & Delhi NCR', 'Format', 'Contiguous Commercial Floor Plates'),
  JSON_ARRAY('Grade-A Infrastructure', 'High Parking Ratio', 'LEED-oriented Design', '24x7 Corporate Security'),
  '/images/category-commercial.jpg',
  JSON_ARRAY('/images/category-commercial.jpg', '/images/project-commercial-plaza.jpg'),
  0, 'published', 'Large Commercial Office Floors in Noida & Delhi NCR | Growth Realtech',
  'Institutional and corporate commercial floor advisory across Noida and Delhi NCR.'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `featured_image` = VALUES(`featured_image`);

-- 10. Services (All 8 Required Services)
INSERT INTO `services` (
  `id`, `title`, `slug`, `short_description`, `description`, `icon_name`, `featured_image`,
  `highlights_json`, `process_json`, `sort_order`, `is_featured`, `status`, `meta_title`, `meta_description`
) VALUES
(
  1, 'Buy a Home', 'buy-a-home',
  'Personalised residential advisory to help families discover, compare, and acquire the right home in Noida and Greater Noida.',
  '<p>Purchasing a home is one of life’s most meaningful financial and personal milestones. At Growth Realtech, we replace overwhelming listings with a curated residential shortlist matched to your lifestyle, commute, schools, budget, and preferred neighbourhoods.</p><p>We accompany you on structured site visits, clarify floor-plan efficiency and total ownership costs, and guide you through official UP-RERA verification and developer documentation checks.</p>',
  'Home', '/images/category-residential.jpg',
  JSON_ARRAY('Requirement-led residential shortlisting', 'Comparison across Noida, Greater Noida & Expressway sectors', 'Guided site tours & layout evaluation', 'UP-RERA & documentation review assistance'),
  JSON_ARRAY('Lifestyle & Budget Discovery', 'Curated Shortlist Presentation', 'Guided Site Visits & Comparisons', 'Booking & Documentation Coordination'),
  1, 1, 'published', 'Buy a Home in Noida & Greater Noida | Growth Realtech',
  'Personalised home buying consulting in Noida, Greater Noida, and Greater Noida West.'
),
(
  2, 'Commercial Property Consulting', 'commercial-property-consulting',
  'Strategic advisory for Grade-A office spaces, high-street retail, and business suites across NCR commercial corridors.',
  '<p>Commercial real estate requires disciplined evaluation of catchment density, transit proximity, building specifications, and developer execution history. We advise business owners and commercial investors across Sector 132, Sector 142, Noida Expressway, and emerging NCR hubs.</p><p>Whether you are acquiring an operational office for your enterprise or evaluating retail frontage, our consulting process prioritizes clarity and verifiable fundamentals.</p>',
  'Building2', '/images/category-commercial.jpg',
  JSON_ARRAY('IT/ITES office spaces & corporate suites', 'High-street retail & mixed-use commercial hubs', 'Micro-market catchment & connectivity assessment', 'Transparent cost & specification walkthroughs'),
  JSON_ARRAY('Commercial Objective Brief', 'Corridor & Asset Benchmarking', 'Site Inspection & Floor-Plate Review', 'Transaction & Handover Coordination'),
  2, 1, 'published', 'Commercial Property Consultant in Noida | Growth Realtech',
  'Expert commercial property consulting for offices and retail spaces in Noida and Greater Noida.'
),
(
  3, 'Investment Guidance', 'investment-guidance',
  'Objective, fundamentals-first real estate investment consulting across residential, commercial, and corridor land opportunities.',
  '<p>Smart real estate investing starts with asking the right questions—about infrastructure timelines, end-user demand, liquidity, holding horizon, and regulatory clarity. Growth Realtech provides market-aware investment guidance without exaggerated promises or guaranteed-return claims.</p><p>We help investors evaluate asset classes objectively so every capital decision aligns with their comfort level and long-term portfolio goals.</p>',
  'TrendingUp', '/images/category-investment.jpg',
  JSON_ARRAY('Fundamentals-led micro-market analysis', 'Diversified coverage across residential, commercial & land', 'Transparent discussion of risks & holding horizons', 'Zero guaranteed-return hype — honest advisory'),
  JSON_ARRAY('Investment Horizon & Risk Alignment', 'Corridor & Asset Class Selection', 'Due Diligence & RERA Orientation', 'Acquisition & Exit Planning Support'),
  3, 1, 'published', 'Real Estate Investment Consulting Noida | Growth Realtech',
  'Objective real estate investment consulting across Noida, Greater Noida, and Yamuna Expressway.'
),
(
  4, 'Sell / Resale Properties', 'sell-resale-properties',
  'Structured positioning, qualified buyer outreach, and smooth coordination for selling or acquiring resale properties.',
  '<p>Navigating the secondary real estate market demands realistic market benchmarking, discreet presentation, and dependable coordination between buyer and seller. Growth Realtech assists property owners in positioning residential and commercial holdings to serious, verified buyers.</p><p>We coordinate viewings, assist with price alignment based on prevailing sector transactions, and streamline transfer and registry milestones.</p>',
  'ArrowLeftRight', '/images/about-interior.jpg',
  JSON_ARRAY('Realistic micro-market pricing benchmarks', 'Qualified buyer screening & scheduled inspections', 'End-to-end buyer-seller communication', 'Transfer & documentation checklist coordination'),
  JSON_ARRAY('Property Assessment & Positioning', 'Qualified Buyer Matching', 'Managed Inspections & Negotiation Support', 'Transfer & Closure Coordination'),
  4, 1, 'published', 'Sell & Resale Property Consultant Noida | Growth Realtech',
  'Sell or buy verified resale residential and commercial properties in Noida with Growth Realtech.'
),
(
  5, 'Leasing Services', 'leasing-services',
  'End-to-end commercial and residential leasing support connecting landlords with reliable corporate and individual tenants.',
  '<p>Our leasing advisory bridges property owners and occupiers across Noida and Greater Noida. From office spaces and retail shops to upscale residences, we facilitate transparent lease terms, tenant profiling, and smooth possession handovers.</p>',
  'FileSignature', '/images/project-commercial-plaza.jpg',
  JSON_ARRAY('Corporate office & retail space leasing', 'Premium residential leasing in Noida sectors', 'Tenant screening & lease-term coordination', 'Renewal and handover advisory'),
  JSON_ARRAY('Space & Tenant Brief', 'Curated Property / Occupier Matching', 'Commercial Terms Alignment', 'Agreement & Handover Facilitation'),
  5, 1, 'published', 'Commercial & Residential Leasing Services Noida | Growth Realtech',
  'Professional commercial and residential leasing services across Noida and Greater Noida.'
),
(
  6, 'Industrial Property Consulting', 'industrial-property-consulting',
  'Dedicated consulting for industrial plots, factory setups, and warehousing facilities across Greater Noida & Yamuna Expressway.',
  '<p>Industrial and logistics real estate involves specialized requirements around road widths, power load feasibility, authority allotments, and freight connectivity. Growth Realtech supports manufacturers, logistics operators, and warehousing developers across Greater Noida and the YEIDA industrial corridor.</p>',
  'Factory', '/images/category-industrial.jpg',
  JSON_ARRAY('Industrial plots & factory buildings', 'Warehousing & logistics park sourcing', 'Greater Noida & Yamuna Expressway industrial sectors', 'Authority transfer & compliance orientation'),
  JSON_ARRAY('Operational & Technical Brief', 'Industrial Sector Shortlisting', 'Site Access & Infrastructure Review', 'Acquisition & Allotment Coordination'),
  6, 1, 'published', 'Industrial Property Consultant Noida & Yamuna Expressway | Growth Realtech',
  'Industrial plots, factory units, and logistics warehousing consulting in Greater Noida and Yamuna Expressway.'
),
(
  7, 'Land and Plot Consulting', 'land-and-plot-consulting',
  'Diligence-focused consulting for residential plots, township parcels, and strategic land acquisitions in NCR.',
  '<p>Land and plotted developments remain among the most sought-after real estate assets across Noida, Greater Noida, and the Yamuna Expressway region. We help clients evaluate sector maturity, approach roads, zoning clarity, and official documentation before proceeding.</p>',
  'MapPinned', '/images/category-plots.jpg',
  JSON_ARRAY('Authority residential & mixed-use plots', 'Gated township plotted developments', 'Location connectivity & sector maturity review', 'Transparent transfer documentation guidance'),
  JSON_ARRAY('Plot Size & Corridor Criteria', 'Verified Inventory Identification', 'Physical Site & Sector Inspection', 'Documentation & Transfer Support'),
  7, 1, 'published', 'Land & Plot Property Consultant Noida & YEIDA | Growth Realtech',
  'Trusted land and residential plot consulting across Noida, Greater Noida, and Yamuna Expressway.'
),
(
  8, 'Pre-rented Property Consulting', 'pre-rented-property-consulting',
  'Careful evaluation of operational leased commercial properties focused on lease strength, tenant profile, and location durability.',
  '<p>Pre-rented commercial properties appeal to investors looking for operational assets rather than under-construction exposure. Our advisory examines tenant business stability, remaining lock-in periods, rental alignment with micro-market benchmarks, and clean title status.</p>',
  'KeyRound', '/images/category-prerented.jpg',
  JSON_ARRAY('Pre-leased retail & office opportunities', 'Lease tenure, lock-in & escalation review', 'Micro-market rental benchmark check', 'Objective risk & liquidity perspective'),
  JSON_ARRAY('Budget & Asset Profile Brief', 'Pre-leased Asset Shortlisting', 'Lease & Document Walkthrough', 'Structured Acquisition Coordination'),
  8, 1, 'published', 'Pre-rented Property Consulting Noida | Growth Realtech',
  'Consult Growth Realtech for pre-rented commercial office and retail opportunities in Noida.'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `featured_image` = VALUES(`featured_image`);

-- 11. Testimonials (Balanced, genuine-style advisory feedback without fabricated return claims)
INSERT INTO `testimonials` (
  `id`, `client_name`, `designation`, `company`, `feedback`, `rating`, `property_context`, `is_featured`, `status`, `sort_order`
) VALUES
(
  1, 'Rajesh Malhotra', 'Director', 'Enterprise Consulting Firm, Noida',
  'What stood out with Growth Realtech was the absence of sales pressure. They took the time to understand our team’s commute and floor-plate requirements along the Noida Expressway and presented only relevant commercial options with clear documentation guidance.',
  5, 'Commercial Office Advisory — Noida Expressway', 1, 'published', 1
),
(
  2, 'Ananya & Vivek Sharma', 'Homebuyers', 'Noida',
  'Shortlisting a family home across Sector 152 and Greater Noida West felt overwhelming until we consulted Growth Realtech. Their honest comparison of layouts, connectivity, and RERA details made our decision calm and well-informed.',
  5, 'Residential Home Purchase — Noida', 1, 'published', 2
),
(
  3, 'Sandeep Verma', 'Founder', 'Manufacturing & Distribution Business',
  'We reached out to Growth Realtech for guidance on industrial and corridor land options near the Yamuna Expressway. Their ground-level clarity on sector planning, access roads, and transfer steps saved us weeks of guesswork.',
  5, 'Industrial & Plot Advisory — Yamuna Expressway', 1, 'published', 3
)
ON DUPLICATE KEY UPDATE `client_name` = VALUES(`client_name`);

-- 12. Blog Categories
INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `sort_order`) VALUES
(1, 'Real Estate News', 'real-estate-news', 'Policy updates, urban planning announcements, and regional market news.', 1),
(2, 'Noida Property Updates', 'noida-property-updates', 'Sector developments, infrastructure upgrades, and Noida market insights.', 2),
(3, 'Investment Insights', 'investment-insights', 'Frameworks for prudent real estate evaluation and portfolio thinking.', 3),
(4, 'Residential Property', 'residential-property', 'Homebuying checklists, neighbourhood comparisons, and residential trends.', 4),
(5, 'Commercial Property', 'commercial-property', 'Office corridors, retail catchments, and Grade-A workspace guidance.', 5),
(6, 'Industrial Property', 'industrial-property', 'Manufacturing hubs, logistics parks, and industrial land advisory.', 6),
(7, 'Yamuna Expressway Updates', 'yamuna-expressway-updates', 'Corridor growth, YEIDA planning, and airport-region infrastructure.', 7),
(8, 'Buying and Selling Guides', 'buying-and-selling-guides', 'Step-by-step RERA, documentation, and transaction diligence guides.', 8)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 13. Blog Tags
INSERT IGNORE INTO `blog_tags` (`id`, `name`, `slug`) VALUES
(1, 'Noida Expressway', 'noida-expressway'),
(2, 'UP-RERA', 'up-rera'),
(3, 'Commercial Real Estate', 'commercial-real-estate'),
(4, 'Yamuna Expressway', 'yamuna-expressway'),
(5, 'Home Buying Guide', 'home-buying-guide'),
(6, 'Industrial Plots', 'industrial-plots'),
(7, 'Pre-rented Assets', 'pre-rented-assets');

-- 14. Blogs
INSERT INTO `blogs` (
  `id`, `title`, `slug`, `category_id`, `author_name`, `excerpt`, `content`,
  `featured_image`, `reading_time`, `status`, `published_at`, `meta_title`, `meta_description`
) VALUES
(
  1,
  'How to Verify UP-RERA Registration Before Shortlisting Any Property in Noida',
  'how-to-verify-up-rera-registration-noida',
  8, 'Growth Realtech Advisory Desk',
  'A practical step-by-step checklist for homebuyers and commercial investors to independently verify project approvals, developer filings, and quarterly progress on the UP-RERA portal.',
  '<h2>Why Independent RERA Verification Matters</h2><p>Before committing to any residential or commercial development in Noida, Greater Noida, or along the Yamuna Expressway, reviewing official disclosures on the Uttar Pradesh Real Estate Regulatory Authority (UP-RERA) portal is one of the most essential safeguards available to buyers.</p><h3>Key Details to Cross-Check</h3><ul><li><strong>Project Registration Number:</strong> Confirm the exact phase-wise registration number matches the specific tower or wing you are evaluating.</li><li><strong>Land Title & Sanctioned Plans:</strong> Review uploaded layout approvals and land ownership records published on the portal.</li><li><strong>Quarterly Construction Updates:</strong> Examine declared progress milestones rather than relying solely on marketing brochures.</li><li><strong>Promoter Track Record:</strong> Review completed projects and grievance resolution history associated with the developer group.</li></ul><h2>How Growth Realtech Supports Buyers</h2><p>During every consultation, our advisory desk walks clients through official verification checkpoints so your property decision rests on documented facts rather than verbal assurances.</p>',
  '/images/project-luxury-residences.jpg', '5 min read', 'published', NOW() - INTERVAL 14 DAY,
  'UP-RERA Verification Guide for Noida Property Buyers | Growth Realtech',
  'Learn how to verify UP-RERA registration, approvals, and project milestones before buying property in Noida or Greater Noida.'
),
(
  2,
  'Noida-Greater Noida Expressway Commercial Corridor: What Drives Sector 132 & 142 Demand',
  'noida-expressway-commercial-corridor-sector-132-142',
  5, 'Growth Realtech Advisory Desk',
  'Examining the connectivity, corporate ecosystem, and metro accessibility shaping commercial office and high-street retail interest across Sector 132 and Sector 142, Noida.',
  '<h2>A Mature Express-Linked Business Spine</h2><p>Over the past decade, the Noida-Greater Noida Expressway has evolved into one of NCR’s most structured commercial corridors. Sectors 132 and 142 in particular benefit from wide arterial roads, Aqua Line Metro connectivity, and proximity to established residential catchments.</p><h3>Factors Evaluators Look For</h3><ul><li><strong>Transit Accessibility:</strong> Proximity to metro stations and signal-free expressway connectivity reduces daily commute friction for corporate teams.</li><li><strong>Daytime Catchment Density:</strong> Surrounding IT campuses, schools, and residential sectors sustain organic demand for well-planned retail plazas.</li><li><strong>Floor-Plate Efficiency:</strong> Modern occupiers prioritize natural light, parking ratios, and flexible Grade-A infrastructure.</li></ul><p>When comparing commercial options along the expressway, always evaluate maintenance governance, actual occupancy in nearby towers, and complete cost-to-possession transparency.</p>',
  '/images/project-commercial-plaza.jpg', '6 min read', 'published', NOW() - INTERVAL 9 DAY,
  'Noida Expressway Commercial Corridor: Sector 132 & 142 Insights | Growth Realtech',
  'Understand the infrastructure, metro connectivity, and commercial fundamentals of Sector 132 and Sector 142 on Noida Expressway.'
),
(
  3,
  'Evaluating Plots & Industrial Opportunities Along the Yamuna Expressway Corridor',
  'evaluating-plots-industrial-yamuna-expressway',
  7, 'Growth Realtech Advisory Desk',
  'A grounded framework for buyers considering residential plots, mixed-use developments, or industrial land along the Yamuna Expressway and Jewar airport influence zone.',
  '<h2>Looking Beyond Headlines to Ground Fundamentals</h2><p>Infrastructure announcements around the Yamuna Expressway and the Jewar airport region have placed the corridor firmly on the radar of homebuyers, manufacturers, and long-term investors. Yet disciplined evaluation matters most in rapidly evolving markets.</p><h3>Four Practical Diligence Checkpoints</h3><ol><li><strong>Sector Readiness:</strong> Visit the physical sector to verify road connectivity, power infrastructure, and surrounding civic development.</li><li><strong>Allotment & Zoning Clarity:</strong> Confirm land-use classification (residential, commercial, or industrial) and applicable transfer rules.</li><li><strong>Holding Horizon:</strong> Emerging corridors reward patient, long-term horizons rather than short-term speculation.</li><li><strong>Total Transaction Cost:</strong> Account for transfer charges, stamp duty, lease rent obligations, and construction timelines where applicable.</li></ol><p>Growth Realtech offers transparent, on-ground corridor consultations to help you separate long-term utility from short-term noise.</p>',
  '/images/category-investment.jpg', '6 min read', 'published', NOW() - INTERVAL 4 DAY,
  'Yamuna Expressway Plots & Industrial Land Guide | Growth Realtech',
  'Practical diligence checkpoints for evaluating residential plots and industrial land along the Yamuna Expressway corridor.'
),
(
  4,
  'Pre-Rented Commercial Assets: Five Lease Clauses Every Buyer Should Review',
  'pre-rented-commercial-assets-lease-clauses-guide',
  3, 'Growth Realtech Advisory Desk',
  'Why evaluating tenant credibility, lock-in clauses, security deposits, and micro-market rentals matters far more than headline brochure figures.',
  '<h2>Understanding Pre-Rented Property Diligence</h2><p>Pre-rented commercial spaces can offer immediate visibility into operational occupancy, but prudent buyers always inspect the underlying lease agreement in detail before finalizing a transaction.</p><h3>Essential Lease Parameters</h3><ul><li><strong>Lock-in & Notice Period:</strong> Understand the committed tenure and exit clauses available to the tenant.</li><li><strong>Market Rent Alignment:</strong> Verify that existing rent is aligned with comparable neighbouring properties to avoid sudden reset risk upon renewal.</li><li><strong>CAM & Property Taxes:</strong> Clarify who bears common area maintenance, property tax, and GST obligations.</li><li><strong>Security Deposit Transfer:</strong> Ensure formal assignment of the lease and security deposit at closing.</li></ul>',
  '/images/category-prerented.jpg', '4 min read', 'published', NOW() - INTERVAL 2 DAY,
  'Pre-Rented Commercial Property Checklist in Noida | Growth Realtech',
  'Five critical lease clauses every buyer should verify when evaluating pre-rented commercial properties in Noida.'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT IGNORE INTO `blog_tag_relations` (`blog_id`, `tag_id`) VALUES
(1, 2), (1, 5), (2, 1), (2, 3), (3, 4), (3, 6), (4, 3), (4, 7);

-- 15. FAQs (Covering all required prompt topics)
INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `sort_order`, `is_active`) VALUES
(1, 'Which locations does Growth Realtech cover?', 'Growth Realtech is headquartered in Noida, Uttar Pradesh and provides personalised real estate consulting across Noida, Greater Noida, Greater Noida West, the Yamuna Expressway corridor, the Jewar / Airport influence region, and select Delhi NCR business markets.', 'Locations', 1, 1),
(2, 'Do you assist with both residential and commercial property consulting?', 'Yes. Our advisory practice spans residential apartments and luxury homes, Grade-A commercial offices and high-street retail spaces, industrial plots and warehousing, residential land parcels, and pre-rented commercial assets.', 'Consulting Services', 2, 1),
(3, 'Can Growth Realtech help with property resale and leasing?', 'Absolutely. We support homeowners and commercial asset holders with resale positioning, qualified buyer coordination, and end-to-end residential or commercial leasing services across Noida and Greater Noida.', 'Resale & Leasing', 3, 1),
(4, 'How is project information on your website verified?', 'Featured projects showcased on our platform serve as curated reference profiles. Because pricing, inventory availability, floor configurations, and delivery timelines can change, we always verify the latest official developer documentation and UP-RERA disclosures with you during your consultation before any decision is made.', 'Project Information', 4, 1),
(5, 'Do you help clients check UP-RERA registration and documentation?', 'Yes. Transparent process guidance is central to how we work. We assist clients in locating and reviewing official UP-RERA registration numbers, sanctioned layouts, payment schedules, and transfer checklists—and recommend independent legal review for complete peace of mind.', 'RERA Verification', 5, 1),
(6, 'How do I schedule a consultation or site visit?', 'You can submit an enquiry through any property, project, or contact form on this website, call us directly at +91 82875 69844, email growthrealtechnoida@gmail.com, or message us on WhatsApp. An advisor will align on your brief and schedule a convenient site visit or advisory call.', 'Property Enquiries', 6, 1),
(7, 'Does Growth Realtech guarantee fixed returns on real estate investments?', 'No. Real estate investments depend on location fundamentals, infrastructure execution, holding horizon, and broader market conditions. We provide honest, research-backed guidance and never promise guaranteed returns.', 'Investment Advisory', 7, 1)
ON DUPLICATE KEY UPDATE `question` = VALUES(`question`), `answer` = VALUES(`answer`);

-- 16. Legal Pages
INSERT INTO `legal_pages` (`slug`, `title`, `content`, `meta_title`, `meta_description`, `status`) VALUES
(
  'privacy-policy', 'Privacy Policy',
  '<h2>1. Information We Collect</h2><p>When you submit a property enquiry, consultation request, or contact form on Growth Realtech, we collect the contact details and property preferences you voluntarily share—such as your name, phone number, email address, preferred location, budget range, and message.</p><h2>2. How We Use Your Information</h2><p>We use your information exclusively to respond to your real estate consulting requests, coordinate site visits, share relevant property information, and improve our advisory services. We do not sell your personal contact information to unrelated third parties.</p><h2>3. Data Security & Retention</h2><p>Enquiry records are stored securely in our protected database with role-based administrative access controls. You may request an update or removal of your contact details at any time by writing to growthrealtechnoida@gmail.com.</p><h2>4. Contact Us</h2><p>For privacy questions, contact Growth Realtech at +91 82875 69844 or growthrealtechnoida@gmail.com, Noida, Uttar Pradesh.</p>',
  'Privacy Policy | Growth Realtech', 'Read Growth Realtech’s Privacy Policy explaining how client enquiries and contact details are handled.', 'published'
),
(
  'terms-and-conditions', 'Terms and Conditions',
  '<h2>1. Advisory Scope</h2><p>Growth Realtech operates as a real estate consulting and advisory platform serving clients across Noida, Greater Noida, and the Yamuna Expressway corridor. Content on this website is provided for general informational and consulting orientation purposes.</p><h2>2. Accuracy & Verification</h2><p>While we strive to keep all project and property descriptions accurate and current, specifications, pricing, availability, floor plans, and approvals remain subject to official developer and statutory records. Clients are advised to verify all particulars independently prior to executing any booking or transaction.</p><h2>3. Intellectual Property</h2><p>All brand identity elements, editorial copy, design layouts, and custom visual assets on this platform belong to Growth Realtech or their respective owners and may not be reproduced without written permission.</p><h2>4. Governing Law</h2><p>These terms are governed by the laws of India, with jurisdiction in Uttar Pradesh.</p>',
  'Terms and Conditions | Growth Realtech', 'Terms and Conditions governing the use of the Growth Realtech website and advisory platform.', 'published'
),
(
  'disclaimer', 'Real Estate & RERA Disclaimer',
  '<h2>1. Informational Nature of Project Listings</h2><p>All project profiles, property listings, area references, and architectural visuals displayed on Growth Realtech are presented strictly for informational and reference purposes. Generated or editorial architectural images are conceptual representations and must not be construed as actual site photographs or binding developer specifications.</p><h2>2. No Guaranteed Returns</h2><p>Real estate decisions involve market, regulatory, and liquidity considerations. Growth Realtech does not promise, warrant, or guarantee capital appreciation, rental yields, or assured investment returns.</p><h2>3. Official RERA Verification</h2><p>Prospective buyers and investors are strongly advised to verify project registration numbers, sanctioned layouts, completion timelines, and legal title directly on the official UP-RERA portal (up-rera.in) and through qualified independent legal counsel prior to making any financial commitment.</p>',
  'Disclaimer | Growth Realtech', 'Important real estate, conceptual imagery, and UP-RERA verification disclaimer for Growth Realtech.', 'published'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `content` = VALUES(`content`);

-- 17. SEO Metadata (Page-wise)
INSERT INTO `seo_metadata` (`page_key`, `page_label`, `meta_title`, `meta_description`, `keywords`, `og_title`, `og_description`, `og_image`, `robots`, `include_in_sitemap`) VALUES
('home', 'Homepage', 'Growth Realtech | Real Estate Consultant in Noida, Greater Noida & Yamuna Expressway', 'Discover personalised residential, commercial, industrial, plot, and investment real estate consulting across Noida, Greater Noida, and the Yamuna Expressway with Growth Realtech.', 'Real Estate Consultant Noida, Property Consultant Noida, Commercial Property Noida, Residential Property Noida, Greater Noida Property, Yamuna Expressway Property', 'Growth Realtech — Luxury Real Estate Consulting Noida', 'Find the right property across Noida, Greater Noida & Yamuna Expressway with personalised consulting.', '/images/hero-skyline.jpg', 'index, follow', 1),
('properties', 'Properties Directory', 'Properties in Noida, Greater Noida & Yamuna Expressway | Growth Realtech', 'Search curated residential, commercial, industrial, plots, pre-rented, and resale property opportunities across Noida and NCR.', 'Property Consultant Noida, Property Investment Noida, Plots Yamuna Expressway, Pre-rented Noida', 'Explore Curated Properties | Growth Realtech', 'Filter active residential, commercial, industrial & land opportunities across NCR.', '/images/category-residential.jpg', 'index, follow', 1),
('projects', 'Featured Projects', 'Featured Real Estate Projects in Noida & Yamuna Expressway | Growth Realtech', 'Explore flagship commercial and residential projects including Orion One32, Onyx by Splendor, Group 108 Project, KB West Walk, DXN Orion, and Gaur Alaris.', 'Orion One32 Sector 132, Onyx by Splendor Sector 142, Group 108 Project Noida, KB West Walk Greater Noida West, DXN Orion, Gaur Alaris', 'Featured Projects | Growth Realtech', 'Explore curated commercial and residential developments across Noida, Greater Noida & Yamuna Expressway.', '/images/projects/orion-one32.jpg', 'index, follow', 1),
('services', 'Consulting Services', 'Real Estate Consulting Services in Noida | Growth Realtech', 'Home buying, commercial property consulting, investment guidance, resale, leasing, industrial, land & pre-rented real estate advisory in Noida.', 'Real Estate Investment Consulting, Industrial Property Consultant, Commercial Property Noida, Leasing Noida', 'Our Real Estate Services | Growth Realtech', 'Comprehensive end-to-end real estate advisory across 8 specialized verticals.', '/images/category-commercial.jpg', 'index, follow', 1),
('about', 'About Us', 'About Growth Realtech | Premier Property Consultant in Noida', 'Learn about Growth Realtech’s brand philosophy, mission, vision, and client-first real estate consulting approach in Noida, Uttar Pradesh.', 'About Growth Realtech, Real Estate Consultant Noida, Property Advisor Noida', 'About Growth Realtech', 'Noida-based real estate consulting built on clarity, diligence, and personalised support.', '/images/about-interior.jpg', 'index, follow', 1),
('approach', 'Our Approach', 'Our Four-Step Real Estate Advisory Approach | Growth Realtech', 'Discover how Growth Realtech understands your brief, sources curated opportunities, evaluates details, and coordinates your next step.', 'Real Estate Advisory Process, Property Evaluation Noida, RERA Verification Consultant', 'Our Consulting Approach | Growth Realtech', 'A disciplined four-step framework for confident real estate decisions.', '/images/hero-skyline.jpg', 'index, follow', 1),
('insights', 'Insights & Blogs', 'Real Estate Insights, Noida Updates & Buying Guides | Growth Realtech', 'Read practical real estate insights covering Noida sectors, Yamuna Expressway updates, commercial corridors, and UP-RERA verification guides.', 'Noida Property Updates, Yamuna Expressway Updates, Real Estate Buying Guides, UP-RERA Guide', 'Insights & Market Perspectives | Growth Realtech', 'Practical guides and regional real estate intelligence by Growth Realtech.', '/images/category-investment.jpg', 'index, follow', 1),
('contact', 'Contact Us', 'Contact Growth Realtech | Book a Real Estate Consultation in Noida', 'Connect with Growth Realtech in Noida at +91 82875 69844 or growthrealtechnoida@gmail.com to schedule a personalised property consultation.', 'Contact Growth Realtech, Book Property Consultation Noida, Noida Real Estate Office', 'Contact Growth Realtech', 'Schedule a private real estate consultation in Noida, Greater Noida & Yamuna Expressway.', '/images/hero-skyline.jpg', 'index, follow', 1)
ON DUPLICATE KEY UPDATE `meta_title` = VALUES(`meta_title`);

-- 18. Media Library (Pre-register local ultra-HD assets so Admin Media Library can browse & assign them immediately)
INSERT IGNORE INTO `media_library` (`id`, `file_name`, `original_name`, `file_url`, `file_type`, `mime_type`, `file_size`, `alt_text`, `folder`, `storage_provider`) VALUES
(1, 'hero-skyline.jpg', 'hero-skyline.jpg', '/images/hero-skyline.jpg', 'image', 'image/jpeg', 420000, 'Golden-hour luxury architectural skyline and green boulevards', 'hero', 'local'),
(2, 'category-residential.jpg', 'category-residential.jpg', '/images/category-residential.jpg', 'image', 'image/jpeg', 380000, 'Luxury contemporary residential apartment towers', 'categories', 'local'),
(3, 'category-commercial.jpg', 'category-commercial.jpg', '/images/category-commercial.jpg', 'image', 'image/jpeg', 390000, 'Grade-A commercial office tower with emerald structural glass', 'categories', 'local'),
(4, 'category-industrial.jpg', 'category-industrial.jpg', '/images/category-industrial.jpg', 'image', 'image/jpeg', 360000, 'Modern Grade-A industrial park and logistics hub', 'categories', 'local'),
(5, 'category-plots.jpg', 'category-plots.jpg', '/images/category-plots.jpg', 'image', 'image/jpeg', 350000, 'Master-planned luxury plotted township aerial view', 'categories', 'local'),
(6, 'category-prerented.jpg', 'category-prerented.jpg', '/images/category-prerented.jpg', 'image', 'image/jpeg', 370000, 'Upscale modern high-street retail and corporate boulevard', 'categories', 'local'),
(7, 'category-investment.jpg', 'category-investment.jpg', '/images/category-investment.jpg', 'image', 'image/jpeg', 400000, 'Emerging expressway real estate corridor at golden hour', 'categories', 'local'),
(8, 'about-interior.jpg', 'about-interior.jpg', '/images/about-interior.jpg', 'image', 'image/jpeg', 360000, 'Luxury penthouse living lounge with emerald and gold accents', 'about', 'local'),
(9, 'project-commercial-plaza.jpg', 'project-commercial-plaza.jpg', '/images/project-commercial-plaza.jpg', 'image', 'image/jpeg', 410000, 'Contemporary twin-tower IT commercial campus with courtyard', 'projects', 'local'),
(10, 'project-luxury-residences.jpg', 'project-luxury-residences.jpg', '/images/project-luxury-residences.jpg', 'image', 'image/jpeg', 410000, 'Prestigious low-density luxury residential towers with pool', 'projects', 'local');

-- 19. Seed Initial Enquiries & Contact Submissions for Real Live Dashboard Analytics
INSERT IGNORE INTO `enquiries` (
  `id`, `name`, `phone`, `email`, `enquiry_type`, `property_interest`, `project_id`,
  `preferred_location`, `budget_range`, `purpose`, `message`, `source_page`, `status`, `created_at`
) VALUES
(1, 'Vikramaditya Mehta', '+91 98110 42190', 'v.mehta@example.com', 'project', 'Orion One32', 1, 'Noida', '₹2–5 Crore', 'Business Use', 'Interested in evaluating an office suite along Sector 132 Noida Expressway.', '/projects/orion-one32', 'Site Visit Scheduled', NOW() - INTERVAL 45 DAY),
(2, 'Neha Kapoor', '+91 98104 77821', 'neha.kapoor@example.com', 'project', 'Group 108 Project', 3, 'Noida', '₹2–5 Crore', 'Investment', 'Looking for commercial office or retail options in Group 108 Noida.', '/projects/group-108-project', 'Interested', NOW() - INTERVAL 32 DAY),
(3, 'Rohan Aggarwal', '+91 98712 33904', 'rohan.agg@example.com', 'investment', 'Pre-rented Commercial Hub', NULL, 'Noida', '₹2–5 Crore', 'Rental Income', 'Would like to discuss pre-rented commercial opportunities in Noida.', '/properties', 'Converted', NOW() - INTERVAL 24 DAY),
(4, 'Priya Nair', '+91 99105 64218', 'priya.nair@example.com', 'project', 'KB West Walk', 4, 'Greater Noida West', '₹1–2 Crore', 'Investment', 'Requesting layout orientation and site visit for KB West Walk Greater Noida West.', '/projects/kb-west-walk', 'Contacted', NOW() - INTERVAL 15 DAY),
(5, 'Siddharth Jain', '+91 98188 19042', 'siddharth.j@example.com', 'property', 'Industrial & Logistics Parcel', NULL, 'Jewar / Airport Region', '₹5–10 Crore', 'Business Use', 'Evaluating warehousing plots near Yamuna Expressway.', '/properties/industrial-logistics-parcel-jewar-region', 'New', NOW() - INTERVAL 5 DAY),
(6, 'Kavita Deshmukh', '+91 98115 80234', 'kavita.d@example.com', 'consultation', 'Residential Plots Yamuna Expressway', NULL, 'Yamuna Expressway', '₹50 Lakh – ₹1 Crore', 'Investment', 'Need guidance on authority-planned residential plots along YEIDA belt.', '/', 'New', NOW() - INTERVAL 2 DAY);

INSERT IGNORE INTO `contact_submissions` (
  `id`, `name`, `phone`, `email`, `subject`, `location`, `message`, `status`, `created_at`
) VALUES
(1, 'Arjun Khanna', '+91 98102 55419', 'arjun.k@example.com', 'Corporate Office Leasing Inquiry', 'Noida', 'We are expanding our advisory team in Noida and looking for a 3,500 sq.ft. office near Sector 142 Metro.', 'Reviewed', NOW() - INTERVAL 10 DAY),
(2, 'Meera Joshi', '+91 98730 11294', 'meera.joshi@example.com', 'Resale Valuation & Consultation', 'Greater Noida', 'Seeking consultation for positioning our 3 BHK residence for resale in Greater Noida.', 'New', NOW() - INTERVAL 1 DAY);

INSERT IGNORE INTO `notifications` (`id`, `title`, `message`, `type`, `link_url`, `is_read`) VALUES
(1, 'New Property Enquiry', 'Siddharth Jain enquired about Industrial & Logistics Parcel (Jewar / Airport Region).', 'enquiry', '/admin/enquiries', 0),
(2, 'New Contact Request', 'Meera Joshi submitted a Resale Valuation & Consultation request.', 'contact', '/admin/contacts', 0);
