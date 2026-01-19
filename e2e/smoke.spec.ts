import { expect, test } from "@playwright/test";

test("root page loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading").first()).toBeVisible();
});

test("auth buttons navigate to sign in and sign up", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/sign-in/);

  await page.goBack();
  await page.getByRole("link", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/sign-up/);
});
