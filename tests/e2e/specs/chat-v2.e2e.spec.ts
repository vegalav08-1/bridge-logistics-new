import { test, expect } from '@playwright/test';

test.describe('Chat V2', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a chat page with Chat V2 enabled
    await page.goto('/chat/test-chat-id');
  });

  test('should display Chat V2 interface when enabled', async ({ page }) => {
    // Check if Chat V2 components are visible
    await expect(page.locator('[data-testid="chat-v2-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-v2-input"]')).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await messageInput.fill('Hello, this is a test message');
    await sendButton.click();
    
    // Check if message appears in the chat
    await expect(page.locator('text=Hello, this is a test message')).toBeVisible();
  });

  test('should handle mentions', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    
    // Type @ to trigger mention suggestions
    await messageInput.fill('@');
    
    // Check if mention suggestions appear
    await expect(page.locator('[data-testid="mention-suggestions"]')).toBeVisible();
    
    // Select a mention
    await page.locator('[data-testid="mention-suggestion"]').first().click();
    
    // Send the message
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if message with mention appears
    await expect(page.locator('text=@user1')).toBeVisible();
  });

  test('should open settings drawer', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="chat-settings-button"]');
    await settingsButton.click();
    
    // Check if settings drawer opens
    await expect(page.locator('[data-testid="chat-settings-drawer"]')).toBeVisible();
    await expect(page.locator('text=Настройки чата')).toBeVisible();
  });

  test('should open participants drawer', async ({ page }) => {
    const participantsButton = page.locator('[data-testid="participants-button"]');
    await participantsButton.click();
    
    // Check if participants drawer opens
    await expect(page.locator('[data-testid="participants-drawer"]')).toBeVisible();
    await expect(page.locator('text=Участники чата')).toBeVisible();
  });

  test('should manage participants', async ({ page }) => {
    // Open participants drawer
    await page.locator('[data-testid="participants-button"]').click();
    
    // Check if participants are listed
    await expect(page.locator('[data-testid="participant-item"]')).toBeVisible();
    
    // Test mute functionality
    const muteButton = page.locator('[data-testid="mute-button"]').first();
    await muteButton.click();
    
    // Check if mute status changes
    await expect(muteButton).toHaveAttribute('data-muted', 'true');
  });

  test('should handle message pinning', async ({ page }) => {
    // Send a message first
    await page.locator('[data-testid="message-input"]').fill('Test message for pinning');
    await page.locator('[data-testid="send-button"]').click();
    
    // Find the message and pin it
    const messageElement = page.locator('[data-testid="message-bubble"]').first();
    const pinButton = messageElement.locator('[data-testid="pin-button"]');
    await pinButton.click();
    
    // Check if message is pinned
    await expect(messageElement).toHaveAttribute('data-pinned', 'true');
  });

  test('should handle text sanitization', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    
    // Try to send HTML content
    await messageInput.fill('<script>alert("xss")</script>Hello <b>world</b>');
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if HTML is sanitized
    await expect(page.locator('text=Hello world')).toBeVisible();
    await expect(page.locator('text=<script>')).not.toBeVisible();
  });

  test('should handle long messages', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    
    // Try to send a very long message
    const longMessage = 'a'.repeat(5000);
    await messageInput.fill(longMessage);
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if message is truncated
    const sentMessage = page.locator('[data-testid="message-bubble"]').first();
    await expect(sentMessage).toContainText('a'.repeat(4000));
  });

  test('should handle empty messages', async ({ page }) => {
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Try to send empty message
    await sendButton.click();
    
    // Check if no message is sent
    await expect(page.locator('[data-testid="message-bubble"]')).toHaveCount(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/chat2/**', route => route.abort());
    
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.fill('This should fail');
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if error is handled gracefully
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});




