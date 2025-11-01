import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Try using individual PG* environment variables as a fallback
let connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.PGHOST) {
  connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}`;
  console.log('[db] Using PG* environment variables to construct connection string');
}

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Log the database URL host for debugging (without exposing password)
const dbUrl = new URL(connectionString);
console.log(`[db] Connecting to database at ${dbUrl.host} as user ${dbUrl.username}`);

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });