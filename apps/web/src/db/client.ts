import { drizzle } from "drizzle-orm/node-postgres";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

import * as schema from "./schema";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "apps/web/.env"),
  resolve(process.cwd(), "apps/web/.env.local"),
];

if (process.env.NODE_ENV !== "production") {
  for (const filePath of envCandidates) {
    if (existsSync(filePath)) {
      loadEnv({ path: filePath, override: false });
    }
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database client");
}

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
