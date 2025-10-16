import { test, expect } from './.setup';

test('open image viewer from attachment', async ({ page }) => {
  await page.goto('/chat/demo');
  const attach = page.getByTestId('msg-attach').first();
  await expect(attach).toBeVisible();
  await attach.click();
  await expect(page.getByTestId('viewer-root')).toBeVisible();
  await page.getByTestId('viewer-close').click();
  await expect(page.getByTestId('viewer-root')).toHaveCount(0);
});





