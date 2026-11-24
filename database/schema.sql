-- Growth Realtech Production MySQL Schema
-- Database: growth

CREATE DATABASE IF NOT EXISTS `growth`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `growth`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `module` VARCHAR(60) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permissions_slug` (`slug`),
  KEY `idx_permissions_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Role Permissions
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Admins
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(180) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`),
  KEY `idx_admins_role` (`role_id`),
  CONSTRAINT `fk_admins_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Website Settings (key-value grouped settings for branding, contact, appearance, footer, global SEO)
CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(120) NOT NULL,
  `setting_group` VARCHAR(60) NOT NULL DEFAULT 'general',
  `setting_value` LONGTEXT DEFAULT NULL,
  `value_type` ENUM('string','text','json','boolean','color','url') NOT NULL DEFAULT 'string',
  `updated_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_website_settings_key` (`setting_key`),
  KEY `idx_website_settings_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Navigation Menus
CREATE TABLE IF NOT EXISTS `navigation_menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  `url` VARCHAR(300) NOT NULL,
  `location` ENUM('header','footer_quick','footer_services','footer_categories') NOT NULL DEFAULT 'header',
  `parent_id` INT UNSIGNED DEFAULT NULL,
  `target` VARCHAR(20) NOT NULL DEFAULT '_self',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_cta` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nav_location_order` (`location`, `sort_order`),
  KEY `idx_nav_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Homepage Sections (fully dynamic CMS sections)
CREATE TABLE IF NOT EXISTS `homepage_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_key` VARCHAR(100) NOT NULL,
  `section_type` VARCHAR(60) NOT NULL DEFAULT 'custom',
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `badge_text` VARCHAR(120) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `content_json` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `video_url` VARCHAR(500) DEFAULT NULL,
  `cta_primary_label` VARCHAR(100) DEFAULT NULL,
  `cta_primary_url` VARCHAR(300) DEFAULT NULL,
  `cta_secondary_label` VARCHAR(100) DEFAULT NULL,
  `cta_secondary_url` VARCHAR(300) DEFAULT NULL,
  `background_style` VARCHAR(60) NOT NULL DEFAULT 'cream',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homepage_sections_key` (`section_key`),
  KEY `idx_homepage_order` (`sort_order`, `is_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Property Categories
CREATE TABLE IF NOT EXISTS `property_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL,
  `short_description` VARCHAR(300) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `icon_name` VARCHAR(60) DEFAULT 'Building2',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `meta_title` VARCHAR(200) DEFAULT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_property_categories_slug` (`slug`),
  KEY `idx_property_categories_order` (`sort_order`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Properties
CREATE TABLE IF NOT EXISTS `properties` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(220) NOT NULL,
  `slug` VARCHAR(240) NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `property_type` VARCHAR(80) NOT NULL,
  `location` VARCHAR(120) NOT NULL,
  `sector` VARCHAR(120) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT 'Noida',
  `budget_range` VARCHAR(80) DEFAULT 'Open to Options',
  `price_display` VARCHAR(120) DEFAULT 'Price on Request',
  `purpose` VARCHAR(80) DEFAULT 'Investment',
  `property_status` VARCHAR(80) DEFAULT 'Available for Consultation',
  `area_size` VARCHAR(100) DEFAULT NULL,
  `configuration` VARCHAR(150) DEFAULT NULL,
  `short_description` VARCHAR(400) DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `specifications_json` LONGTEXT DEFAULT NULL,
  `amenities_json` LONGTEXT DEFAULT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `gallery_json` LONGTEXT DEFAULT NULL,
  `map_embed_url` VARCHAR(600) DEFAULT NULL,
  `brochure_url` VARCHAR(500) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'published',
  `meta_title` VARCHAR(200) DEFAULT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `canonical_url` VARCHAR(400) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_properties_slug` (`slug`),
  KEY `idx_properties_filters` (`property_type`, `location`, `budget_range`, `purpose`, `status`),
  KEY `idx_properties_category` (`category_id`),
  KEY `idx_properties_featured` (`is_featured`, `status`),
  CONSTRAINT `fk_properties_category` FOREIGN KEY (`category_id`) REFERENCES `property_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `category` VARCHAR(80) NOT NULL DEFAULT 'Commercial',
  `property_category_id` INT UNSIGNED DEFAULT NULL,
  `developer_name` VARCHAR(160) DEFAULT NULL,
  `location` VARCHAR(140) NOT NULL,
  `sector` VARCHAR(120) DEFAULT NULL,
  `region_filter` VARCHAR(80) NOT NULL DEFAULT 'Noida',
  `short_description` VARCHAR(400) DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `rera_number` VARCHAR(180) DEFAULT NULL,
  `rera_status_note` VARCHAR(255) DEFAULT 'Reference listing — confirm official UP-RERA details during consultation.',
  `price_range` VARCHAR(120) DEFAULT 'Price on Request',
  `configuration` VARCHAR(180) DEFAULT NULL,
  `project_status` VARCHAR(100) DEFAULT 'Enquire for Latest Status',
  `amenities_json` LONGTEXT DEFAULT NULL,
  `specifications_json` LONGTEXT DEFAULT NULL,
  `map_embed_url` VARCHAR(600) DEFAULT NULL,
  `brochure_url` VARCHAR(500) DEFAULT NULL,
  `official_website_url` VARCHAR(400) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'published',
  `sort_order` INT NOT NULL DEFAULT 0,
  `meta_title` VARCHAR(200) DEFAULT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `canonical_url` VARCHAR(400) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_projects_slug` (`slug`),
  KEY `idx_projects_filters` (`category`, `region_filter`, `is_featured`, `status`),
  KEY `idx_projects_cat_fk` (`property_category_id`),
  CONSTRAINT `fk_projects_category` FOREIGN KEY (`property_category_id`) REFERENCES `property_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Project Images
CREATE TABLE IF NOT EXISTS `project_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_images_project` (`project_id`, `sort_order`),
  CONSTRAINT `fk_project_images_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Services
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(160) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `short_description` VARCHAR(400) DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `icon_name` VARCHAR(60) DEFAULT 'Briefcase',
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `highlights_json` LONGTEXT DEFAULT NULL,
  `process_json` LONGTEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'published',
  `meta_title` VARCHAR(200) DEFAULT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `canonical_url` VARCHAR(400) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_slug` (`slug`),
  KEY `idx_services_order` (`sort_order`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Testimonials
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_name` VARCHAR(140) NOT NULL,
  `designation` VARCHAR(140) DEFAULT NULL,
  `company` VARCHAR(140) DEFAULT NULL,
  `profile_image` VARCHAR(500) DEFAULT NULL,
  `feedback` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `property_context` VARCHAR(160) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'published',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_testimonials_status` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Blog Categories
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL,
  `description` VARCHAR(300) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blog_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Blog Tags
CREATE TABLE IF NOT EXISTS `blog_tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blog_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Blogs
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(240) NOT NULL,
  `slug` VARCHAR(260) NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `author_id` INT UNSIGNED DEFAULT NULL,
  `author_name` VARCHAR(120) NOT NULL DEFAULT 'Growth Realtech Advisory Desk',
  `excerpt` VARCHAR(500) DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `reading_time` VARCHAR(40) DEFAULT '5 min read',
  `status` ENUM('draft','published','scheduled') NOT NULL DEFAULT 'draft',
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `meta_title` VARCHAR(200) DEFAULT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `canonical_url` VARCHAR(400) DEFAULT NULL,
  `og_image` VARCHAR(500) DEFAULT NULL,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blogs_slug` (`slug`),
  KEY `idx_blogs_status_pub` (`status`, `published_at`),
  KEY `idx_blogs_category` (`category_id`),
  CONSTRAINT `fk_blogs_category` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_blogs_author` FOREIGN KEY (`author_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Blog Tag Relations
CREATE TABLE IF NOT EXISTS `blog_tag_relations` (
  `blog_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`blog_id`, `tag_id`),
  CONSTRAINT `fk_btr_blog` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_btr_tag` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. FAQs
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` VARCHAR(300) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(80) NOT NULL DEFAULT 'General',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_faqs_order` (`sort_order`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Enquiries (Property / Project / Consultation / Site Visit / Investment)
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(140) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(180) DEFAULT NULL,
  `enquiry_type` ENUM('property','project','consultation','investment','site_visit','general') NOT NULL DEFAULT 'general',
  `property_interest` VARCHAR(200) DEFAULT NULL,
  `project_id` INT UNSIGNED DEFAULT NULL,
  `property_id` INT UNSIGNED DEFAULT NULL,
  `preferred_location` VARCHAR(120) DEFAULT NULL,
  `budget_range` VARCHAR(80) DEFAULT NULL,
  `purpose` VARCHAR(80) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `source_page` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('New','Contacted','Interested','Site Visit Scheduled','Converted','Closed') NOT NULL DEFAULT 'New',
  `internal_notes` TEXT DEFAULT NULL,
  `assigned_to` INT UNSIGNED DEFAULT NULL,
  `follow_up_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enquiries_status_created` (`status`, `created_at`),
  KEY `idx_enquiries_type` (`enquiry_type`),
  KEY `idx_enquiries_assigned` (`assigned_to`),
  CONSTRAINT `fk_enquiries_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Contact Submissions
CREATE TABLE IF NOT EXISTS `contact_submissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(140) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(180) DEFAULT NULL,
  `subject` VARCHAR(200) DEFAULT NULL,
  `location` VARCHAR(120) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('New','Reviewed','Responded','Archived') NOT NULL DEFAULT 'New',
  `internal_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Media Library
CREATE TABLE IF NOT EXISTS `media_library` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_type` ENUM('image','video','document') NOT NULL DEFAULT 'image',
  `mime_type` VARCHAR(120) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `folder` VARCHAR(100) NOT NULL DEFAULT 'general',
  `storage_provider` ENUM('local','cloudinary') NOT NULL DEFAULT 'local',
  `public_id` VARCHAR(255) DEFAULT NULL,
  `uploaded_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_type_folder` (`file_type`, `folder`),
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. SEO Metadata (Page-wise & global override)
CREATE TABLE IF NOT EXISTS `seo_metadata` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_key` VARCHAR(120) NOT NULL,
  `page_label` VARCHAR(160) NOT NULL,
  `meta_title` VARCHAR(200) NOT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `keywords` VARCHAR(400) DEFAULT NULL,
  `og_title` VARCHAR(200) DEFAULT NULL,
  `og_description` VARCHAR(350) DEFAULT NULL,
  `og_image` VARCHAR(500) DEFAULT NULL,
  `canonical_url` VARCHAR(400) DEFAULT NULL,
  `robots` VARCHAR(80) NOT NULL DEFAULT 'index, follow',
  `schema_json` LONGTEXT DEFAULT NULL,
  `include_in_sitemap` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_seo_page_key` (`page_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Legal Pages
CREATE TABLE IF NOT EXISTS `legal_pages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `meta_title` VARCHAR(200) DEFAULT NULL,
  `meta_description` VARCHAR(350) DEFAULT NULL,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_legal_pages_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Activity Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` INT UNSIGNED DEFAULT NULL,
  `admin_name` VARCHAR(120) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(80) NOT NULL,
  `entity_id` VARCHAR(60) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(60) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_created` (`created_at`),
  KEY `idx_activity_module` (`module`),
  CONSTRAINT `fk_activity_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(180) NOT NULL,
  `message` VARCHAR(400) NOT NULL,
  `type` ENUM('enquiry','contact','system','content') NOT NULL DEFAULT 'enquiry',
  `link_url` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_read` (`is_read`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. OTP Verifications (Server-side hashed OTP with expiry & attempt limits)
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(30) NOT NULL,
  `otp_hash` VARCHAR(128) NOT NULL,
  `verification_token` VARCHAR(128) DEFAULT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_otp_phone_created` (`phone`, `created_at`),
  KEY `idx_otp_token` (`verification_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Customer Registrations (OTP-verified profiles)
CREATE TABLE IF NOT EXISTS `customer_registrations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(180) DEFAULT NULL,
  `country_code` VARCHAR(10) NOT NULL DEFAULT '+91',
  `mobile` VARCHAR(20) NOT NULL,
  `full_phone` VARCHAR(30) NOT NULL,
  `mobile_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `requirement` VARCHAR(120) NOT NULL,
  `property_type` VARCHAR(120) NOT NULL,
  `preferred_location` VARCHAR(120) NOT NULL,
  `budget_range` VARCHAR(100) NOT NULL,
  `address_city` VARCHAR(255) DEFAULT NULL,
  `additional_details` TEXT DEFAULT NULL,
  `consent_given` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('New','Verified','Contacted','Site Visit Scheduled','Converted','Closed') NOT NULL DEFAULT 'Verified',
  `internal_notes` TEXT DEFAULT NULL,
  `assigned_to` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cust_status_created` (`status`, `created_at`),
  KEY `idx_cust_phone` (`full_phone`),
  CONSTRAINT `fk_cust_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
