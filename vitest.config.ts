import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Vitest doesn't load .env into process.env by default (unlike Next.js) —
// src/lib/db/client.ts and the RUN_DB_TESTS-gated integration test both
// read process.env.DATABASE_URL directly, so it needs to be there.
const env = loadEnv("", process.cwd(), "");

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    env,
  },
});
