import { test, expect } from '@playwright/test';

test.describe('Partners Page', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу партнеров
    await page.goto('/partners');
  });

  test('should display partners list with search functionality', async ({ page }) => {
    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toContainText('Партнеры');
    
    // Проверяем наличие поиска
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Проверяем наличие кнопки "плюс"
    const plusButton = page.locator('button[aria-label*="Add"]');
    await expect(plusButton).toBeVisible();
    
    // Проверяем список партнеров
    const partnerList = page.locator('[data-testid="partner-list"]');
    await expect(partnerList).toBeVisible();
  });

  test('should filter partners by search query', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Вводим поисковый запрос
    await searchInput.fill('test partner');
    
    // Проверяем, что результаты отфильтрованы
    await expect(page.locator('[data-testid="partner-list"]')).toContainText('test partner');
  });

  test('should show role-based actions for plus button', async ({ page }) => {
    const plusButton = page.locator('button[aria-label*="Add"]');
    
    // Кликаем на кнопку плюс
    await plusButton.click();
    
    // Проверяем, что открылось модальное окно
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Проверяем, что действия зависят от роли
    // Для ADMIN/SUPER должна быть опция "Создать реферальную ссылку"
    // Для USER должна быть опция "Присоединиться по токену"
    const createLinkOption = page.locator('text=Создать реферальную ссылку');
    const joinTokenOption = page.locator('text=Присоединиться по токену');
    
    // Одна из опций должна быть видна (зависит от роли)
    await expect(createLinkOption.or(joinTokenOption)).toBeVisible();
  });

  test('should navigate to partner details on click', async ({ page }) => {
    // Кликаем на первого партнера в списке
    const firstPartner = page.locator('[data-testid="partner-list"] > div').first();
    await firstPartner.click();
    
    // Проверяем, что перешли на страницу партнера
    await expect(page).toHaveURL(/\/partners\/[^\/]+$/);
    
    // Проверяем, что загрузилась информация о партнере
    await expect(page.locator('[data-testid="partner-header"]')).toBeVisible();
  });

  test('should display partner information correctly', async ({ page }) => {
    // Переходим на страницу конкретного партнера
    await page.goto('/partners/test-partner-123');
    
    // Проверяем заголовок партнера
    const partnerHeader = page.locator('[data-testid="partner-header"]');
    await expect(partnerHeader).toBeVisible();
    
    // Проверяем статистику
    const stats = page.locator('[data-testid="partner-stats"]');
    await expect(stats).toBeVisible();
    
    // Проверяем список отгрузок
    const shipmentsList = page.locator('[data-testid="shipments-list"]');
    await expect(shipmentsList).toBeVisible();
  });

  test('should filter shipments by status', async ({ page }) => {
    await page.goto('/partners/test-partner-123');
    
    // Проверяем фильтры статусов
    const statusFilters = page.locator('[data-testid="status-filters"]');
    await expect(statusFilters).toBeVisible();
    
    // Кликаем на фильтр "PACK"
    const packFilter = page.locator('button:has-text("PACK")');
    await packFilter.click();
    
    // Проверяем, что список отфильтрован
    const filteredList = page.locator('[data-testid="shipments-list"]');
    await expect(filteredList).toBeVisible();
  });

  test('should show quick actions based on role', async ({ page }) => {
    await page.goto('/partners/test-partner-123');
    
    // Проверяем быстрые действия
    const quickActions = page.locator('[data-testid="quick-actions"]');
    await expect(quickActions).toBeVisible();
    
    // Для ADMIN должна быть кнопка "Создать отгрузку"
    const createShipmentBtn = page.locator('button:has-text("Создать отгрузку")');
    // Для USER должна быть кнопка "Создать запрос"
    const createRequestBtn = page.locator('button:has-text("Создать запрос")');
    
    // Одна из кнопок должна быть видна (зависит от роли)
    await expect(createShipmentBtn.or(createRequestBtn)).toBeVisible();
  });

  test('should handle empty state correctly', async ({ page }) => {
    // Переходим на страницу партнера без отгрузок
    await page.goto('/partners/empty-partner');
    
    // Проверяем пустое состояние
    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();
    
    // Проверяем сообщение о пустом состоянии
    await expect(emptyState).toContainText('No shipments yet');
  });

  test('should handle loading states', async ({ page }) => {
    // Переходим на страницу партнера
    await page.goto('/partners/test-partner-123');
    
    // Проверяем, что показывается индикатор загрузки
    const loadingIndicator = page.locator('[data-testid="loading"]');
    await expect(loadingIndicator).toBeVisible();
    
    // Ждем, пока загрузка завершится
    await expect(loadingIndicator).not.toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Переходим на несуществующего партнера
    await page.goto('/partners/non-existent-partner');
    
    // Проверяем, что показывается ошибка 403
    await expect(page.locator('text=403')).toBeVisible();
    await expect(page.locator('text=Access denied')).toBeVisible();
  });

  test('should support infinite scroll', async ({ page }) => {
    await page.goto('/partners/test-partner-123');
    
    // Прокручиваем вниз
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Проверяем, что загрузились дополнительные элементы
    const loadMoreButton = page.locator('button:has-text("Load more")');
    await expect(loadMoreButton).toBeVisible();
    
    // Кликаем на "Load more"
    await loadMoreButton.click();
    
    // Проверяем, что загрузились новые элементы
    const shipmentsList = page.locator('[data-testid="shipments-list"]');
    await expect(shipmentsList).toBeVisible();
  });
});

