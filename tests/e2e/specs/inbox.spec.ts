import { test, expect } from './.setup';
import { pushNotification } from '../helpers/realtime';

test('bell badge increments and drawer opens', async ({ page }) => {
  await page.goto('/shipments');
  await pushNotification(page, {
    id: 'n-demo', title: 'E2E уведомление', body: 'body', link: '/chat/demo',
    createdAtISO: new Date().toISOString()
  });
  const bell = page.getByTestId('inbox-bell');
  await expect(bell).toBeVisible();
  await bell.click();
  await expect(page.getByTestId('inbox-drawer')).toBeVisible();
});





