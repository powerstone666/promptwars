import { expect, test } from "@playwright/test";

test.describe("rakshak ai shell", () => {
  test("renders the docs landing page and launches the app", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByRole("heading", { name: /decode the chaos/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /launch app/i }).first()).toBeVisible();

    await page.getByRole("link", { name: /launch app/i }).first().click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /decode the chaos/i }),
    ).toBeVisible();
    await expect(
      page.getByLabel(/emergency situation description/i),
    ).toBeVisible();
  });

  test("renders the main emergency app controls on the root route", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: /documentation & landing page/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /upload an image of the emergency/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /record voice input/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /select output language/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /analyze emergency situation/i }),
    ).toBeDisabled();
  });
});
