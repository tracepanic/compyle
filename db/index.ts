import { env } from "@/env/server";
import { Pool } from "@neondatabase/serverless";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/neon-serverless";

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, {
  cache: upstashCache({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  }),
});
