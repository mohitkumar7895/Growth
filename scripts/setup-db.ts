import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const val = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

async function main() {
  const rootDir = process.cwd();
  loadEnvFile(path.join(rootDir, ".env.local"));
  loadEnvFile(path.join(rootDir, ".env"));

  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "growth";

  const adminName = process.env.ADMIN_SEED_NAME || "Growth Realtech Super Admin";
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@growthrealtech.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "ADMIN_SEED_PASSWORD must be set in .env.local (minimum 8 characters) before running db:setup."
    );
  }

  console.log(`[DB Setup] Connecting to MySQL at ${host}:${port} as ${user}...`);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    const schemaSql = fs.readFileSync(
      path.join(rootDir, "database", "schema.sql"),
      "utf8"
    );
    console.log("[DB Setup] Applying database/schema.sql...");
    await connection.query(schemaSql);

    await connection.query(`USE \`${database}\``);

    // Upgrade existing OTP & Customer Registration tables safely if created from an older schema
    const [otpColsRaw] = await connection.query("SHOW COLUMNS FROM `otp_verifications`");
    const otpCols = new Set((otpColsRaw as Array<{ Field: string }>).map((c) => c.Field));
    if (!otpCols.has("channel")) {
      await connection.query(
        "ALTER TABLE `otp_verifications` ADD COLUMN `channel` ENUM('email','phone') NOT NULL DEFAULT 'email'"
      );
    }
    if (!otpCols.has("email")) {
      await connection.query(
        "ALTER TABLE `otp_verifications` ADD COLUMN `email` VARCHAR(180) DEFAULT NULL, ADD KEY `idx_otp_email_created` (`email`, `created_at`)"
      );
    }
    await connection.query(
      "ALTER TABLE `otp_verifications` MODIFY COLUMN `phone` VARCHAR(30) DEFAULT NULL"
    );

    const [custColsRaw] = await connection.query("SHOW COLUMNS FROM `customer_registrations`");
    const custCols = new Set((custColsRaw as Array<{ Field: string }>).map((c) => c.Field));
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
        console.log(`[DB Setup] Adding customer_registrations.${colName}...`);
        await connection.query(
          `ALTER TABLE \`customer_registrations\` ADD COLUMN \`${colName}\` ${colDef}`
        );
      }
    }

    const seedSql = fs.readFileSync(
      path.join(rootDir, "database", "seed.sql"),
      "utf8"
    );
    console.log("[DB Setup] Applying database/seed.sql...");
    await connection.query(seedSql);

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await connection.execute(
      `INSERT INTO admins (name, email, password_hash, role_id, is_active)
       VALUES (?, ?, ?, 1, 1)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         role_id = 1,
         is_active = 1`,
      [adminName, adminEmail, passwordHash]
    );

    await connection.execute(
      `INSERT INTO activity_logs (admin_id, admin_name, action, module, details)
       SELECT id, name, 'SYSTEM_SEED', 'system', 'Database schema initialized and Super Admin configured'
       FROM admins WHERE email = ? LIMIT 1`,
      [adminEmail]
    );

    const [tables] = await connection.query("SHOW TABLES");
    console.log(
      `[DB Setup] Complete! Database '${database}' has ${(tables as unknown[]).length} tables.`
    );
    console.log(`[DB Setup] Super Admin configured for: ${adminEmail}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("[DB Setup] Failed:", err);
  process.exit(1);
});
