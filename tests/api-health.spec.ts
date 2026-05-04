import { test, expect } from "@playwright/test";

test.describe("API Health Endpoint", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
  });

  test("response contains status: 'ok'", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();
    expect(body.status).toBe("ok");
  });
});
