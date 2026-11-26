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

/**
 * Ensures otp_verifications and customer_registrations have Email OTP +
 * Date/Time/GPS Coordinates columns even on databases created before this upgrade.
 */
export async function ensureRegistrationSchema(): Promise<void> {
  if (registrationSchemaPromise) return registrationSchemaPromise;

  registrationSchemaPromise = (async () => {
    try {
      const otpCols = await query<{ Field: string }>(
        "SHOW COLUMNS FROM `otp_verifications`"
      );
      const otpColSet = new Set(otpCols.map((c) => c.Field));
      if (!otpColSet.has("channel")) {
        await db.query(
          "ALTER TABLE `otp_verifications` ADD COLUMN `channel` ENUM('email','phone') NOT NULL DEFAULT 'email' AFTER `id`"
        );
      }
      if (!otpColSet.has("email")) {
        await db.query(
          "ALTER TABLE `otp_verifications` ADD COLUMN `email` VARCHAR(180) DEFAULT NULL AFTER `channel`, ADD KEY `idx_otp_email_created` (`email`, `created_at`)"
        );
      }
      await db.query(
        "ALTER TABLE `otp_verifications` MODIFY COLUMN `phone` VARCHAR(30) DEFAULT NULL"
      );

      const custCols = await query<{ Field: string }>(
        "SHOW COLUMNS FROM `customer_registrations`"
      );
      const custColSet = new Set(custCols.map((c) => c.Field));
      const alters: string[] = [];
      if (!custColSet.has("email_verified")) {
        alters.push("ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `email`");
      }
      if (!custColSet.has("verification_method")) {
        alters.push(
          "ADD COLUMN `verification_method` ENUM('email','phone') NOT NULL DEFAULT 'email' AFTER `mobile_verified`"
        );
      }
      if (!custColSet.has("registration_date")) {
        alters.push("ADD COLUMN `registration_date` DATE DEFAULT NULL AFTER `additional_details`");
      }
      if (!custColSet.has("registration_time")) {
        alters.push("ADD COLUMN `registration_time` TIME DEFAULT NULL AFTER `registration_date`");
      }
      if (!custColSet.has("latitude")) {
        alters.push("ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `registration_time`");
      }
      if (!custColSet.has("longitude")) {
        alters.push("ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`");
      }
      if (!custColSet.has("location_accuracy")) {
        alters.push("ADD COLUMN `location_accuracy` DOUBLE DEFAULT NULL AFTER `longitude`");
      }
      if (!custColSet.has("coordinates_label")) {
        alters.push("ADD COLUMN `coordinates_label` VARCHAR(120) DEFAULT NULL AFTER `location_accuracy`");
      }
      if (!custColSet.has("geo_address")) {
        alters.push("ADD COLUMN `geo_address` VARCHAR(500) DEFAULT NULL AFTER `coordinates_label`");
      }
      if (!custColSet.has("ip_address")) {
        alters.push("ADD COLUMN `ip_address` VARCHAR(60) DEFAULT NULL AFTER `geo_address`");
      }
      if (alters.length > 0) {
        await db.query(`ALTER TABLE \`customer_registrations\` ${alters.join(", ")}`);
      }
    } catch (err) {
      // Allow retry on subsequent requests if DB wasn't ready yet
      registrationSchemaPromise = null;
      console.error("[DB] ensureRegistrationSchema check skipped:", err);
    }
  })();

  return registrationSchemaPromise;
}
