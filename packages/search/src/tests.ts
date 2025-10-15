import { z } from 'zod';
import { MeiliSearch } from 'meilisearch';
import { Redis } from 'ioredis';
import { 
  SearchAPI, 
  SearchRequest, 
  SearchResponse, 
  SuggestionsRequest, 
  SuggestionsResponse 
} from './api';
import { 
  AnalyticsAPI, 
  AnalyticsQuery, 
  AnalyticsResult, 
  Metric, 
  GroupBy, 
  Filter 
} from './analytics';
import { 
  IndexWorker, 
  IndexJob, 
  BulkIndexJob, 
  ReindexJob, 
  CleanupJob, 
  JobData 
} from './worker';
import { 
  Document, 
  ChatDocument, 
  MessageDocument, 
  AttachmentDocument, 
  FinanceDocument, 
  InvoiceDocument,
  validateDocument,
  getDocumentType,
  isChatDocument,
  isMessageDocument,
  isAttachmentDocument,
  isFinanceDocument,
  isInvoiceDocument,
} from './schemas';
import { 
  ACLManager, 
  ACLContext, 
  ACLResult, 
  User, 
  UserRole, 
  ACLPolicy, 
  ACLRule 
} from './acl';
import { 
  ObservabilityManager, 
  ObservabilityConfig, 
  Metric as ObservabilityMetric, 
  Event, 
  Trace 
} from './observability';

// Схема для тестового конфига
export const TestConfigSchema = z.object({
  meilisearchUrl: z.string().default('http://localhost:7700'),
  meilisearchKey: z.string().optional(),
  redisUrl: z.string().default('redis://localhost:6379'),
  testIndexPrefix: z.string().default('test-'),
  cleanupAfterTests: z.boolean().default(true),
});

export type TestConfig = z.infer<typeof TestConfigSchema>;

// Схема для тестовых данных
export const TestDataSchema = z.object({
  chats: z.array(z.any()),
  messages: z.array(z.any()),
  attachments: z.array(z.any()),
  finance: z.array(z.any()),
  invoices: z.array(z.any()),
});

export type TestData = z.infer<typeof TestDataSchema>;

// Класс для тестирования поиска
export class SearchTestSuite {
  private config: TestConfig;
  private meilisearch: MeiliSearch;
  private searchAPI: SearchAPI;
  private testData: TestData;

  constructor(config: TestConfig) {
    this.config = config;
    this.meilisearch = new MeiliSearch({
      host: config.meilisearchUrl,
      apiKey: config.meilisearchKey,
    });
    this.searchAPI = new SearchAPI(this.meilisearch);
    this.testData = this.generateTestData();
  }

  // Генерация тестовых данных
  private generateTestData(): TestData {
    const now = new Date().toISOString();
    
    const chats: ChatDocument[] = [
      {
        id: 'chat-1',
        type: 'chat',
        chatId: 'chat-1',
        number: 'CHAT-001',
        requestOldTrackNumber: 'OLD-123',
        shipmentTrackingNumber: 'NEW-456',
        preview: 'Тестовый чат для поиска',
        status: 'active',
        adminEmail: 'admin@test.com',
        userEmail: 'user@test.com',
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'chat-2',
        type: 'chat',
        chatId: 'chat-2',
        number: 'CHAT-002',
        preview: 'Другой чат с важной информацией',
        status: 'completed',
        adminEmail: 'admin2@test.com',
        userEmail: 'user2@test.com',
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const messages: MessageDocument[] = [
      {
        id: 'msg-1',
        type: 'message',
        chatId: 'chat-1',
        text: 'Привет! Это тестовое сообщение для поиска.',
        authorEmail: 'user@test.com',
        kind: 'user',
        seq: 1,
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'msg-2',
        type: 'message',
        chatId: 'chat-1',
        text: 'Ответ от администратора с важной информацией.',
        authorEmail: 'admin@test.com',
        kind: 'admin',
        seq: 2,
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const attachments: AttachmentDocument[] = [
      {
        id: 'att-1',
        type: 'attachment',
        chatId: 'chat-1',
        fileName: 'test-document.pdf',
        mime: 'application/pdf',
        fileType: 'pdf',
        bytes: 1024000,
        thumbReady: true,
        pages: 10,
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'att-2',
        type: 'attachment',
        chatId: 'chat-2',
        fileName: 'image.jpg',
        mime: 'image/jpeg',
        fileType: 'image',
        bytes: 512000,
        thumbReady: true,
        width: 1920,
        height: 1080,
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const finance: FinanceDocument[] = [
      {
        id: 'fin-1',
        type: 'finance',
        chatId: 'chat-1',
        title: 'Оплата за услуги',
        opKind: 'CHARGE',
        amount: '1000.00',
        currency: 'RUB',
        invoiceNumber: 'INV-001',
        invoiceStatus: 'paid',
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fin-2',
        type: 'finance',
        chatId: 'chat-2',
        title: 'Возврат средств',
        opKind: 'REFUND',
        amount: '500.00',
        currency: 'RUB',
        invoiceNumber: 'INV-002',
        invoiceStatus: 'pending',
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const invoices: InvoiceDocument[] = [
      {
        id: 'inv-1',
        type: 'invoice',
        chatId: 'chat-1',
        number: 'INV-001',
        status: 'paid',
        amount: '1000.00',
        currency: 'RUB',
        dueDate: now,
        paidAt: now,
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    return {
      chats,
      messages,
      attachments,
      finance,
      invoices,
    };
  }

  // Настройка тестовых индексов
  async setupTestIndexes(): Promise<void> {
    const indexes = [
      { name: 'test-chats', documents: this.testData.chats },
      { name: 'test-messages', documents: this.testData.messages },
      { name: 'test-attachments', documents: this.testData.attachments },
      { name: 'test-finance', documents: this.testData.finance },
      { name: 'test-invoices', documents: this.testData.invoices },
    ];

    for (const index of indexes) {
      try {
        await this.meilisearch.createIndex(index.name, { primaryKey: 'id' });
        await this.meilisearch.index(index.name).addDocuments(index.documents);
      } catch (error) {
        console.warn(`Index ${index.name} might already exist:`, error);
      }
    }
  }

  // Очистка тестовых индексов
  async cleanupTestIndexes(): Promise<void> {
    if (!this.config.cleanupAfterTests) return;

    const indexNames = [
      'test-chats',
      'test-messages', 
      'test-attachments',
      'test-finance',
      'test-invoices',
    ];

    for (const indexName of indexNames) {
      try {
        await this.meilisearch.deleteIndex(indexName);
      } catch (error) {
        console.warn(`Failed to delete index ${indexName}:`, error);
      }
    }
  }

  // Тест поиска по чатам
  async testChatSearch(): Promise<boolean> {
    try {
      const request: SearchRequest = {
        query: 'тестовый чат',
        documentTypes: ['chat'],
        limit: 10,
      };

      const response = await this.searchAPI.search(request);
      
      // Проверяем, что найдены результаты
      if (response.totalHits === 0) {
        throw new Error('No chat results found');
      }

      // Проверяем, что все результаты - чаты
      const nonChatResults = response.hits.filter(hit => hit.type !== 'chat');
      if (nonChatResults.length > 0) {
        throw new Error('Found non-chat results in chat search');
      }

      console.log('✅ Chat search test passed');
      return true;
    } catch (error) {
      console.error('❌ Chat search test failed:', error);
      return false;
    }
  }

  // Тест поиска по сообщениям
  async testMessageSearch(): Promise<boolean> {
    try {
      const request: SearchRequest = {
        query: 'тестовое сообщение',
        documentTypes: ['message'],
        limit: 10,
      };

      const response = await this.searchAPI.search(request);
      
      if (response.totalHits === 0) {
        throw new Error('No message results found');
      }

      const nonMessageResults = response.hits.filter(hit => hit.type !== 'message');
      if (nonMessageResults.length > 0) {
        throw new Error('Found non-message results in message search');
      }

      console.log('✅ Message search test passed');
      return true;
    } catch (error) {
      console.error('❌ Message search test failed:', error);
      return false;
    }
  }

  // Тест поиска по вложениям
  async testAttachmentSearch(): Promise<boolean> {
    try {
      const request: SearchRequest = {
        query: 'test-document',
        documentTypes: ['attachment'],
        limit: 10,
      };

      const response = await this.searchAPI.search(request);
      
      if (response.totalHits === 0) {
        throw new Error('No attachment results found');
      }

      const nonAttachmentResults = response.hits.filter(hit => hit.type !== 'attachment');
      if (nonAttachmentResults.length > 0) {
        throw new Error('Found non-attachment results in attachment search');
      }

      console.log('✅ Attachment search test passed');
      return true;
    } catch (error) {
      console.error('❌ Attachment search test failed:', error);
      return false;
    }
  }

  // Тест поиска по финансам
  async testFinanceSearch(): Promise<boolean> {
    try {
      const request: SearchRequest = {
        query: 'оплата',
        documentTypes: ['finance'],
        limit: 10,
      };

      const response = await this.searchAPI.search(request);
      
      if (response.totalHits === 0) {
        throw new Error('No finance results found');
      }

      const nonFinanceResults = response.hits.filter(hit => hit.type !== 'finance');
      if (nonFinanceResults.length > 0) {
        throw new Error('Found non-finance results in finance search');
      }

      console.log('✅ Finance search test passed');
      return true;
    } catch (error) {
      console.error('❌ Finance search test failed:', error);
      return false;
    }
  }

  // Тест поиска по инвойсам
  async testInvoiceSearch(): Promise<boolean> {
    try {
      const request: SearchRequest = {
        query: 'INV-001',
        documentTypes: ['invoice'],
        limit: 10,
      };

      const response = await this.searchAPI.search(request);
      
      if (response.totalHits === 0) {
        throw new Error('No invoice results found');
      }

      const nonInvoiceResults = response.hits.filter(hit => hit.type !== 'invoice');
      if (nonInvoiceResults.length > 0) {
        throw new Error('Found non-invoice results in invoice search');
      }

      console.log('✅ Invoice search test passed');
      return true;
    } catch (error) {
      console.error('❌ Invoice search test failed:', error);
      return false;
    }
  }

  // Тест подсказок
  async testSuggestions(): Promise<boolean> {
    try {
      const request: SuggestionsRequest = {
        query: 'тест',
        limit: 5,
      };

      const response = await this.searchAPI.getSuggestions(request);
      
      if (response.suggestions.length === 0) {
        throw new Error('No suggestions found');
      }

      console.log('✅ Suggestions test passed');
      return true;
    } catch (error) {
      console.error('❌ Suggestions test failed:', error);
      return false;
    }
  }

  // Тест фильтрации
  async testFiltering(): Promise<boolean> {
    try {
      const request: SearchRequest = {
        query: '*',
        documentTypes: ['chat'],
        filters: ['status = active'],
        limit: 10,
      };

      const response = await this.searchAPI.search(request);
      
      // Проверяем, что все результаты имеют статус 'active'
      const nonActiveResults = response.hits.filter(hit => 
        hit.type === 'chat' && (hit as ChatDocument).status !== 'active'
      );
      
      if (nonActiveResults.length > 0) {
        throw new Error('Found non-active results in filtered search');
      }

      console.log('✅ Filtering test passed');
      return true;
    } catch (error) {
      console.error('❌ Filtering test failed:', error);
      return false;
    }
  }

  // Тест пагинации
  async testPagination(): Promise<boolean> {
    try {
      const request1: SearchRequest = {
        query: '*',
        limit: 1,
        offset: 0,
      };

      const request2: SearchRequest = {
        query: '*',
        limit: 1,
        offset: 1,
      };

      const response1 = await this.searchAPI.search(request1);
      const response2 = await this.searchAPI.search(request2);
      
      if (response1.hits.length === 0 || response2.hits.length === 0) {
        throw new Error('Pagination returned empty results');
      }

      if (response1.hits[0].id === response2.hits[0].id) {
        throw new Error('Pagination returned duplicate results');
      }

      console.log('✅ Pagination test passed');
      return true;
    } catch (error) {
      console.error('❌ Pagination test failed:', error);
      return false;
    }
  }

  // Запуск всех тестов поиска
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting search tests...');
    
    await this.setupTestIndexes();
    
    const tests = [
      () => this.testChatSearch(),
      () => this.testMessageSearch(),
      () => this.testAttachmentSearch(),
      () => this.testFinanceSearch(),
      () => this.testInvoiceSearch(),
      () => this.testSuggestions(),
      () => this.testFiltering(),
      () => this.testPagination(),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Test execution error:', error);
        failed++;
      }
    }

    await this.cleanupTestIndexes();

    const total = passed + failed;
    console.log(`\n📊 Search tests completed: ${passed}/${total} passed`);

    return { passed, failed, total };
  }
}

// Класс для тестирования аналитики
export class AnalyticsTestSuite {
  private config: TestConfig;
  private meilisearch: MeiliSearch;
  private analyticsAPI: AnalyticsAPI;
  private testData: TestData;

  constructor(config: TestConfig) {
    this.config = config;
    this.meilisearch = new MeiliSearch({
      host: config.meilisearchUrl,
      apiKey: config.meilisearchKey,
    });
    this.analyticsAPI = new AnalyticsAPI(this.meilisearch);
    this.testData = this.generateTestData();
  }

  // Генерация тестовых данных (аналогично SearchTestSuite)
  private generateTestData(): TestData {
    // Используем те же данные, что и в SearchTestSuite
    const now = new Date().toISOString();
    
    const chats: ChatDocument[] = [
      {
        id: 'chat-1',
        type: 'chat',
        chatId: 'chat-1',
        number: 'CHAT-001',
        status: 'active',
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'chat-2',
        type: 'chat',
        chatId: 'chat-2',
        number: 'CHAT-002',
        status: 'completed',
        roles: ['admin', 'user'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const messages: MessageDocument[] = [];
    const attachments: AttachmentDocument[] = [];
    const finance: FinanceDocument[] = [];
    const invoices: InvoiceDocument[] = [];

    return { chats, messages, attachments, finance, invoices };
  }

  // Тест подсчёта метрик
  async testCountMetrics(): Promise<boolean> {
    try {
      const query: AnalyticsQuery = {
        metrics: [{ name: 'total', type: 'count' }],
        documentTypes: ['chat'],
      };

      const result = await this.analyticsAPI.executeQuery(query);
      
      if (result.data.length === 0) {
        throw new Error('No analytics data returned');
      }

      console.log('✅ Count metrics test passed');
      return true;
    } catch (error) {
      console.error('❌ Count metrics test failed:', error);
      return false;
    }
  }

  // Тест группировки
  async testGrouping(): Promise<boolean> {
    try {
      const query: AnalyticsQuery = {
        metrics: [{ name: 'count', type: 'count' }],
        groupBy: [{ field: 'status', label: 'Статус' }],
        documentTypes: ['chat'],
      };

      const result = await this.analyticsAPI.executeQuery(query);
      
      if (result.data.length === 0) {
        throw new Error('No grouped data returned');
      }

      console.log('✅ Grouping test passed');
      return true;
    } catch (error) {
      console.error('❌ Grouping test failed:', error);
      return false;
    }
  }

  // Тест фильтрации
  async testFiltering(): Promise<boolean> {
    try {
      const query: AnalyticsQuery = {
        metrics: [{ name: 'count', type: 'count' }],
        filters: [{ field: 'status', operator: 'eq', value: 'active' }],
        documentTypes: ['chat'],
      };

      const result = await this.analyticsAPI.executeQuery(query);
      
      if (result.data.length === 0) {
        throw new Error('No filtered data returned');
      }

      console.log('✅ Analytics filtering test passed');
      return true;
    } catch (error) {
      console.error('❌ Analytics filtering test failed:', error);
      return false;
    }
  }

  // Запуск всех тестов аналитики
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting analytics tests...');
    
    const tests = [
      () => this.testCountMetrics(),
      () => this.testGrouping(),
      () => this.testFiltering(),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Test execution error:', error);
        failed++;
      }
    }

    const total = passed + failed;
    console.log(`\n📊 Analytics tests completed: ${passed}/${total} passed`);

    return { passed, failed, total };
  }
}

// Класс для тестирования воркера
export class WorkerTestSuite {
  private config: TestConfig;
  private redis: Redis;
  private worker: IndexWorker;

  constructor(config: TestConfig) {
    this.config = config;
    this.redis = new Redis(config.redisUrl);
    this.worker = new IndexWorker({
      redis: this.redis,
      meilisearch: new MeiliSearch({
        host: config.meilisearchUrl,
        apiKey: config.meilisearchKey,
      }),
    });
  }

  // Тест добавления задачи индексации
  async testAddIndexJob(): Promise<boolean> {
    try {
      const testDocument = {
        id: 'test-doc-1',
        type: 'chat',
        chatId: 'test-chat-1',
        number: 'TEST-001',
        status: 'active',
        roles: ['admin', 'user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.worker.addIndexJob('chat', 'test-doc-1', testDocument);
      
      console.log('✅ Add index job test passed');
      return true;
    } catch (error) {
      console.error('❌ Add index job test failed:', error);
      return false;
    }
  }

  // Тест добавления задачи удаления
  async testAddDeleteJob(): Promise<boolean> {
    try {
      await this.worker.addDeleteJob('chat', 'test-doc-1');
      
      console.log('✅ Add delete job test passed');
      return true;
    } catch (error) {
      console.error('❌ Add delete job test failed:', error);
      return false;
    }
  }

  // Тест добавления задачи обновления
  async testAddUpdateJob(): Promise<boolean> {
    try {
      const testDocument = {
        id: 'test-doc-1',
        type: 'chat',
        chatId: 'test-chat-1',
        number: 'TEST-001',
        status: 'updated',
        roles: ['admin', 'user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.worker.addUpdateJob('chat', 'test-doc-1', testDocument);
      
      console.log('✅ Add update job test passed');
      return true;
    } catch (error) {
      console.error('❌ Add update job test failed:', error);
      return false;
    }
  }

  // Тест массовой индексации
  async testBulkIndexJob(): Promise<boolean> {
    try {
      const testDocuments = [
        {
          id: 'test-doc-1',
          document: {
            id: 'test-doc-1',
            type: 'chat',
            chatId: 'test-chat-1',
            number: 'TEST-001',
            status: 'active',
            roles: ['admin', 'user'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        {
          id: 'test-doc-2',
          document: {
            id: 'test-doc-2',
            type: 'chat',
            chatId: 'test-chat-2',
            number: 'TEST-002',
            status: 'active',
            roles: ['admin', 'user'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ];

      await this.worker.addBulkIndexJob('chat', testDocuments);
      
      console.log('✅ Bulk index job test passed');
      return true;
    } catch (error) {
      console.error('❌ Bulk index job test failed:', error);
      return false;
    }
  }

  // Тест статистики очереди
  async testQueueStats(): Promise<boolean> {
    try {
      const stats = await this.worker.getQueueStats();
      
      if (typeof stats.waiting !== 'number' || typeof stats.active !== 'number') {
        throw new Error('Invalid queue stats format');
      }

      console.log('✅ Queue stats test passed');
      return true;
    } catch (error) {
      console.error('❌ Queue stats test failed:', error);
      return false;
    }
  }

  // Запуск всех тестов воркера
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting worker tests...');
    
    const tests = [
      () => this.testAddIndexJob(),
      () => this.testAddDeleteJob(),
      () => this.testAddUpdateJob(),
      () => this.testBulkIndexJob(),
      () => this.testQueueStats(),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Test execution error:', error);
        failed++;
      }
    }

    const total = passed + failed;
    console.log(`\n📊 Worker tests completed: ${passed}/${total} passed`);

    return { passed, failed, total };
  }
}

// Класс для тестирования ACL
export class ACLTestSuite {
  private aclManager: ACLManager;

  constructor() {
    this.aclManager = new ACLManager();
  }

  // Тест создания контекста
  async testCreateContext(): Promise<boolean> {
    try {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        role: {
          id: 'role-1',
          name: 'user',
          permissions: ['read'],
          tags: ['user'],
        },
      };

      const context = this.aclManager.createContext(user);
      
      if (context.userId !== user.id || context.userRole !== user.role.name) {
        throw new Error('Invalid context created');
      }

      console.log('✅ Create context test passed');
      return true;
    } catch (error) {
      console.error('❌ Create context test failed:', error);
      return false;
    }
  }

  // Тест проверки доступа
  async testCheckAccess(): Promise<boolean> {
    try {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        role: {
          id: 'role-1',
          name: 'user',
          permissions: ['read'],
          tags: ['user'],
        },
      };

      const context = this.aclManager.createContext(user);
      const resource = { type: 'chat', roles: ['user'] };
      
      const result = this.aclManager.checkAccess(context, resource);
      
      if (!result.allowed) {
        throw new Error('Access should be allowed for user role');
      }

      console.log('✅ Check access test passed');
      return true;
    } catch (error) {
      console.error('❌ Check access test failed:', error);
      return false;
    }
  }

  // Тест создания фильтра
  async testCreateFilter(): Promise<boolean> {
    try {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        role: {
          id: 'role-1',
          name: 'user',
          permissions: ['read'],
          tags: ['user'],
        },
      };

      const context = this.aclManager.createContext(user);
      const filters = this.aclManager.createSearchFilter(context);
      
      if (filters.length === 0) {
        throw new Error('No filters created');
      }

      console.log('✅ Create filter test passed');
      return true;
    } catch (error) {
      console.error('❌ Create filter test failed:', error);
      return false;
    }
  }

  // Запуск всех тестов ACL
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting ACL tests...');
    
    const tests = [
      () => this.testCreateContext(),
      () => this.testCheckAccess(),
      () => this.testCreateFilter(),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Test execution error:', error);
        failed++;
      }
    }

    const total = passed + failed;
    console.log(`\n📊 ACL tests completed: ${passed}/${total} passed`);

    return { passed, failed, total };
  }
}

// Класс для тестирования наблюдаемости
export class ObservabilityTestSuite {
  private config: ObservabilityConfig;
  private observabilityManager: ObservabilityManager;

  constructor() {
    this.config = {
      enableMetrics: true,
      enableLogging: true,
      enableTracing: true,
      metricsInterval: 1000,
      logLevel: 'info',
      traceSamplingRate: 1.0,
    };
    this.observabilityManager = new ObservabilityManager(this.config);
  }

  // Тест записи метрик
  async testRecordMetrics(): Promise<boolean> {
    try {
      this.observabilityManager.recordSearchMetrics(
        { query: 'test', limit: 10 },
        { hits: [], totalHits: 0, limit: 10, offset: 0, processingTimeMs: 100, query: 'test' },
        100
      );

      const metrics = this.observabilityManager.getMetrics();
      
      if (metrics.length === 0) {
        throw new Error('No metrics recorded');
      }

      console.log('✅ Record metrics test passed');
      return true;
    } catch (error) {
      console.error('❌ Record metrics test failed:', error);
      return false;
    }
  }

  // Тест логирования
  async testLogging(): Promise<boolean> {
    try {
      this.observabilityManager.logSearch(
        { query: 'test', limit: 10 },
        { hits: [], totalHits: 0, limit: 10, offset: 0, processingTimeMs: 100, query: 'test' },
        100
      );

      const events = this.observabilityManager.getEvents();
      
      if (events.length === 0) {
        throw new Error('No events logged');
      }

      console.log('✅ Logging test passed');
      return true;
    } catch (error) {
      console.error('❌ Logging test failed:', error);
      return false;
    }
  }

  // Тест трассировки
  async testTracing(): Promise<boolean> {
    try {
      const trace = this.observabilityManager.traceSearch({ query: 'test', limit: 10 });
      
      if (!trace.id || trace.operation !== 'search') {
        throw new Error('Invalid trace created');
      }

      // this.observabilityManager.endTrace(trace.id, 'success');

      const traces = this.observabilityManager.getTraces();
      
      if (traces.length === 0) {
        throw new Error('No traces recorded');
      }

      console.log('✅ Tracing test passed');
      return true;
    } catch (error) {
      console.error('❌ Tracing test failed:', error);
      return false;
    }
  }

  // Запуск всех тестов наблюдаемости
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting observability tests...');
    
    const tests = [
      () => this.testRecordMetrics(),
      () => this.testLogging(),
      () => this.testTracing(),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Test execution error:', error);
        failed++;
      }
    }

    const total = passed + failed;
    console.log(`\n📊 Observability tests completed: ${passed}/${total} passed`);

    return { passed, failed, total };
  }
}

// Главный класс для запуска всех тестов
export class TestRunner {
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  // Запуск всех тестов
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting all tests...\n');

    const searchTests = new SearchTestSuite(this.config);
    const analyticsTests = new AnalyticsTestSuite(this.config);
    const workerTests = new WorkerTestSuite(this.config);
    const aclTests = new ACLTestSuite();
    const observabilityTests = new ObservabilityTestSuite();

    const results = await Promise.all([
      searchTests.runAllTests(),
      analyticsTests.runAllTests(),
      workerTests.runAllTests(),
      aclTests.runAllTests(),
      observabilityTests.runAllTests(),
    ]);

    const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
    const totalTests = totalPassed + totalFailed;

    console.log(`\n🎯 All tests completed: ${totalPassed}/${totalTests} passed`);
    
    if (totalFailed > 0) {
      console.log(`❌ ${totalFailed} tests failed`);
    } else {
      console.log('✅ All tests passed!');
    }

    return { passed: totalPassed, failed: totalFailed, total: totalTests };
  }
}

// Экспорт утилит
export function createTestRunner(config: TestConfig): TestRunner {
  return new TestRunner(config);
}
