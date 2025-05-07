import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema";

// Initialize the connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema });