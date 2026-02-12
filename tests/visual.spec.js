const { test, expect } = require("@playwright/test");

test("home page visual baseline", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState("networkidle");
  await expect(page.locator("main.container")).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page).toHaveScreenshot("home-page.png", {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
    animations: "disabled",
  });
});
