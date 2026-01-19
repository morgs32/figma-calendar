import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http";

import { relations } from "./db/schema"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(databaseUrl)

export const pg = drizzle({
  client: sql,
  relations,
})
