import { test, expect } from '@playwright/test';

test.describe('WMS Core', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу чата с WMS
    await page.goto('/chat/test-chat-123');
  });

  test('should display WMS panel', async ({ page }) => {
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Проверяем, что панель открылась
    const wmsPanel = page.locator('[data-testid="wms-panel"]');
    await expect(wmsPanel).toBeVisible();
    
    // Проверяем табы
    const receivingTab = page.locator('[data-testid="receiving-tab"]');
    await expect(receivingTab).toBeVisible();
    
    const reconcileTab = page.locator('[data-testid="reconcile-tab"]');
    await expect(reconcileTab).toBeVisible();
    
    const qaTab = page.locator('[data-testid="qa-tab"]');
    await expect(qaTab).toBeVisible();
    
    const putawayTab = page.locator('[data-testid="putaway-tab"]');
    await expect(putawayTab).toBeVisible();
    
    const returnsTab = page.locator('[data-testid="returns-tab"]');
    await expect(returnsTab).toBeVisible();
  });

  test('should handle receiving operations', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб Receiving
    const receivingTab = page.locator('[data-testid="receiving-tab"]');
    await receivingTab.click();
    
    // Проверяем, что таб активен
    await expect(receivingTab).toHaveClass(/active/);
    
    // Начинаем сессию приёмки
    const startSessionButton = page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    
    // Проверяем, что сессия началась
    const sessionStatus = page.locator('[data-testid="session-status"]');
    await expect(sessionStatus).toContainText('Active');
    
    // Добавляем позицию
    const addItemButton = page.locator('button:has-text("Add Item")');
    await addItemButton.click();
    
    // Заполняем форму позиции
    const skuInput = page.locator('input[name="sku"]');
    await skuInput.fill('SKU123');
    
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('Test Item');
    
    const expectedQtyInput = page.locator('input[name="expectedQty"]');
    await expectedQtyInput.fill('10');
    
    const receivedQtyInput = page.locator('input[name="receivedQty"]');
    await receivedQtyInput.fill('8');
    
    // Сохраняем позицию
    const saveItemButton = page.locator('button:has-text("Save")');
    await saveItemButton.click();
    
    // Проверяем, что позиция добавилась
    const itemList = page.locator('[data-testid="items-list"]');
    await expect(itemList).toContainText('SKU123');
    
    // Загружаем фото
    const photoUpload = page.locator('input[type="file"]');
    await photoUpload.setInputFiles('test-files/test-image.jpg');
    
    // Проверяем, что фото загрузилось
    const photoStrip = page.locator('[data-testid="photo-strip"]');
    await expect(photoStrip).toBeVisible();
    
    // Закрываем сессию
    const closeSessionButton = page.locator('button:has-text("Close Session")');
    await closeSessionButton.click();
    
    // Проверяем, что сессия закрылась
    await expect(sessionStatus).toContainText('Closed');
  });

  test('should handle reconcile operations', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб Reconcile
    const reconcileTab = page.locator('[data-testid="reconcile-tab"]');
    await reconcileTab.click();
    
    // Создаем расхождение
    const createDiffButton = page.locator('button:has-text("Create Diff")');
    await createDiffButton.click();
    
    // Заполняем форму расхождения
    const diffTypeSelect = page.locator('select[name="type"]');
    await diffTypeSelect.selectOption('OVER');
    
    const deltaUnitsInput = page.locator('input[name="deltaUnits"]');
    await deltaUnitsInput.fill('2');
    
    const commentInput = page.locator('textarea[name="comment"]');
    await commentInput.fill('Extra items received');
    
    // Сохраняем расхождение
    const saveDiffButton = page.locator('button:has-text("Save")');
    await saveDiffButton.click();
    
    // Проверяем, что расхождение создалось
    const diffsList = page.locator('[data-testid="diffs-list"]');
    await expect(diffsList).toContainText('OVER');
  });

  test('should handle QA operations', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб QA
    const qaTab = page.locator('[data-testid="qa-tab"]');
    await qaTab.click();
    
    // Создаем QA проблему
    const createIssueButton = page.locator('button:has-text("Create Issue")');
    await createIssueButton.click();
    
    // Заполняем форму проблемы
    const severitySelect = page.locator('select[name="severity"]');
    await severitySelect.selectOption('HIGH');
    
    const kindSelect = page.locator('select[name="kind"]');
    await kindSelect.selectOption('BROKEN');
    
    const commentInput = page.locator('textarea[name="comment"]');
    await commentInput.fill('Item is damaged');
    
    // Сохраняем проблему
    const saveIssueButton = page.locator('button:has-text("Save")');
    await saveIssueButton.click();
    
    // Проверяем, что проблема создалась
    const issuesList = page.locator('[data-testid="issues-list"]');
    await expect(issuesList).toContainText('HIGH');
    await expect(issuesList).toContainText('BROKEN');
  });

  test('should handle putaway operations', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб Putaway
    const putawayTab = page.locator('[data-testid="putaway-tab"]');
    await putawayTab.click();
    
    // Проверяем доступные ячейки
    const binsList = page.locator('[data-testid="bins-list"]');
    await expect(binsList).toBeVisible();
    
    // Выполняем перемещение
    const performMoveButton = page.locator('button:has-text("Perform Move")');
    await performMoveButton.click();
    
    // Заполняем форму перемещения
    const binSelect = page.locator('select[name="binId"]');
    await binSelect.selectOption('A1-B2-C3');
    
    const qtyInput = page.locator('input[name="qty"]');
    await qtyInput.fill('5');
    
    // Сохраняем перемещение
    const saveMoveButton = page.locator('button:has-text("Save")');
    await saveMoveButton.click();
    
    // Проверяем, что перемещение выполнилось
    const movesHistory = page.locator('[data-testid="moves-history"]');
    await expect(movesHistory).toContainText('A1-B2-C3');
  });

  test('should handle returns operations', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб Returns
    const returnsTab = page.locator('[data-testid="returns-tab"]');
    await returnsTab.click();
    
    // Создаем случай возврата
    const createReturnButton = page.locator('button:has-text("Create Return")');
    await createReturnButton.click();
    
    // Заполняем форму возврата
    const reasonSelect = page.locator('select[name="reason"]');
    await reasonSelect.selectOption('USER_REFUSED');
    
    const itemsInput = page.locator('textarea[name="items"]');
    await itemsInput.fill('Item 1, Item 2');
    
    // Сохраняем возврат
    const saveReturnButton = page.locator('button:has-text("Save")');
    await saveReturnButton.click();
    
    // Проверяем, что возврат создался
    const returnsList = page.locator('[data-testid="returns-list"]');
    await expect(returnsList).toContainText('USER_REFUSED');
  });

  test('should handle scanner functionality', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб Receiving
    const receivingTab = page.locator('[data-testid="receiving-tab"]');
    await receivingTab.click();
    
    // Активируем сканер
    const scannerButton = page.locator('button:has-text("Scan")');
    await scannerButton.click();
    
    // Проверяем, что сканер активировался
    const scanBox = page.locator('[data-testid="scan-box"]');
    await expect(scanBox).toBeVisible();
    
    // Симулируем сканирование
    const scanInput = page.locator('input[data-testid="scan-input"]');
    await scanInput.fill('QR123456');
    
    // Проверяем, что код отсканировался
    const scannedCode = page.locator('[data-testid="scanned-code"]');
    await expect(scannedCode).toContainText('QR123456');
  });

  test('should handle photo uploads', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Переходим на таб Receiving
    const receivingTab = page.locator('[data-testid="receiving-tab"]');
    await receivingTab.click();
    
    // Загружаем фото
    const photoUpload = page.locator('input[type="file"]');
    await photoUpload.setInputFiles('test-files/test-image.jpg');
    
    // Проверяем, что фото загрузилось
    const photoStrip = page.locator('[data-testid="photo-strip"]');
    await expect(photoStrip).toBeVisible();
    
    // Проверяем превью фото
    const photoPreview = page.locator('[data-testid="photo-preview"]');
    await expect(photoPreview).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Проверяем, что показывается индикатор загрузки
    const loadingIndicator = page.locator('[data-testid="loading"]');
    await expect(loadingIndicator).toBeVisible();
    
    // Ждем, пока загрузка завершится
    await expect(loadingIndicator).not.toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Симулируем ошибку сети
    await page.route('**/api/wms/**', route => route.abort());
    
    // Пытаемся выполнить операцию
    const receivingTab = page.locator('[data-testid="receiving-tab"]');
    await receivingTab.click();
    
    // Проверяем, что показывается ошибка
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should integrate with FSM', async ({ page }) => {
    await page.goto('/chat/test-chat-123');
    
    // Проверяем, что WMS gates интегрированы в FSM
    const statusHeader = page.locator('[data-testid="status-header"]');
    await expect(statusHeader).toBeVisible();
    
    // Проверяем, что статус учитывает WMS операции
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toBeVisible();
  });

  test('should handle mobile view', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/chat/test-chat-123');
    
    // Открываем WMS панель
    const wmsButton = page.locator('button:has-text("WMS")');
    await wmsButton.click();
    
    // Проверяем, что панель адаптируется под мобильный экран
    const wmsPanel = page.locator('[data-testid="wms-panel"]');
    await expect(wmsPanel).toBeVisible();
    
    // Проверяем, что табы работают на мобильном
    const receivingTab = page.locator('[data-testid="receiving-tab"]');
    await receivingTab.click();
    
    await expect(receivingTab).toHaveClass(/active/);
  });
});

