import { expect, test } from "@playwright/test";

test("space weather route renders without a database", async ({ page }) => {
  await page.goto("/space-weather");
  await expect(page.getByRole("heading", { name: "Space weather" })).toBeVisible();
  await expect(page.getByText("G2 (Moderate) Geomagnetic Storm")).toBeVisible();
});

/** Requires a live DB (session lookup) — same limitation as e2e/auth.spec.ts. */
test("admin moderation route 404s for a non-moderator", async ({ page }) => {
  const suffix = Date.now().toString(36);
  await page.goto("/sign-up");
  await page.getByLabel("Display name").fill("Regular User");
  await page.getByLabel("Username").fill(`e2e_reg_${suffix}`);
  await page.getByLabel("Email").fill(`e2e-reg-${suffix}@example.invalid`);
  await page.getByLabel("Password").fill("correcthorsebattery");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto("/admin/moderation");
  await expect(page.getByText("404")).toBeVisible();
});
