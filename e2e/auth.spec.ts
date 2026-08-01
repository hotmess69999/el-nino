import { expect, test } from "@playwright/test";

/**
 * Requires a running Postgres database (docker compose up -d postgres +
 * prisma migrate dev) — not run in the sandbox this suite was authored in,
 * which has neither docker nor a local Postgres install available (see
 * docs/decisions/0004-database-and-orm.md). Each test creates its own
 * unique account (Date.now()-suffixed email/username) so the suite is
 * safely rerunnable without manual cleanup between runs.
 */
function uniqueUser() {
  const suffix = Date.now().toString(36);
  return {
    name: "E2E Test User",
    username: `e2e_user_${suffix}`,
    email: `e2e-${suffix}@example.invalid`,
    password: "correcthorsebattery",
  };
}

test.describe("authentication", () => {
  test("sign up, edit profile, sign out, sign back in", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/sign-up");
    await page.getByLabel("Display name").fill(user.name);
    await page.getByLabel("Username").fill(user.username);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: user.name })).toBeVisible();

    // Edit profile
    await page.getByRole("button", { name: "Edit profile" }).click();
    await page.getByLabel("Bio").fill("Testing the profile editor.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Testing the profile editor.")).toBeVisible();

    // Sign out returns to signed-out state on /profile
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    // Sign back in
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
  });

  test("protected route redirects to sign-in state when signed out", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
