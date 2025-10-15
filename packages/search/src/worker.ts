import { Worker, Queue, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { MeiliSearch } from 'meilisearch';
import { z } from 'zod';
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
import { aclManager, ACLContext } from './acl';

// Схема для задачи индексации
export const IndexJobSchema = z.object({
  type: z.enum(['index', 'delete', 'update']),
  documentType: z.enum(['chat', 'message', 'attachment', 'finance', 'invoice']),
  documentId: z.string(),
  document: z.any().optional(),
  context: z.any().optional(),
});

export type IndexJob = z.infer<typeof IndexJobSchema>;

// Схема для задачи массовой индексации
export const BulkIndexJobSchema = z.object({
  type: z.enum(['bulk-index', 'bulk-delete', 'bulk-update']),
  documentType: z.enum(['chat', 'message', 'attachment', 'finance', 'invoice']),
  documents: z.array(z.object({
    id: z.string(),
    document: z.any().optional(),
    context: z.any().optional(),
  })),
});

export type BulkIndexJob = z.infer<typeof BulkIndexJobSchema>;

// Схема для задачи переиндексации
export const ReindexJobSchema = z.object({
  type: z.enum(['reindex']),
  documentType: z.enum(['chat', 'message', 'attachment', 'finance', 'invoice']),
  filters: z.any().optional(),
  batchSize: z.number().default(100),
  offset: z.number().default(0),
});

export type ReindexJob = z.infer<typeof ReindexJobSchema>;

// Схема для задачи очистки
export const CleanupJobSchema = z.object({
  type: z.enum(['cleanup']),
  documentType: z.enum(['chat', 'message', 'attachment', 'finance', 'invoice']),
  olderThan: z.string().optional(), // ISO date
  batchSize: z.number().default(100),
});

export type CleanupJob = z.infer<typeof CleanupJobSchema>;

// Объединённая схема для всех типов задач
export const JobSchema = z.discriminatedUnion('type', [
  IndexJobSchema,
  BulkIndexJobSchema,
  ReindexJobSchema,
  CleanupJobSchema,
]);

export type JobData = z.infer<typeof JobSchema>;

// Конфигурация воркера
export interface WorkerConfig {
  redis: Redis;
  meilisearch: MeiliSearch;
  concurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
  batchSize?: number;
}

// Класс воркера индексации
export class IndexWorker {
  private worker: Worker;
  private queue: Queue;
  private meilisearch: MeiliSearch;
  private config: WorkerConfig;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.meilisearch = config.meilisearch;
    
    // Создаём очередь
    this.queue = new Queue('index-queue', {
      connection: config.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: config.retryAttempts || 3,
        backoff: {
          type: 'exponential',
          delay: config.retryDelay || 2000,
        },
      },
    });

    // Создаём воркер
    this.worker = new Worker(
      'index-queue',
      this.processJob.bind(this),
      {
        connection: config.redis,
        concurrency: config.concurrency || 5,
      }
    );

    // Обработчики событий
    this.setupEventHandlers();
  }

  // Настройка обработчиков событий
  private setupEventHandlers(): void {
    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Worker error:', err);
    });

    this.queue.on('error', (err) => {
      console.error('Queue error:', err);
    });
  }

  // Обработка задачи
  private async processJob(job: Job<JobData>): Promise<void> {
    const { type, documentType } = job.data;

    try {
      switch (type) {
        case 'index':
          await this.processIndexJob(job.data as IndexJob);
          break;
        case 'delete':
          await this.processDeleteJob(job.data as IndexJob);
          break;
        case 'update':
          await this.processUpdateJob(job.data as IndexJob);
          break;
        case 'bulk-index':
          await this.processBulkIndexJob(job.data as BulkIndexJob);
          break;
        case 'bulk-delete':
          await this.processBulkDeleteJob(job.data as BulkIndexJob);
          break;
        case 'bulk-update':
          await this.processBulkUpdateJob(job.data as BulkIndexJob);
          break;
        case 'reindex':
          await this.processReindexJob(job.data as ReindexJob);
          break;
        case 'cleanup':
          await this.processCleanupJob(job.data as CleanupJob);
          break;
        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  // Обработка задачи индексации
  private async processIndexJob(job: IndexJob): Promise<void> {
    const { documentType, documentId, document, context } = job;

    if (!document) {
      throw new Error('Document is required for index job');
    }

    // Валидируем документ
    const validatedDocument = validateDocument(document);
    if (!validatedDocument) {
      throw new Error('Invalid document format');
    }

    // Применяем ACL фильтры
    const aclContext = context ? aclManager.createContext(context) : null;
    if (aclContext) {
      const aclResult = aclManager.checkAccess(aclContext, validatedDocument);
      if (!aclResult.allowed) {
        throw new Error(`Access denied: ${aclResult.reason}`);
      }
    }

    // Индексируем документ
    const indexName = this.getIndexName(documentType);
    await this.meilisearch.index(indexName).addDocuments([validatedDocument]);

    console.log(`Indexed document ${documentId} in ${indexName}`);
  }

  // Обработка задачи удаления
  private async processDeleteJob(job: IndexJob): Promise<void> {
    const { documentType, documentId } = job;

    const indexName = this.getIndexName(documentType);
    await this.meilisearch.index(indexName).deleteDocument(documentId);

    console.log(`Deleted document ${documentId} from ${indexName}`);
  }

  // Обработка задачи обновления
  private async processUpdateJob(job: IndexJob): Promise<void> {
    const { documentType, documentId, document, context } = job;

    if (!document) {
      throw new Error('Document is required for update job');
    }

    // Валидируем документ
    const validatedDocument = validateDocument(document);
    if (!validatedDocument) {
      throw new Error('Invalid document format');
    }

    // Применяем ACL фильтры
    const aclContext = context ? aclManager.createContext(context) : null;
    if (aclContext) {
      const aclResult = aclManager.checkAccess(aclContext, validatedDocument);
      if (!aclResult.allowed) {
        throw new Error(`Access denied: ${aclResult.reason}`);
      }
    }

    // Обновляем документ
    const indexName = this.getIndexName(documentType);
    await this.meilisearch.index(indexName).updateDocuments([validatedDocument]);

    console.log(`Updated document ${documentId} in ${indexName}`);
  }

  // Обработка задачи массовой индексации
  private async processBulkIndexJob(job: BulkIndexJob): Promise<void> {
    const { documentType, documents } = job;

    if (documents.length === 0) {
      return;
    }

    // Валидируем документы
    const validatedDocuments = documents
      .map(doc => {
        if (!doc.document) return null;
        const validated = validateDocument(doc.document);
        return validated ? { ...validated, id: doc.id } : null;
      })
      .filter(Boolean) as Document[];

    if (validatedDocuments.length === 0) {
      throw new Error('No valid documents to index');
    }

    // Индексируем документы
    const indexName = this.getIndexName(documentType);
    await this.meilisearch.index(indexName).addDocuments(validatedDocuments);

    console.log(`Bulk indexed ${validatedDocuments.length} documents in ${indexName}`);
  }

  // Обработка задачи массового удаления
  private async processBulkDeleteJob(job: BulkIndexJob): Promise<void> {
    const { documentType, documents } = job;

    if (documents.length === 0) {
      return;
    }

    const documentIds = documents.map(doc => doc.id);
    const indexName = this.getIndexName(documentType);
    await this.meilisearch.index(indexName).deleteDocuments(documentIds);

    console.log(`Bulk deleted ${documentIds.length} documents from ${indexName}`);
  }

  // Обработка задачи массового обновления
  private async processBulkUpdateJob(job: BulkIndexJob): Promise<void> {
    const { documentType, documents } = job;

    if (documents.length === 0) {
      return;
    }

    // Валидируем документы
    const validatedDocuments = documents
      .map(doc => {
        if (!doc.document) return null;
        const validated = validateDocument(doc.document);
        return validated ? { ...validated, id: doc.id } : null;
      })
      .filter(Boolean) as Document[];

    if (validatedDocuments.length === 0) {
      throw new Error('No valid documents to update');
    }

    // Обновляем документы
    const indexName = this.getIndexName(documentType);
    await this.meilisearch.index(indexName).updateDocuments(validatedDocuments);

    console.log(`Bulk updated ${validatedDocuments.length} documents in ${indexName}`);
  }

  // Обработка задачи переиндексации
  private async processReindexJob(job: ReindexJob): Promise<void> {
    const { documentType, filters, batchSize, offset } = job;

    // Здесь должна быть логика получения документов из базы данных
    // и их переиндексации
    console.log(`Reindexing ${documentType} with filters:`, filters);
    
    // TODO: Реализовать получение документов из БД и их переиндексацию
    throw new Error('Reindex job not implemented yet');
  }

  // Обработка задачи очистки
  private async processCleanupJob(job: CleanupJob): Promise<void> {
    const { documentType, olderThan, batchSize } = job;

    // Здесь должна быть логика очистки старых документов
    console.log(`Cleaning up ${documentType} older than:`, olderThan);
    
    // TODO: Реализовать очистку старых документов
    throw new Error('Cleanup job not implemented yet');
  }

  // Получить имя индекса
  private getIndexName(documentType: string): string {
    return `yp-${documentType}s`;
  }

  // Добавить задачу индексации
  async addIndexJob(documentType: string, documentId: string, document: any, context?: any): Promise<void> {
    await this.queue.add('index', {
      type: 'index',
      documentType: documentType as any,
      documentId,
      document,
      context,
    });
  }

  // Добавить задачу удаления
  async addDeleteJob(documentType: string, documentId: string): Promise<void> {
    await this.queue.add('delete', {
      type: 'delete',
      documentType: documentType as any,
      documentId,
    });
  }

  // Добавить задачу обновления
  async addUpdateJob(documentType: string, documentId: string, document: any, context?: any): Promise<void> {
    await this.queue.add('update', {
      type: 'update',
      documentType: documentType as any,
      documentId,
      document,
      context,
    });
  }

  // Добавить задачу массовой индексации
  async addBulkIndexJob(documentType: string, documents: Array<{ id: string; document: any; context?: any }>): Promise<void> {
    await this.queue.add('bulk-index', {
      type: 'bulk-index',
      documentType: documentType as any,
      documents,
    });
  }

  // Добавить задачу массового удаления
  async addBulkDeleteJob(documentType: string, documentIds: string[]): Promise<void> {
    const documents = documentIds.map(id => ({ id }));
    await this.queue.add('bulk-delete', {
      type: 'bulk-delete',
      documentType: documentType as any,
      documents,
    });
  }

  // Добавить задачу массового обновления
  async addBulkUpdateJob(documentType: string, documents: Array<{ id: string; document: any; context?: any }>): Promise<void> {
    await this.queue.add('bulk-update', {
      type: 'bulk-update',
      documentType: documentType as any,
      documents,
    });
  }

  // Добавить задачу переиндексации
  async addReindexJob(documentType: string, filters?: any, batchSize?: number, offset?: number): Promise<void> {
    await this.queue.add('reindex', {
      type: 'reindex',
      documentType: documentType as any,
      filters,
      batchSize,
      offset,
    });
  }

  // Добавить задачу очистки
  async addCleanupJob(documentType: string, olderThan?: string, batchSize?: number): Promise<void> {
    await this.queue.add('cleanup', {
      type: 'cleanup',
      documentType: documentType as any,
      olderThan,
      batchSize,
    });
  }

  // Получить статистику очереди
  async getQueueStats(): Promise<any> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  // Очистить очередь
  async clearQueue(): Promise<void> {
    await this.queue.obliterate();
  }

  // Остановить воркер
  async stop(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }
}

// Экспорт утилит
export function createIndexWorker(config: WorkerConfig): IndexWorker {
  return new IndexWorker(config);
}
