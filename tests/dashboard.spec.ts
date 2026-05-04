import { test, expect } from "@playwright/test";

// Helper to log in as a client user via the UI
async function loginAsClient(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[id="email"]', "demo@kingnect.app");
  await page.fill('input[id="password"]', "Demo123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe("Client Dashboard", () => {
  test("after login as client, dashboard shows", async ({ page }) => {
    await loginAsClient(page);

    // Verify the welcome heading is visible (use heading role to be specific)
    await expect(page.getByRole("heading", { name: /Bienvenido/ })).toBeVisible({ timeout: 10000 });
  });

  test("QR code section is visible", async ({ page }) => {
    await loginAsClient(page);

    // Wait for dashboard to load
    await expect(page.getByRole("heading", { name: /Bienvenido/ })).toBeVisible({ timeout: 10000 });

    // Verify QR code section
    await expect(page.locator("text=Código QR")).toBeVisible();
  });

  test("plan status card is visible", async ({ page }) => {
    await loginAsClient(page);

    // Wait for dashboard to load
    await expect(page.getByRole("heading", { name: /Bienvenido/ })).toBeVisible({ timeout: 10000 });

    // Verify plan status card
    await expect(page.locator("text=Estado del plan")).toBeVisible();
  });
});
