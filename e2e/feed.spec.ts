import { expect, test } from "@playwright/test";
import { FEED_REPORTS } from "../src/lib/feed/reports";

test.describe("vertical weather feed", () => {
  test("shows the first report with full metadata hierarchy", async ({ page }) => {
    await page.goto("/feed");
    const first = FEED_REPORTS[0]!;
    await expect(page.getByText(first.event.locationLabel)).toBeVisible();
    await expect(page.getByText(first.contributorHandle)).toBeVisible();
    await expect(page.getByText(first.caption)).toBeVisible();
  });

  test("ArrowDown advances to the next report", async ({ page }) => {
    await page.goto("/feed");
    const second = FEED_REPORTS[1]!;
    await page.getByRole("region", { name: "Weather report feed" }).click();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByText(second.event.locationLabel)).toBeVisible({ timeout: 10000 });
  });

  test("mute toggle changes the button's accessible state", async ({ page }) => {
    await page.goto("/feed");
    const muteButton = page.getByRole("button", { name: "Unmute" }).first();
    await expect(muteButton).toHaveAttribute("aria-pressed", "false");
    await muteButton.click();
    await expect(page.getByRole("button", { name: "Mute" }).first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("tapping the active video toggles a visible pause state", async ({ page }) => {
    await page.goto("/feed");
    const video = page.locator('[aria-label*="weather report video"]').first();
    await video.click();
    await expect(page.getByText("▶")).toBeVisible();
    await video.click();
    await expect(page.getByText("▶")).toBeHidden();
  });

  test("View on globe navigates to the globe with that event's preview open", async ({ page }) => {
    await page.goto("/feed");
    const first = FEED_REPORTS[0]!;
    await page.getByRole("link", { name: "View on globe →" }).first().click();
    await expect(page).toHaveURL(/\/\?event=seed-severe-storm-1$/);
    await expect(page.getByRole("dialog", { name: `${first.event.name} preview` })).toBeVisible({
      timeout: 10000,
    });
  });
});
