import { defineConfig, devices } from "@playwright/test";

/**
 * Browser binaries were reviewed and run as an explicit Phase 2 step — see
 * docs/dependency-security-log.md for what `playwright install` does and
 * what was actually verified.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Each test launches a real WebGL context for the globe/map — too much
  // parallelism starves them of GPU/CPU and causes flaky timeouts, not a
  // product defect (verified clean with a single standalone browser run).
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
