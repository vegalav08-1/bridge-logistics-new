import { expect } from './.setup';
import { test } from './.setup';
import { gotoShipments, openFirstShipment } from '../helpers/nav';

test.describe('Shipments list', () => {
  test('loads and paginates', async ({ page }) => {
    await gotoShipments(page);
    await expect(page.getByTestId('shipment-card')).toHaveCountGreaterThan(1);
    // прокрутка — подгрузка следующей страницы
    await page.mouse.wheel(0, 2000);
    await expect(page.getByText('Больше нет')).toBeVisible();
  });

  test('open chat from card', async ({ page }) => {
    await gotoShipments(page);
    await openFirstShipment(page);
    await expect(page.getByTestId('message-list')).toBeVisible();
  });
});


