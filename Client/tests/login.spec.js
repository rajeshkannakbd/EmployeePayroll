import { test, expect } from "@playwright/test";

test("HR can login successfully", async ({ page }) => {

  await page.goto("/login");

  await page.getByLabel("Login ID").fill("EMP-1002");

  await page.getByLabel("Password").fill("hr123");

  await page.getByRole("button", {
    name: "Sign In"
  }).click();

  await expect(page).toHaveURL("http://localhost:5173/");
});