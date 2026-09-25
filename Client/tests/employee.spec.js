import { test, expect } from "@playwright/test";

test("HR can open Employee Management", async ({ page }) => {

  // 1. Open login page
  await page.goto("http://localhost:5173/login");

  // 2. Login as HR
  await page.getByLabel("Login ID").fill("EMP-1002");

  await page.getByLabel("Password").fill("hr123");

  await page.getByRole("button", {
    name: "Sign In"
  }).click();

  // 3. Wait for successful login
  await expect(page).toHaveURL("http://localhost:5173/");

  // 4. Navigate through the application's UI
  // instead of page.goto("/employees")
  await page.locator('a[href="/employees"]').click();

  // 5. Verify Employee Management page
  await expect(
    page.getByRole("heading", {
      name: "Employee Management"
    })
  ).toBeVisible();

  // 6. Verify Add Employee button
  await expect(
    page.getByRole("button", {
      name: "+ Add Employee"
    })
  ).toBeVisible();
});