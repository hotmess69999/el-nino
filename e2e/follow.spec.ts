import { expect, test } from "@playwright/test";

/** Same DB requirement/limitation as e2e/auth.spec.ts. */
function uniqueUser(tag: string) {
  const suffix = Date.now().toString(36);
  return {
    name: `Follow Tester ${tag}`,
    username: `e2e_follow_${tag}_${suffix}`,
    email: `e2e-follow-${tag}-${suffix}@example.invalid`,
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
}

test("following another user updates both follower counts", async ({ browser }) => {
  const userA = uniqueUser("a");
  const userB = uniqueUser("b");

  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await signUp(pageA, userA);

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await signUp(pageB, userB);

  await pageA.goto(`/users/${userB.username}`);
  await pageA.getByRole("button", { name: "Follow" }).click();
  await expect(pageA.getByRole("button", { name: "Following", exact: false })).toBeVisible();

  await pageB.goto("/profile");
  await expect(pageB.getByText("1", { exact: true }).first()).toBeVisible();

  await pageA.getByRole("button", { name: "Following" }).click();
  await expect(pageA.getByRole("button", { name: "Follow", exact: true })).toBeVisible();

  await contextA.close();
  await contextB.close();
});
