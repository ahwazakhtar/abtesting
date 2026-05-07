import { Pool } from "pg";

// Singleton pool — reused across API route invocations in the same process.
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PROD_FDE_DATABASE_HOST,
      database: process.env.PROD_FDE_DATABASE_NAME,
      user: process.env.PROD_FDE_DATABASE_USER,
      password: process.env.PROD_FDE_DATABASE_PASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.PROD_FDE_DATABASE_HOST &&
    process.env.PROD_FDE_DATABASE_NAME &&
    process.env.PROD_FDE_DATABASE_USER &&
    process.env.PROD_FDE_DATABASE_PASSWORD
  );
}
