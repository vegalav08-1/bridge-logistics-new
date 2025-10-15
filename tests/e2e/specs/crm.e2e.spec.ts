import { test, expect } from '@playwright/test';

test.describe('CRM 360°', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу CRM
    await page.goto('/crm/list');
  });

  test('should display CRM list with profiles', async ({ page }) => {
    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toContainText('CRM List');
    
    // Проверяем список профилей
    const profilesList = page.locator('[data-testid="profiles-list"]');
    await expect(profilesList).toBeVisible();
    
    // Проверяем, что есть профили
    const profileItems = page.locator('[data-testid="profile-item"]');
    await expect(profileItems).toHaveCount.greaterThan(0);
  });

  test('should navigate to profile details', async ({ page }) => {
    // Кликаем на первый профиль
    const firstProfile = page.locator('[data-testid="profile-item"]').first();
    await firstProfile.click();
    
    // Проверяем, что перешли на страницу профиля
    await expect(page).toHaveURL(/\/crm\/[^\/]+\/[^\/]+$/);
    
    // Проверяем заголовок профиля
    const profileHeader = page.locator('[data-testid="profile-header"]');
    await expect(profileHeader).toBeVisible();
  });

  test('should display profile information correctly', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем заголовок профиля
    const profileHeader = page.locator('[data-testid="profile-header"]');
    await expect(profileHeader).toBeVisible();
    
    // Проверяем KPI
    const kpiSection = page.locator('[data-testid="kpi-section"]');
    await expect(kpiSection).toBeVisible();
    
    // Проверяем сегменты
    const segmentsSection = page.locator('[data-testid="segments-section"]');
    await expect(segmentsSection).toBeVisible();
    
    // Проверяем таймлайн
    const timelineSection = page.locator('[data-testid="timeline-section"]');
    await expect(timelineSection).toBeVisible();
  });

  test('should display contacts and addresses', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем контакты
    const contactsSection = page.locator('[data-testid="contacts-section"]');
    await expect(contactsSection).toBeVisible();
    
    // Проверяем адреса
    const addressesSection = page.locator('[data-testid="addresses-section"]');
    await expect(addressesSection).toBeVisible();
  });

  test('should allow editing profile information', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Кликаем на кнопку редактирования
    const editButton = page.locator('button:has-text("Edit")');
    await editButton.click();
    
    // Проверяем, что открылась форма редактирования
    const editForm = page.locator('[data-testid="edit-form"]');
    await expect(editForm).toBeVisible();
    
    // Редактируем имя
    const nameInput = page.locator('input[name="displayName"]');
    await nameInput.clear();
    await nameInput.fill('Updated Name');
    
    // Сохраняем изменения
    const saveButton = page.locator('button:has-text("Save")');
    await saveButton.click();
    
    // Проверяем, что изменения сохранились
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });

  test('should display timeline events', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем таймлайн
    const timeline = page.locator('[data-testid="timeline"]');
    await expect(timeline).toBeVisible();
    
    // Проверяем события в таймлайне
    const timelineEvents = page.locator('[data-testid="timeline-event"]');
    await expect(timelineEvents).toHaveCount.greaterThan(0);
    
    // Проверяем типы событий
    const orderEvent = page.locator('[data-testid="timeline-event"]:has-text("order")');
    const statusEvent = page.locator('[data-testid="timeline-event"]:has-text("status")');
    const paymentEvent = page.locator('[data-testid="timeline-event"]:has-text("payment")');
    
    // Хотя бы один тип событий должен быть
    await expect(orderEvent.or(statusEvent).or(paymentEvent)).toBeVisible();
  });

  test('should display tasks', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем секцию задач
    const tasksSection = page.locator('[data-testid="tasks-section"]');
    await expect(tasksSection).toBeVisible();
    
    // Проверяем список задач
    const tasksList = page.locator('[data-testid="tasks-list"]');
    await expect(tasksList).toBeVisible();
  });

  test('should allow creating new tasks', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Кликаем на кнопку создания задачи
    const createTaskButton = page.locator('button:has-text("Create Task")');
    await createTaskButton.click();
    
    // Проверяем, что открылась форма создания задачи
    const createTaskForm = page.locator('[data-testid="create-task-form"]');
    await expect(createTaskForm).toBeVisible();
    
    // Заполняем форму
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('New Task');
    
    const notesInput = page.locator('textarea[name="notes"]');
    await notesInput.fill('Task notes');
    
    // Создаем задачу
    const submitButton = page.locator('button:has-text("Create")');
    await submitButton.click();
    
    // Проверяем, что задача создалась
    await expect(page.locator('text=New Task')).toBeVisible();
  });

  test('should display KPI metrics', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем KPI секцию
    const kpiSection = page.locator('[data-testid="kpi-section"]');
    await expect(kpiSection).toBeVisible();
    
    // Проверяем метрики
    const ltvMetric = page.locator('[data-testid="ltv-metric"]');
    await expect(ltvMetric).toBeVisible();
    
    const arpuMetric = page.locator('[data-testid="arpu-metric"]');
    await expect(arpuMetric).toBeVisible();
    
    const ordersCountMetric = page.locator('[data-testid="orders-count-metric"]');
    await expect(ordersCountMetric).toBeVisible();
  });

  test('should display segments', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем секцию сегментов
    const segmentsSection = page.locator('[data-testid="segments-section"]');
    await expect(segmentsSection).toBeVisible();
    
    // Проверяем сегменты
    const segmentsList = page.locator('[data-testid="segments-list"]');
    await expect(segmentsList).toBeVisible();
    
    // Проверяем, что есть сегменты
    const segmentItems = page.locator('[data-testid="segment-item"]');
    await expect(segmentItems).toHaveCount.greaterThan(0);
  });

  test('should filter profiles by segments', async ({ page }) => {
    // Переходим на список профилей
    await page.goto('/crm/list');
    
    // Проверяем фильтры сегментов
    const segmentFilters = page.locator('[data-testid="segment-filters"]');
    await expect(segmentFilters).toBeVisible();
    
    // Выбираем сегмент
    const segmentFilter = page.locator('button:has-text("VIP")');
    await segmentFilter.click();
    
    // Проверяем, что список отфильтрован
    const filteredList = page.locator('[data-testid="profiles-list"]');
    await expect(filteredList).toBeVisible();
  });

  test('should handle empty states', async ({ page }) => {
    // Переходим на профиль без данных
    await page.goto('/crm/user/empty-user');
    
    // Проверяем пустое состояние для контактов
    const emptyContacts = page.locator('[data-testid="empty-contacts"]');
    await expect(emptyContacts).toBeVisible();
    
    // Проверяем пустое состояние для адресов
    const emptyAddresses = page.locator('[data-testid="empty-addresses"]');
    await expect(emptyAddresses).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем, что показывается индикатор загрузки
    const loadingIndicator = page.locator('[data-testid="loading"]');
    await expect(loadingIndicator).toBeVisible();
    
    // Ждем, пока загрузка завершится
    await expect(loadingIndicator).not.toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Переходим на несуществующий профиль
    await page.goto('/crm/user/non-existent');
    
    // Проверяем, что показывается ошибка
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Profile not found')).toBeVisible();
  });

  test('should support different entity types', async ({ page }) => {
    // Тестируем профиль пользователя
    await page.goto('/crm/user/u123');
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
    
    // Тестируем профиль партнера
    await page.goto('/crm/partner/p456');
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await page.goto('/crm/user/u123');
    
    // Проверяем быстрые действия
    const quickActions = page.locator('[data-testid="quick-actions"]');
    await expect(quickActions).toBeVisible();
    
    // Проверяем кнопки действий
    const createShipmentBtn = page.locator('button:has-text("Create Shipment")');
    await expect(createShipmentBtn).toBeVisible();
    
    const createTaskBtn = page.locator('button:has-text("Create Task")');
    await expect(createTaskBtn).toBeVisible();
    
    const manageTagsBtn = page.locator('button:has-text("Manage Tags")');
    await expect(manageTagsBtn).toBeVisible();
  });
});

