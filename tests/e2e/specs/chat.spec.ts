import { test, expect } from './.setup';
import { pushChatAck, pushChatMessage } from '../helpers/realtime';

test('send text → pending → ack', async ({ page }) => {
  await page.goto('/chat/demo');
  await expect(page.getByTestId('message-list')).toBeVisible();

  // отправляем
  await page.getByTestId('composer-input').fill('hello e2e');
  await page.getByTestId('composer-send').click();
  const pending = page.getByTestId('msg-text').last();
  await expect(pending).toBeVisible();

  // имитируем ack от сервера (замени tempId на фактический, здесь используем поиск последнего)
  const tempId = await pending.getAttribute('data-id');
  await pushChatAck(page, { tempId, chatId: 'demo', serverId: 'srv_e2e' });

  // pending должен исчезнуть/смениться
  await expect(page.locator(`[data-testid="msg-text"][data-id="srv_e2e"]`)).toBeVisible();
});

test('incoming message via realtime', async ({ page }) => {
  await page.goto('/chat/demo');
  await pushChatMessage(page, {
    id: 'srv_in', chatId: 'demo', authorId: 'u2', authorName: 'Operator',
    kind: 'text', text: 'realtime hi', createdAtISO: new Date().toISOString()
  });
  await expect(page.getByText('realtime hi')).toBeVisible();
});


