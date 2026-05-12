import { Pool } from "pg";

// Singleton pool — reused across API route invocations in the same process.
let pool: Pool | null = null;

function parseHost(raw: string | undefined): { host: string | undefined; port: number | undefined } {
  if (!raw) return { host: undefined, port: undefined };
  const lastColon = raw.lastIndexOf(":");
  if (lastColon !== -1) {
    const maybePort = Number(raw.slice(lastColon + 1));
    if (Number.isInteger(maybePort) && maybePort > 0) {
      return { host: raw.slice(0, lastColon), port: maybePort };
    }
  }
  return { host: raw, port: undefined };
}

export function getPool(): Pool {
  if (!pool) {
    const { host, port: hostPort } = parseHost(process.env.PROD_FDE_DATABASE_HOST);
    const port = process.env.PROD_FDE_DATABASE_PORT
      ? Number(process.env.PROD_FDE_DATABASE_PORT)
      : hostPort;
    pool = new Pool({
      host,
      port,
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
