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
