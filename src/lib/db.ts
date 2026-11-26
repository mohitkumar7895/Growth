import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined;
}

const poolConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "growth",
  waitForConnections: true,
  connectionLimit: 24,
  maxIdle: 12,
  idleTimeout: 60_000,
  queueLimit: 100,
  connectTimeout: 5000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
  charset: "utf8mb4",
};

export const db: mysql.Pool =
  globalThis.mysqlPool ?? mysql.createPool(poolConfig);

globalThis.mysqlPool = db;

export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await db.execute(sql, params as never);
  return rows as T[];
}

export async function queryOne<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<mysql.ResultSetHeader> {
  const [result] = await db.execute(sql, params as never);
  return result as mysql.ResultSetHeader;
}

let registrationSchemaPromise: Promise<void> | null = null;

async function safeAlter(sql: string): Promise<void> {
  try {
    await db.query(sql);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    // Ignore benign duplicate column/key errors when racing concurrent startups
    if (code === "ER_DUP_FIELDNAME" || code === "ER_DUP_KEYNAME") return;
    console.error("[DB] Migration statement failed:", sql, err);
  }
}

async function getTableColumns(tableName: string): Promise<Set<string>> {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME AS col
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return new Set(
    (rows as Array<{ col: string }>).map((r) => String(r.col).toLowerCase())
  );
}

/**
 * Ensures otp_verifications and customer_registrations exist and have all
 * Email OTP + Date/Time/GPS Coordinates/Address columns on any live database.
 * Uses db.query() (non-prepared protocol) + INFORMATION_SCHEMA so it works
 * across MySQL 5.7, 8.0, 8.4, and MariaDB without ER_UNSUPPORTED_PS errors.
 */
export async function ensureRegistrationSchema(): Promise<void> {
  if (registrationSchemaPromise) return registrationSchemaPromise;

  registrationSchemaPromise = (async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS \`otp_verifications\` (
          \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`channel\` ENUM('email','phone') NOT NULL DEFAULT 'email',
          \`email\` VARCHAR(180) DEFAULT NULL,
          \`phone\` VARCHAR(30) DEFAULT NULL,
          \`otp_hash\` VARCHAR(128) NOT NULL,
          \`verification_token\` VARCHAR(128) DEFAULT NULL,
          \`attempts\` TINYINT UNSIGNED NOT NULL DEFAULT 0,
          \`is_verified\` TINYINT(1) NOT NULL DEFAULT 0,
          \`expires_at\` DATETIME NOT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_otp_email_created\` (\`email\`, \`created_at\`),
          KEY \`idx_otp_phone_created\` (\`phone\`, \`created_at\`),
          KEY \`idx_otp_token\` (\`verification_token\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS \`customer_registrations\` (
          \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`full_name\` VARCHAR(150) NOT NULL,
          \`email\` VARCHAR(180) DEFAULT NULL,
          \`email_verified\` TINYINT(1) NOT NULL DEFAULT 0,
          \`country_code\` VARCHAR(10) NOT NULL DEFAULT '+91',
          \`mobile\` VARCHAR(20) NOT NULL,
          \`full_phone\` VARCHAR(30) NOT NULL,
          \`mobile_verified\` TINYINT(1) NOT NULL DEFAULT 0,
          \`verification_method\` ENUM('email','phone') NOT NULL DEFAULT 'email',
          \`requirement\` VARCHAR(120) NOT NULL,
          \`property_type\` VARCHAR(120) NOT NULL,
          \`preferred_location\` VARCHAR(120) NOT NULL,
          \`budget_range\` VARCHAR(100) NOT NULL,
          \`address_city\` VARCHAR(255) DEFAULT NULL,
          \`additional_details\` TEXT DEFAULT NULL,
          \`registration_date\` DATE DEFAULT NULL,
          \`registration_time\` TIME DEFAULT NULL,
          \`latitude\` DECIMAL(10, 7) DEFAULT NULL,
          \`longitude\` DECIMAL(10, 7) DEFAULT NULL,
          \`location_accuracy\` DOUBLE DEFAULT NULL,
          \`coordinates_label\` VARCHAR(120) DEFAULT NULL,
          \`geo_address\` VARCHAR(500) DEFAULT NULL,
          \`ip_address\` VARCHAR(60) DEFAULT NULL,
          \`consent_given\` TINYINT(1) NOT NULL DEFAULT 1,
          \`status\` ENUM('New','Verified','Contacted','Site Visit Scheduled','Converted','Closed') NOT NULL DEFAULT 'Verified',
          \`internal_notes\` TEXT DEFAULT NULL,
          \`assigned_to\` INT UNSIGNED DEFAULT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_cust_status_created\` (\`status\`, \`created_at\`),
          KEY \`idx_cust_phone\` (\`full_phone\`),
          KEY \`idx_cust_email\` (\`email\`),
          KEY \`idx_cust_reg_date\` (\`registration_date\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      const otpCols = await getTableColumns("otp_verifications");
      if (!otpCols.has("channel")) {
        await safeAlter(
          "ALTER TABLE `otp_verifications` ADD COLUMN `channel` ENUM('email','phone') NOT NULL DEFAULT 'email'"
        );
      }
      if (!otpCols.has("email")) {
        await safeAlter(
          "ALTER TABLE `otp_verifications` ADD COLUMN `email` VARCHAR(180) DEFAULT NULL"
        );
        await safeAlter(
          "ALTER TABLE `otp_verifications` ADD KEY `idx_otp_email_created` (`email`, `created_at`)"
        );
      }
      await safeAlter(
        "ALTER TABLE `otp_verifications` MODIFY COLUMN `phone` VARCHAR(30) DEFAULT NULL"
      );

      const custCols = await getTableColumns("customer_registrations");
      const custColumnDefs: Array<[string, string]> = [
        ["email_verified", "TINYINT(1) NOT NULL DEFAULT 0"],
        ["verification_method", "ENUM('email','phone') NOT NULL DEFAULT 'email'"],
        ["registration_date", "DATE DEFAULT NULL"],
        ["registration_time", "TIME DEFAULT NULL"],
        ["latitude", "DECIMAL(10, 7) DEFAULT NULL"],
        ["longitude", "DECIMAL(10, 7) DEFAULT NULL"],
        ["location_accuracy", "DOUBLE DEFAULT NULL"],
        ["coordinates_label", "VARCHAR(120) DEFAULT NULL"],
        ["geo_address", "VARCHAR(500) DEFAULT NULL"],
        ["ip_address", "VARCHAR(60) DEFAULT NULL"],
      ];

      for (const [colName, colDef] of custColumnDefs) {
        if (!custCols.has(colName)) {
          await safeAlter(
            `ALTER TABLE \`customer_registrations\` ADD COLUMN \`${colName}\` ${colDef}`
          );
        }
      }
    } catch (err) {
      registrationSchemaPromise = null;
      console.error("[DB] ensureRegistrationSchema failed:", err);
      throw err;
    }
  })();

  return registrationSchemaPromise;
}

let liveContentSyncPromise: Promise<void> | null = null;

/**
 * Automatically upgrades an older live MySQL database on first request after deploy
 * (without overwriting intentional admin customizations):
 * - Ensures secondary email setting (care@growthrealtech.in) exists
 * - Ensures Register (/register) nav items exist in header & footer_quick
 * - Ensures "TRUST | TRANSPARENCY | SAFE INVESTMENT" tagline exists on trust_highlights
 * - Upgrades legacy ACE Starlit / ACE HAN'EI tiles & stock project photos to
 *   Group 108 Project, KB West Walk (Greater Noida West), and actual project photos
 * - Updates projects SEO metadata if it still references ACE Starlit / ACE HANEI
 * - Ensures otp_verifications & customer_registrations schema columns exist
 */
export async function ensureLiveContentSynced(): Promise<void> {
  if (liveContentSyncPromise) return liveContentSyncPromise;

  liveContentSyncPromise = (async () => {
    try {
      // 1. Ensure OTP & Customer Registration tables/columns exist
      await ensureRegistrationSchema();

      // 2. Secondary email setting
      await db.query(
        `INSERT IGNORE INTO \`website_settings\` (\`setting_key\`, \`setting_group\`, \`setting_value\`, \`value_type\`)
         VALUES ('contact_email_secondary', 'contact', 'care@growthrealtech.in', 'string')`
      );

      // 3. Navigation menus: ensure /register exists in header & footer_quick
      const [headerReg] = await db.query(
        `SELECT id FROM \`navigation_menus\` WHERE location = 'header' AND url = '/register' LIMIT 1`
      );
      if ((headerReg as unknown[]).length === 0) {
        await db.query(
          `INSERT INTO \`navigation_menus\` (\`label\`, \`url\`, \`location\`, \`sort_order\`, \`is_active\`, \`is_cta\`)
           VALUES ('Register', '/register', 'header', 8, 1, 0)`
        );
        await db.query(
          `UPDATE \`navigation_menus\` SET sort_order = 9 WHERE location = 'header' AND url = '/contact' AND sort_order <= 8`
        );
        await db.query(
          `UPDATE \`navigation_menus\` SET sort_order = 10 WHERE location = 'header' AND is_cta = 1 AND sort_order <= 9`
        );
      }

      const [footerReg] = await db.query(
        `SELECT id FROM \`navigation_menus\` WHERE location = 'footer_quick' AND url = '/register' LIMIT 1`
      );
      if ((footerReg as unknown[]).length === 0) {
        await db.query(
          `INSERT INTO \`navigation_menus\` (\`label\`, \`url\`, \`location\`, \`sort_order\`, \`is_active\`, \`is_cta\`)
           VALUES ('Customer Registration', '/register', 'footer_quick', 8, 1, 0)`
        );
      }

      // 4. Homepage trust_highlights tagline
      const [trustRows] = await db.query(
        `SELECT id, content_json FROM \`homepage_sections\` WHERE section_key = 'trust_highlights' LIMIT 1`
      );
      const trustRow = (trustRows as Array<{ id: number; content_json: string | null }>)[0];
      if (trustRow?.content_json && !trustRow.content_json.includes("TRUST | TRANSPARENCY")) {
        try {
          const parsed = JSON.parse(trustRow.content_json) as Record<string, unknown>;
          if (!parsed.tagline) {
            parsed.tagline = "TRUST | TRANSPARENCY | SAFE INVESTMENT";
            await db.query(
              `UPDATE \`homepage_sections\` SET content_json = ? WHERE id = ?`,
              [JSON.stringify(parsed), trustRow.id]
            );
          }
        } catch {
          // Ignore malformed JSON
        }
      }

      // 5. Upgrade legacy stock project photos & ACE Starlit / ACE HAN'EI tiles
      const [projRows] = await db.query(
        `SELECT id, slug, featured_image FROM \`projects\` WHERE id IN (1,2,3,4,5,6)`
      );
      const projects = projRows as Array<{ id: number; slug: string; featured_image: string | null }>;
      const hasLegacyProjects = projects.some(
        (p) =>
          p.slug === "ace-starlit" ||
          p.slug === "ace-hanei" ||
          !p.featured_image ||
          !p.featured_image.startsWith("/images/projects/")
      );

      if (hasLegacyProjects) {
        // Project 1: Orion One32 actual photo
        await db.query(
          `UPDATE \`projects\`
           SET featured_image = '/images/projects/orion-one32.jpg'
           WHERE slug = 'orion-one32' AND (featured_image IS NULL OR featured_image NOT LIKE '/images/projects/%')`
        );

        // Project 2: Onyx by Splendor actual photo
        await db.query(
          `UPDATE \`projects\`
           SET featured_image = '/images/projects/onyx-by-splendor.jpg'
           WHERE slug = 'onyx-by-splendor' AND (featured_image IS NULL OR featured_image NOT LIKE '/images/projects/%')`
        );

        // Project 3: ACE Starlit -> Group 108 Project
        await db.query(
          `UPDATE \`projects\`
           SET name = 'Group 108 Project',
               slug = 'group-108-project',
               category = 'Commercial',
               property_category_id = 2,
               developer_name = 'Group 108 (Reference)',
               location = 'Sector 142, Noida & Greater Noida West',
               sector = 'Sector 142 / Techzone 4',
               region_filter = 'Noida',
               short_description = 'Landmark iconic twin-tower IT/ITES commercial and high-street retail developments by Group 108 across Noida & NCR.',
               description = '<p>Group 108 developments—including iconic twin-tower IT/ITES office spaces, waterfront-inspired high-street retail, and modern lifestyle plazas across Sector 142 Noida Expressway and Greater Noida West—stand out for architectural scale and business-ready infrastructure.</p><p>Designed for enterprises, retail brands, and discerning commercial evaluators, Group 108 projects combine strong expressway connectivity with integrated dining and workspace amenities. Growth Realtech assists with layout comparisons, site tours, and transparent verification of official UP-RERA filings.</p>',
               featured_image = '/images/projects/group-108-1.png',
               configuration = 'IT/ITES Office Spaces & High-Street Retail (Enquire for Configurations)',
               amenities_json = JSON_ARRAY('Iconic Twin-Tower Architecture', 'High-Street Retail & Dining Plazas', 'Expressway & Metro Corridor Connectivity', 'Modern Glass Facade & Sky Decks', 'Multi-Level Basement Parking', '24x7 Managed Security & BMS'),
               specifications_json = JSON_OBJECT('Developer', 'Group 108', 'Key Corridors', 'Sector 142 Noida Expressway & Greater Noida West', 'Asset Class', 'Commercial / IT-ITES & High-Street Retail', 'Verification', 'Official UP-RERA & Brochure Verification Provided'),
               map_embed_url = 'https://www.google.com/maps?q=Sector+142,Noida,Uttar+Pradesh&output=embed',
               meta_title = 'Group 108 Project Noida | Commercial Advisory by Growth Realtech',
               meta_description = 'Discover commercial consulting, office floors, and high-street retail opportunities in Group 108 projects across Noida with Growth Realtech.'
           WHERE slug = 'ace-starlit' OR (id = 3 AND (featured_image IS NULL OR featured_image NOT LIKE '/images/projects/%'))`
        );

        // Project 4: ACE HAN'EI -> KB West Walk (Greater Noida West)
        await db.query(
          `UPDATE \`projects\`
           SET name = 'KB West Walk',
               slug = 'kb-west-walk',
               category = 'Commercial',
               property_category_id = 2,
               developer_name = 'Shree KB Group (Reference)',
               location = 'Greater Noida West',
               sector = 'Sector Ecotech-12, Greater Noida West',
               region_filter = 'Greater Noida',
               short_description = 'A modern mixed-use high-street retail, dining, entertainment, and luxury studio destination in Greater Noida West.',
               description = '<p>KB West Walk is a landmark mixed-use commercial development positioned at Plot C-3, Sector Ecotech-12 near Ek Murti Chowk in Greater Noida West, enjoying wide road-junction visibility along the 130-meter corridor.</p><p>Integrating multi-level high-street retail storefronts, fine-dining food courts, entertainment zones, a sunlit central atrium, and contemporary studio suites, KB West Walk serves a dense surrounding residential catchment. Connect with Growth Realtech for guided site walkthroughs, unit comparisons, and official UP-RERA verification.</p>',
               featured_image = '/images/projects/kb-west-walk-2.jpg',
               configuration = 'High-Street Retail Shops, Food Court & Luxury Studio Suites (Enquire for Layouts)',
               amenities_json = JSON_ARRAY('Prime 130m Road Junction Visibility', 'Sunlit Grand Central Atrium', 'High-Street Retail & Hypermarket Zone', 'Fine-Dining Food Court & Multiplex', 'Rooftop Amenities & High-Speed Elevators', 'Multi-Level Basement Parking'),
               specifications_json = JSON_OBJECT('Micro-market', 'Sector Ecotech-12, Greater Noida West', 'Asset Class', 'Mixed-Use Commercial & Studio Suites', 'Connectivity', 'Near Ek Murti Chowk & Proposed Metro Corridor', 'Verification', 'Official Developer & UP-RERA Check on Request'),
               map_embed_url = 'https://www.google.com/maps?q=KB+West+Walk,Greater+Noida+West,Uttar+Pradesh&output=embed',
               meta_title = 'KB West Walk Greater Noida West | Growth Realtech Consulting',
               meta_description = 'Enquire with Growth Realtech for commercial retail and studio consulting, layouts, and site visits at KB West Walk, Greater Noida West.'
           WHERE slug = 'ace-hanei' OR (id = 4 AND (featured_image IS NULL OR featured_image NOT LIKE '/images/projects/%'))`
        );

        // Project 5: DXN Orion actual photo & residential details
        await db.query(
          `UPDATE \`projects\`
           SET category = 'Residential',
               property_category_id = 1,
               developer_name = 'Orion Group (Reference)',
               location = 'Sector 22D, Yamuna Expressway',
               sector = 'Sector 22D, Yamuna Expressway',
               short_description = 'Modern high-rise luxury residences positioned along the fast-emerging Sector 22D Yamuna Expressway corridor.',
               featured_image = '/images/projects/dxn-orion.jpg',
               configuration = 'Luxury 3 & 4 BHK Residences (Enquire for Options)'
           WHERE slug = 'dxn-orion' AND (featured_image IS NULL OR featured_image NOT LIKE '/images/projects/%')`
        );

        // Project 6: Gaur Alaris actual photo
        await db.query(
          `UPDATE \`projects\`
           SET location = 'Sector 22D, Yamuna Expressway',
               sector = 'Sector 22D, Yamuna Expressway',
               featured_image = '/images/projects/gaur-alaris.webp',
               configuration = 'Modern 3 & 4 BHK Residences (Enquire for Configurations)'
           WHERE slug = 'gaur-alaris' AND (featured_image IS NULL OR featured_image NOT LIKE '/images/projects/%')`
        );

        // Replace legacy stock gallery images for projects 1-6 with actual elevation photos
        await db.query(
          `INSERT INTO \`project_images\` (\`id\`, \`project_id\`, \`image_url\`, \`alt_text\`, \`caption\`, \`sort_order\`) VALUES
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
            (18, 6, '/images/projects/gaur-alaris-3.webp', 'Gaur Alaris Interior Residence', 'Gaur Alaris — Contemporary Luxury Residence Interior', 3)
           ON DUPLICATE KEY UPDATE
            project_id = VALUES(project_id),
            image_url = VALUES(image_url),
            alt_text = VALUES(alt_text),
            caption = VALUES(caption),
            sort_order = VALUES(sort_order)`
        );
      }

      // 6. Update projects SEO metadata if still referencing old project names
      await db.query(
        `UPDATE \`seo_metadata\`
         SET meta_description = 'Explore flagship commercial and residential projects including Orion One32, Onyx by Splendor, Group 108 Project, KB West Walk, DXN Orion, and Gaur Alaris.',
             keywords = 'Orion One32 Sector 132, Onyx by Splendor Sector 142, Group 108 Project Noida, KB West Walk Greater Noida West, DXN Orion, Gaur Alaris',
             og_image = '/images/projects/orion-one32.jpg'
         WHERE page_key = 'projects' AND (meta_description LIKE '%ACE Starlit%' OR keywords LIKE '%ACE Starlit%')`
      );
    } catch (err) {
      // Allow retry if DB wasn't reachable during static build
      liveContentSyncPromise = null;
      console.error("[DB] ensureLiveContentSynced skipped:", err);
    }
  })();

  return liveContentSyncPromise;
}
