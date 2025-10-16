import { test as base } from '@playwright/test';
import { startHttpMock, stopHttpMock } from '../fixtures/mock-http';

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      // Поднимаем флаги UI2–UI9
      (window as any).__E2E_FLAGS__ = {
        UI_V2_ENABLED: true,
        SHIPMENTS_V2_ENABLED: true,
        CHAT_LIST_V2_ENABLED: true,
        COMPOSER_V2_ENABLED: true,
        VIEWER_V2_ENABLED: true,
        FORMS_V2_ENABLED: true,
        INBOX_V2_ENABLED: true,
        REALTIME_V2_ENABLED: true
      };
    });
    await use(context);
  },
  page: async ({ page }, use) => {
    startHttpMock();
    await use(page);
    stopHttpMock();
  }
});
export const expect = test.expect;





