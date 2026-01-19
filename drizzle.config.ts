import type { Config } from "drizzle-kit"

import * as dotenv from "dotenv"

dotenv.config()

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" })
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export default {
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./src/db/schema.ts",
} satisfies Config
