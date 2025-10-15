import { test, expect } from '@playwright/test';

test('shipments list opens', async ({ page }) => {
  await page.goto('/shipments');
  await expect(page.getByText(/Отгрузки/i)).toBeVisible();
});




