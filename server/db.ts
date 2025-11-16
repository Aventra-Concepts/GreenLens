import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

const provider = (process.env.DB_PROVIDER || 'supabase').toLowerCase();
const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Set SUPABASE_DB_URL (preferred) or DATABASE_URL / NEON_DATABASE_URL before starting the server.",
  );
}

function createPgDrizzle() {
  const sslMode = process.env.DB_SSL?.toLowerCase();
  const sslEnabled = sslMode === 'true' || sslMode === 'require';
  const pool = new PgPool({
    connectionString,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });
  return drizzlePg(pool, { schema });
}

function createNeonDrizzle() {
  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString });
  return drizzleNeon({ client: pool, schema });
}

export const db = provider === 'neon' ? createNeonDrizzle() : createPgDrizzle();