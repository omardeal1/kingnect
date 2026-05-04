import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads correctly with title containing Kingnect or Kinec", async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/Kingnect|Kinec/);
  });

  test("navbar is visible", async ({ page }) => {
    const navbar = page.locator("header nav");
    await expect(navbar).toBeVisible();

    // Verify logo link with "Kingnect" text
    const logoLink = page.locator("header a[href='/']");
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toContainText("King");
  });

  test("hero section is visible", async ({ page }) => {
    // The hero section contains "Kinec profesional" heading
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/Kinec/i);

    // CTA button in hero section should be visible (use .first() since multiple exist on page)
    await expect(page.locator("a", { hasText: "Crear mi Kinec" }).first()).toBeVisible();
  });

  test("pricing section is visible", async ({ page }) => {
    // Scroll to pricing section
    const pricingSection = page.locator("#precios");
    await pricingSection.scrollIntoViewIfNeeded();
    await expect(pricingSection).toBeVisible();

    // Verify pricing heading
    await expect(page.locator("text=Planes y precios")).toBeVisible();
  });

  test("login link navigates to /login", async ({ page }) => {
    // Find the "Iniciar sesión" link in the navbar
    const loginLink = page.locator('header a[href="/login"]');
    await expect(loginLink).toBeVisible();

    // Click and verify navigation
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
