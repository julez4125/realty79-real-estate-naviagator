import { test, expect } from '@playwright/test';

test('portfolio page shows property count > 0', async ({ page }) => {
  await page.goto('/portfolio');
  // The stat card for "Objekte" should show a number greater than 0
  const countText = await page.locator('.stat-card').first().textContent();
  const match = countText?.match(/\d+/);
  expect(match).not.toBeNull();
  expect(parseInt(match![0], 10)).toBeGreaterThan(0);
});

test('properties page shows at least 5 rows', async ({ page }) => {
  await page.goto('/properties');
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(5, { timeout: 10_000 });
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(5);
});
