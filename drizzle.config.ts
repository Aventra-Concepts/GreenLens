import { defineConfig } from "drizzle-kit";

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Set SUPABASE_DB_URL (preferred) or DATABASE_URL before running Drizzle commands.",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
