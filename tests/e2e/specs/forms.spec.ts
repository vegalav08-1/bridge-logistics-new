import { test, expect } from './.setup';

test('create request', async ({ page }) => {
  await page.goto('/requests/new');
  await page.getByLabel('Краткое описание').fill('E2E запрос');
  await page.getByLabel('Старый трек-номер').fill('LP123456');
  await page.getByLabel('Адрес прибытия').fill('Москва, Тверская, 1');
  await page.getByRole('button', { name: 'Отправить запрос' }).click();
  await expect(page).toHaveURL(/\/chat\/req_/);
});

test('create shipment', async ({ page }) => {
  await page.goto('/shipments/new');
  await page.getByLabel('Краткое описание').fill('E2E отгрузка');
  await page.getByLabel('Старый трек-номер').fill('LP654321');
  await page.getByLabel('Адрес прибытия').fill('Санкт-Петербург, Невский, 5');
  await page.getByRole('button', { name: 'Создать отгрузку' }).click();
  await expect(page).toHaveURL(/\/chat\/shp_/);
});





