import { expect, test } from "@playwright/test";
import { SEED_EVENTS } from "../src/lib/map/seedEvents";
import { CATEGORY_META } from "../src/lib/map/categories";

test.describe("globe/map", () => {
  test("renders an accessible marker for every seeded event", async ({ page }) => {
    await page.goto("/");
    for (const event of SEED_EVENTS) {
      const label = `${event.name} — ${CATEGORY_META[event.category].label} — ${event.locationLabel}`;
      await expect(page.getByRole("button", { name: label })).toBeVisible({ timeout: 15000 });
    }
  });

  test("selecting a marker opens a preview with the required fields", async ({ page }) => {
    await page.goto("/");
    const event = SEED_EVENTS[0]!;
    const label = `${event.name} — ${CATEGORY_META[event.category].label} — ${event.locationLabel}`;

    await page.getByRole("button", { name: label }).click();

    const preview = page.getByRole("dialog", { name: `${event.name} preview` });
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(event.name);
    await expect(preview).toContainText(event.locationLabel);
    await expect(preview).toContainText(CATEGORY_META[event.category].label);
    await expect(preview).toContainText(event.summary);

    await preview.getByRole("button", { name: "Close" }).click();
    await expect(preview).toBeHidden();
  });

  test("marker is keyboard-activatable", async ({ page }) => {
    await page.goto("/");
    const event = SEED_EVENTS[0]!;
    const label = `${event.name} — ${CATEGORY_META[event.category].label} — ${event.locationLabel}`;
    const marker = page.getByRole("button", { name: label });

    await marker.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("dialog", { name: `${event.name} preview` })).toBeVisible();
  });
});

test.describe("responsive navigation layout", () => {
  test("nav sits at the bottom on mobile and on the left on desktop", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    if (testInfo.project.name === "mobile") {
      // Bottom bar: near the viewport's bottom edge, full width.
      expect(box!.y + box!.height).toBeGreaterThan(viewport!.height - 20);
      expect(box!.width).toBeGreaterThan(viewport!.width * 0.9);
    } else {
      // Side rail: pinned to the left edge, full height.
      expect(box!.x).toBeLessThan(5);
      expect(box!.height).toBeGreaterThan(viewport!.height * 0.9);
    }
  });
});
