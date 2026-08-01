import { expect, test } from "@playwright/test";

/** Requires a live DB seeded with prisma/seed.ts (see e2e/auth.spec.ts). */
test("alerts route lists active official warnings anonymously", async ({ page }) => {
  await page.goto("/alerts");
  await expect(page.getByRole("heading", { name: "Alerts" })).toBeVisible();
  await expect(page.getByText("Severe Thunderstorm Warning for Dallas–Fort Worth")).toBeVisible();
  await expect(page.getByText("Official — warning", { exact: false })).toBeVisible();
});
