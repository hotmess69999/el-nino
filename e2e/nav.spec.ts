import { expect, test } from "@playwright/test";
import { NAV_ITEMS } from "../src/lib/navigation";

/**
 * Covers the Phase 1 navigation shell's stable user flow: every primary
 * destination is reachable and marks itself active. Not run yet — see
 * playwright.config.ts and docs/dependency-security-log.md for why browser
 * binaries aren't installed until this suite is actually exercised.
 */
test.describe("primary navigation", () => {
  for (const item of NAV_ITEMS) {
    test(`navigates to ${item.label}`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: item.label }).click();
      await expect(page).toHaveURL(item.href === "/" ? "/" : new RegExp(`${item.href}$`));
      await expect(page.getByRole("link", { name: item.label })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  }

  test("has exactly one primary navigation landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(1);
  });
});
