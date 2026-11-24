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
