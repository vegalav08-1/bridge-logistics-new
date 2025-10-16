import { Page } from '@playwright/test';

export async function pushNotification(page: Page, data: any) {
  await page.evaluate((d) => {
    window.dispatchEvent(new CustomEvent('rt:event', { detail: { type:'notification.new', data: d }}));
  }, data);
}

export async function pushChatMessage(page: Page, data: any) {
  await page.evaluate((d) => {
    window.dispatchEvent(new CustomEvent('rt:event', { detail: { type:'chat.message', data: d }}));
  }, data);
}

export async function pushChatAck(page: Page, data: any) {
  await page.evaluate((d) => {
    window.dispatchEvent(new CustomEvent('rt:event', { detail: { type:'chat.ack', data: d }}));
  }, data);
}





