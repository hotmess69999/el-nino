import { defineConfig, devices } from "@playwright/test";

/**
 * Not run yet — browser binaries are intentionally not downloaded until an
 * end-to-end suite is actually being exercised (see
 * docs/dependency-security-log.md). `npx playwright install` is a separate,
 * explicitly reviewed step.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
