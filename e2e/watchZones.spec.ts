import { expect, test } from "@playwright/test";

/** Same DB requirement/limitation as e2e/auth.spec.ts. */
function uniqueUser() {
  const suffix = Date.now().toString(36);
  return {
    name: "Watch Zone Tester",
    username: `e2e_wz_${suffix}`,
    email: `e2e-wz-${suffix}@example.invalid`,
    password: "correcthorsebattery",
  };
}

async function signUp(page: import("@playwright/test").Page, user: ReturnType<typeof uniqueUser>) {
  await page.goto("/sign-up");
  await page.getByLabel("Display name").fill(user.name);
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  // Wait for real profile content, not just the URL -- under CI's slower
  // rendering, router.push()+router.refresh() can leave the sign-up form's
  // DOM node briefly overlapping the new page (both use the same AuthForm
  // CSS module class), which intercepts the very next click. Caught live:
  // this made "Save Watch Zone" time out in CI on the mobile project only.
  await expect(page.getByRole("heading", { name: "Watch Zones" })).toBeVisible();
}

test.describe("Watch Zones", () => {
  test("create, edit, and delete a Watch Zone", async ({ page }) => {
    const user = uniqueUser();
    await signUp(page, user);

    await page.getByRole("button", { name: "Create Watch Zone" }).click();
    await page.getByLabel("Name").fill("Test Zone");
    await page.getByLabel("Latitude").fill("40.71");
    await page.getByLabel("Longitude").fill("-74.01");
    await page.getByLabel("Radius (km)").fill("30");
    await page.getByLabel("Severe storm").check();
    await page.getByRole("button", { name: "Save Watch Zone" }).click();

    await expect(page.getByText("Test Zone")).toBeVisible();
    await expect(page.getByText(/30 km radius/)).toBeVisible();

    // Edit
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Name").fill("Renamed Zone");
    await page.getByRole("button", { name: "Save Watch Zone" }).click();
    await expect(page.getByText("Renamed Zone")).toBeVisible();

    // Pause
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByText(/paused/)).toBeVisible();

    // Delete
    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Renamed Zone")).not.toBeVisible();
    await expect(page.getByText("No Watch Zones yet.")).toBeVisible();
  });

  test("rejects a Watch Zone with no category selected", async ({ page }) => {
    const user = uniqueUser();
    await signUp(page, user);

    await page.getByRole("button", { name: "Create Watch Zone" }).click();
    await page.getByLabel("Name").fill("Invalid Zone");
    await page.getByLabel("Latitude").fill("0");
    await page.getByLabel("Longitude").fill("0");
    await page.getByRole("button", { name: "Save Watch Zone" }).click();

    await expect(page.getByText("Select at least one category.")).toBeVisible();
  });
});
