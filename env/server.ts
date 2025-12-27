import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url().startsWith("postgresql://"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    RESEND_API_KEY: z.string().startsWith("re_"),
    IMAGEKIT_PRIVATE_KEY: z.string().startsWith("private_"),
    IMAGEKIT_PUBLIC_KEY: z.string().startsWith("public_"),
    IMAGEKIT_URL_ENDPOINT: z.url(),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    CRON_SECRET: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});
