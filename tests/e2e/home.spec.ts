import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("renders the main hero and navigates to the emergency page", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /ignite your prompts/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /play now/i })).toBeVisible();

    await page.getByRole("link", { name: /play now/i }).click();

    await expect(page).toHaveURL(/\/emergency$/);
    await expect(
      page.getByRole("heading", { name: /decode the chaos/i }),
    ).toBeVisible();
  });
});
