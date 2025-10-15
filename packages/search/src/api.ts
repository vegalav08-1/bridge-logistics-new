import { z } from 'zod';
import { MeiliSearch } from 'meilisearch';
import { aclManager, ACLContext } from './acl';
import { Document, getDocumentType } from './schemas';

// Схема для запроса поиска
export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  documentTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])).optional(),
  filters: z.array(z.string()).optional(),
  sort: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  highlight: z.boolean().default(true),
  facets: z.array(z.string()).optional(),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// Схема для ответа поиска
export const SearchResponseSchema = z.object({
  hits: z.array(z.any()),
  totalHits: z.number(),
  limit: z.number(),
  offset: z.number(),
  processingTimeMs: z.number(),
  query: z.string(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// Схема для запроса подсказок
export const SuggestionsRequestSchema = z.object({
  query: z.string().min(1),
  documentTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])).optional(),
  filters: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).default(10),
});

export type SuggestionsRequest = z.infer<typeof SuggestionsRequestSchema>;

// Схема для ответа подсказок
export const SuggestionsResponseSchema = z.object({
  suggestions: z.array(z.object({
    text: z.string(),
    type: z.string(),
    documentType: z.string(),
    documentId: z.string(),
    score: z.number(),
  })),
  totalHits: z.number(),
  processingTimeMs: z.number(),
  query: z.string(),
});

export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>;

// Схема для запроса аналитики
export const AnalyticsRequestSchema = z.object({
  documentTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])).optional(),
  filters: z.array(z.string()).optional(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  limit: z.number().min(1).max(1000).default(100),
});

export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>;

// Схема для ответа аналитики
export const AnalyticsResponseSchema = z.object({
  data: z.array(z.record(z.any())),
  totalHits: z.number(),
  processingTimeMs: z.number(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
});

export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;

// Класс для работы с API поиска
export class SearchAPI {
  private meilisearch: MeiliSearch;
  private aclContext: ACLContext | null = null;

  constructor(meilisearch: MeiliSearch) {
    this.meilisearch = meilisearch;
  }

  // Установить ACL контекст
  setACLContext(context: ACLContext): void {
    this.aclContext = context;
  }

  // Очистить ACL контекст
  clearACLContext(): void {
    this.aclContext = null;
  }

  // Выполнить поиск
  async search(request: SearchRequest): Promise<SearchResponse> {
    // Валидируем запрос
    const validatedRequest = SearchRequestSchema.parse(request);

    // Применяем ACL фильтры
    const aclFilters = this.aclContext ? aclManager.createSearchFilter(this.aclContext) : [];
    const allFilters = [...(validatedRequest.filters || []), ...aclFilters];

    // Определяем индексы для поиска
    const indices = this.getIndicesForTypes(validatedRequest.documentTypes);

    if (indices.length === 0) {
      return {
        hits: [],
        totalHits: 0,
        limit: validatedRequest.limit,
        offset: validatedRequest.offset,
        processingTimeMs: 0,
        query: validatedRequest.query,
      };
    }

    // Выполняем поиск по всем индексам
    const searchPromises = indices.map(indexName => 
      this.searchInIndex(indexName, validatedRequest, allFilters)
    );

    const results = await Promise.all(searchPromises);

    // Объединяем результаты
    const combinedHits = results.flatMap(result => result.hits);
    const totalHits = results.reduce((sum, result) => sum + result.totalHits, 0);
    const processingTimeMs = Math.max(...results.map(result => result.processingTimeMs));

    // Сортируем результаты
    if (validatedRequest.sort && validatedRequest.sort.length > 0) {
      combinedHits.sort((a, b) => {
        for (const sortField of validatedRequest.sort!) {
          const [field, direction] = sortField.split(':');
          const aValue = this.getFieldValue(a, field);
          const bValue = this.getFieldValue(b, field);
          
          if (aValue < bValue) return direction === 'desc' ? 1 : -1;
          if (aValue > bValue) return direction === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    // Применяем пагинацию
    const paginatedHits = combinedHits.slice(
      validatedRequest.offset,
      validatedRequest.offset + validatedRequest.limit
    );

    return {
      hits: paginatedHits,
      totalHits,
      limit: validatedRequest.limit,
      offset: validatedRequest.offset,
      processingTimeMs,
      query: validatedRequest.query,
    };
  }

  // Поиск в конкретном индексе
  private async searchInIndex(
    indexName: string,
    request: SearchRequest,
    filters: string[]
  ): Promise<SearchResponse> {
    try {
      const index = this.meilisearch.index(indexName);
      
      const searchParams: any = {
        q: request.query,
        limit: request.limit,
        offset: request.offset,
        highlight: request.highlight,
      };

      if (filters.length > 0) {
        searchParams.filter = filters;
      }

      if (request.sort && request.sort.length > 0) {
        searchParams.sort = request.sort;
      }

      if (request.facets && request.facets.length > 0) {
        searchParams.facets = request.facets;
      }

      const result = await index.search(searchParams);

      return {
        hits: result.hits as Document[],
        totalHits: result.totalHits,
        limit: request.limit,
        offset: request.offset,
        processingTimeMs: result.processingTimeMs,
        query: request.query,
      };
    } catch (error) {
      console.error(`Error searching in index ${indexName}:`, error);
      return {
        hits: [],
        totalHits: 0,
        limit: request.limit,
        offset: request.offset,
        processingTimeMs: 0,
        query: request.query,
      };
    }
  }

  // Получить подсказки
  async getSuggestions(request: SuggestionsRequest): Promise<SuggestionsResponse> {
    // Валидируем запрос
    const validatedRequest = SuggestionsRequestSchema.parse(request);

    // Применяем ACL фильтры
    const aclFilters = this.aclContext ? aclManager.createSearchFilter(this.aclContext) : [];
    const allFilters = [...(validatedRequest.filters || []), ...aclFilters];

    // Определяем индексы для поиска
    const indices = this.getIndicesForTypes(validatedRequest.documentTypes);

    if (indices.length === 0) {
      return {
        suggestions: [],
        totalHits: 0,
        processingTimeMs: 0,
        query: validatedRequest.query,
      };
    }

    // Выполняем поиск для подсказок
    const searchPromises = indices.map(indexName => 
      this.getSuggestionsFromIndex(indexName, validatedRequest, allFilters)
    );

    const results = await Promise.all(searchPromises);

    // Объединяем результаты
    const combinedSuggestions = results.flatMap(result => result.suggestions);
    const totalHits = results.reduce((sum, result) => sum + result.totalHits, 0);
    const processingTimeMs = Math.max(...results.map(result => result.processingTimeMs));

    // Сортируем по релевантности
    combinedSuggestions.sort((a, b) => b.score - a.score);

    // Применяем лимит
    const limitedSuggestions = combinedSuggestions.slice(0, validatedRequest.limit);

    return {
      suggestions: limitedSuggestions,
      totalHits,
      processingTimeMs,
      query: validatedRequest.query,
    };
  }

  // Получить подсказки из конкретного индекса
  private async getSuggestionsFromIndex(
    indexName: string,
    request: SuggestionsRequest,
    filters: string[]
  ): Promise<SuggestionsResponse> {
    try {
      const index = this.meilisearch.index(indexName);
      
      const searchParams: any = {
        q: request.query,
        limit: request.limit,
        highlight: true,
      };

      if (filters.length > 0) {
        searchParams.filter = filters;
      }

      const result = await index.search(searchParams);

      // Преобразуем результаты в подсказки
      const suggestions = result.hits.map((hit: any) => ({
        text: this.extractSuggestionText(hit),
        type: hit.type,
        documentType: getDocumentType(hit) || 'unknown',
        documentId: hit.id,
        score: hit._score || 0,
      }));

      return {
        suggestions,
        totalHits: result.totalHits,
        processingTimeMs: result.processingTimeMs,
        query: request.query,
      };
    } catch (error) {
      console.error(`Error getting suggestions from index ${indexName}:`, error);
      return {
        suggestions: [],
        totalHits: 0,
        processingTimeMs: 0,
        query: request.query,
      };
    }
  }

  // Получить аналитику
  async getAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    // Валидируем запрос
    const validatedRequest = AnalyticsRequestSchema.parse(request);

    // Применяем ACL фильтры
    const aclFilters = this.aclContext ? aclManager.createSearchFilter(this.aclContext) : [];
    const allFilters = [...(validatedRequest.filters || []), ...aclFilters];

    // Определяем индексы для аналитики
    const indices = this.getIndicesForTypes(validatedRequest.documentTypes);

    if (indices.length === 0) {
      return {
        data: [],
        totalHits: 0,
        processingTimeMs: 0,
        groupBy: validatedRequest.groupBy,
        metrics: validatedRequest.metrics,
      };
    }

    // Выполняем аналитику по всем индексам
    const analyticsPromises = indices.map(indexName => 
      this.getAnalyticsFromIndex(indexName, validatedRequest, allFilters)
    );

    const results = await Promise.all(analyticsPromises);

    // Объединяем результаты
    const combinedData = results.flatMap(result => result.data);
    const totalHits = results.reduce((sum, result) => sum + result.totalHits, 0);
    const processingTimeMs = Math.max(...results.map(result => result.processingTimeMs));

    return {
      data: combinedData,
      totalHits,
      processingTimeMs,
      groupBy: validatedRequest.groupBy,
      metrics: validatedRequest.metrics,
    };
  }

  // Получить аналитику из конкретного индекса
  private async getAnalyticsFromIndex(
    indexName: string,
    request: AnalyticsRequest,
    filters: string[]
  ): Promise<AnalyticsResponse> {
    try {
      const index = this.meilisearch.index(indexName);
      
      const searchParams: any = {
        q: '*',
        limit: request.limit,
      };

      if (filters.length > 0) {
        searchParams.filter = filters;
      }

      if (request.groupBy && request.groupBy.length > 0) {
        searchParams.facets = request.groupBy;
      }

      if (request.dateRange) {
        const dateFilter = `updatedAt >= ${request.dateRange.from} AND updatedAt <= ${request.dateRange.to}`;
        searchParams.filter = [...(searchParams.filter || []), dateFilter];
      }

      const result = await index.search(searchParams);

      // Преобразуем результаты в аналитические данные
      const data = result.hits.map((hit: any) => {
        const analyticsData: any = {
          id: hit.id,
          type: hit.type,
          documentType: getDocumentType(hit) || 'unknown',
        };

        // Добавляем метрики
        if (request.metrics) {
          request.metrics.forEach(metric => {
            analyticsData[metric] = this.getFieldValue(hit, metric);
          });
        }

        // Добавляем группировки
        if (request.groupBy) {
          request.groupBy.forEach(groupField => {
            analyticsData[groupField] = this.getFieldValue(hit, groupField);
          });
        }

        return analyticsData;
      });

      return {
        data,
        totalHits: result.totalHits,
        processingTimeMs: result.processingTimeMs,
        groupBy: request.groupBy,
        metrics: request.metrics,
      };
    } catch (error) {
      console.error(`Error getting analytics from index ${indexName}:`, error);
      return {
        data: [],
        totalHits: 0,
        processingTimeMs: 0,
        groupBy: request.groupBy,
        metrics: request.metrics,
      };
    }
  }

  // Получить индексы для типов документов
  private getIndicesForTypes(documentTypes?: string[]): string[] {
    if (!documentTypes || documentTypes.length === 0) {
      return ['yp-chats', 'yp-messages', 'yp-attachments', 'yp-finance', 'yp-invoices'];
    }

    return documentTypes.map(type => `yp-${type}s`);
  }

  // Извлечь текст для подсказки
  private extractSuggestionText(hit: any): string {
    // Приоритет полей для подсказок
    const priorityFields = ['text', 'title', 'fileName', 'number', 'preview'];
    
    for (const field of priorityFields) {
      if (hit[field] && typeof hit[field] === 'string') {
        return hit[field];
      }
    }

    // Если ничего не найдено, возвращаем ID
    return hit.id || 'Unknown';
  }

  // Получить значение поля
  private getFieldValue(obj: any, field: string): any {
    const fields = field.split('.');
    let value = obj;
    
    for (const f of fields) {
      if (value && typeof value === 'object') {
        value = value[f];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
}

// Экспорт утилит
export function createSearchAPI(meilisearch: MeiliSearch): SearchAPI {
  return new SearchAPI(meilisearch);
}
