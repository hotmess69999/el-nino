import { defineConfig } from "prisma/config";

// Node's built-in .env loader (no dotenv dependency needed) — silently
// no-ops if .env doesn't exist, which is fine in CI/production where
// DATABASE_URL comes from real environment variables instead.
try {
  process.loadEnvFile();
} catch {
  // .env not present — expected outside local dev.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Node's built-in TS support can't run Prisma's generated client (its
    // internal imports are extensionless, bundler-resolution style) — tsx
    // resolves the same way Next.js/webpack does.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
