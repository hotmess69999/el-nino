import { expect, test } from "@playwright/test";

/** Same DB requirement/limitation as e2e/auth.spec.ts. */
function uniqueUser() {
  const suffix = Date.now().toString(36);
  return {
    name: "Upload Tester",
    username: `e2e_upload_${suffix}`,
    email: `e2e-upload-${suffix}@example.invalid`,
    password: "correcthorsebattery",
  };
}

test("uploading a report publishes it", async ({ page }) => {
  const user = uniqueUser();

  await page.goto("/sign-up");
  await page.getByLabel("Display name").fill(user.name);
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.goto("/upload");
  await page.setInputFiles("#file", "e2e/fixtures/sample.mp4");
  await page.selectOption("#category", "severe-storm");
  await page.getByLabel("Caption").fill("Test storm footage.");
  await page.getByLabel("Location label").fill("Test City");
  await page.getByLabel("Latitude").fill("10");
  await page.getByLabel("Longitude").fill("10");
  await page.getByRole("button", { name: "Publish report" }).click();

  await expect(page.getByText("Report published.")).toBeVisible();
});

test("upload route falls back to sign-in when signed out", async ({ page }) => {
  await page.goto("/upload");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
