import { Page, expect } from '@playwright/test';

export async function gotoShipments(page: Page) {
  await page.goto('/shipments');
  await expect(page.getByTestId('shipments-search')).toBeVisible();
}
export async function openFirstShipment(page: Page) {
  const cards = page.getByTestId('shipment-card');
  await expect(cards.first()).toBeVisible();
  await cards.first().click();
}


