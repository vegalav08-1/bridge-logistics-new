import { z } from 'zod';
import { MeiliSearch } from 'meilisearch';
import { aclManager, ACLContext } from './acl';
import { Document, getDocumentType } from './schemas';

// Схема для метрики
export const MetricSchema = z.object({
  name: z.string(),
  type: z.enum(['count', 'sum', 'avg', 'min', 'max', 'distinct']),
  field: z.string().optional(),
  label: z.string().optional(),
  format: z.string().optional(), // для форматирования значений
});

export type Metric = z.infer<typeof MetricSchema>;

// Схема для группировки
export const GroupBySchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  type: z.enum(['string', 'number', 'date']).default('string'),
  interval: z.string().optional(), // для временных группировок (day, week, month, year)
});

export type GroupBy = z.infer<typeof GroupBySchema>;

// Схема для фильтра
export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'exists']),
  value: z.any(),
  label: z.string().optional(),
});

export type Filter = z.infer<typeof FilterSchema>;

// Схема для временного диапазона
export const DateRangeSchema = z.object({
  from: z.string(), // ISO date
  to: z.string(), // ISO date
  label: z.string().optional(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// Схема для запроса аналитики
export const AnalyticsQuerySchema = z.object({
  documentTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])).optional(),
  metrics: z.array(MetricSchema),
  groupBy: z.array(GroupBySchema).optional(),
  filters: z.array(FilterSchema).optional(),
  dateRange: DateRangeSchema.optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

// Схема для результата аналитики
export const AnalyticsResultSchema = z.object({
  data: z.array(z.record(z.any())),
  totalHits: z.number(),
  processingTimeMs: z.number(),
  metrics: z.array(MetricSchema),
  groupBy: z.array(GroupBySchema).optional(),
  summary: z.record(z.any()).optional(),
});

export type AnalyticsResult = z.infer<typeof AnalyticsResultSchema>;

// Схема для дашборда
export const DashboardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.enum(['chart', 'table', 'metric', 'list']),
    title: z.string(),
    query: AnalyticsQuerySchema,
    config: z.record(z.any()).optional(),
  })),
  layout: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Dashboard = z.infer<typeof DashboardSchema>;

// Схема для виджета
export const WidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['chart', 'table', 'metric', 'list']),
  title: z.string(),
  query: AnalyticsQuerySchema,
  config: z.record(z.any()).optional(),
  dashboardId: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
});

export type Widget = z.infer<typeof WidgetSchema>;

// Класс для работы с аналитикой
export class AnalyticsAPI {
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

  // Выполнить аналитический запрос
  async executeQuery(query: AnalyticsQuery): Promise<AnalyticsResult> {
    // Валидируем запрос
    const validatedQuery = AnalyticsQuerySchema.parse(query);

    // Применяем ACL фильтры
    const aclFilters = this.aclContext ? aclManager.createSearchFilter(this.aclContext) : [];
    const allFilters = this.buildFilters(validatedQuery.filters || [], aclFilters);

    // Определяем индексы для аналитики
    const indices = this.getIndicesForTypes(validatedQuery.documentTypes);

    if (indices.length === 0) {
      return {
        data: [],
        totalHits: 0,
        processingTimeMs: 0,
        metrics: validatedQuery.metrics,
        groupBy: validatedQuery.groupBy,
      };
    }

    // Выполняем аналитику по всем индексам
    const analyticsPromises = indices.map(indexName => 
      this.executeQueryOnIndex(indexName, validatedQuery, allFilters)
    );

    const results = await Promise.all(analyticsPromises);

    // Объединяем результаты
    const combinedData = results.flatMap(result => result.data);
    const totalHits = results.reduce((sum, result) => sum + result.totalHits, 0);
    const processingTimeMs = Math.max(...results.map(result => result.processingTimeMs));

    // Вычисляем метрики
    const computedMetrics = this.computeMetrics(combinedData, validatedQuery.metrics);

    // Группируем данные
    const groupedData = validatedQuery.groupBy 
      ? this.groupData(combinedData, validatedQuery.groupBy, computedMetrics)
      : combinedData;

    // Создаём сводку
    const summary = this.createSummary(computedMetrics);

    return {
      data: groupedData,
      totalHits,
      processingTimeMs,
      metrics: validatedQuery.metrics,
      groupBy: validatedQuery.groupBy,
      summary,
    };
  }

  // Выполнить запрос на конкретном индексе
  private async executeQueryOnIndex(
    indexName: string,
    query: AnalyticsQuery,
    filters: string[]
  ): Promise<AnalyticsResult> {
    try {
      const index = this.meilisearch.index(indexName);
      
      const searchParams: any = {
        q: '*',
        limit: query.limit,
        offset: query.offset,
      };

      if (filters.length > 0) {
        searchParams.filter = filters;
      }

      if (query.groupBy && query.groupBy.length > 0) {
        searchParams.facets = query.groupBy.map(gb => gb.field);
      }

      if (query.dateRange) {
        const dateFilter = `updatedAt >= ${query.dateRange.from} AND updatedAt <= ${query.dateRange.to}`;
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

        // Добавляем поля для группировки
        if (query.groupBy) {
          query.groupBy.forEach(groupBy => {
            analyticsData[groupBy.field] = this.getFieldValue(hit, groupBy.field);
          });
        }

        // Добавляем поля для метрик
        query.metrics.forEach(metric => {
          if (metric.field) {
            analyticsData[metric.field] = this.getFieldValue(hit, metric.field);
          }
        });

        return analyticsData;
      });

      return {
        data,
        totalHits: result.totalHits,
        processingTimeMs: result.processingTimeMs,
        metrics: query.metrics,
        groupBy: query.groupBy,
      };
    } catch (error) {
      console.error(`Error executing analytics query on index ${indexName}:`, error);
      return {
        data: [],
        totalHits: 0,
        processingTimeMs: 0,
        metrics: query.metrics,
        groupBy: query.groupBy,
      };
    }
  }

  // Построить фильтры
  private buildFilters(queryFilters: Filter[], aclFilters: string[]): string[] {
    const filters: string[] = [...aclFilters];

    queryFilters.forEach(filter => {
      let filterString = '';
      
      switch (filter.operator) {
        case 'eq':
          filterString = `${filter.field} = ${filter.value}`;
          break;
        case 'ne':
          filterString = `${filter.field} != ${filter.value}`;
          break;
        case 'gt':
          filterString = `${filter.field} > ${filter.value}`;
          break;
        case 'gte':
          filterString = `${filter.field} >= ${filter.value}`;
          break;
        case 'lt':
          filterString = `${filter.field} < ${filter.value}`;
          break;
        case 'lte':
          filterString = `${filter.field} <= ${filter.value}`;
          break;
        case 'in':
          if (Array.isArray(filter.value)) {
            const values = filter.value.map(v => `"${v}"`).join(', ');
            filterString = `${filter.field} IN [${values}]`;
          }
          break;
        case 'nin':
          if (Array.isArray(filter.value)) {
            const values = filter.value.map(v => `"${v}"`).join(', ');
            filterString = `${filter.field} NOT IN [${values}]`;
          }
          break;
        case 'contains':
          filterString = `${filter.field} CONTAINS "${filter.value}"`;
          break;
        case 'exists':
          filterString = `${filter.field} EXISTS`;
          break;
      }

      if (filterString) {
        filters.push(filterString);
      }
    });

    return filters;
  }

  // Вычислить метрики
  private computeMetrics(data: any[], metrics: Metric[]): Record<string, any> {
    const computedMetrics: Record<string, any> = {};

    metrics.forEach(metric => {
      const values = data.map(item => this.getFieldValue(item, metric.field || metric.name));
      const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));

      switch (metric.type) {
        case 'count':
          computedMetrics[metric.name] = data.length;
          break;
        case 'sum':
          computedMetrics[metric.name] = numericValues.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          computedMetrics[metric.name] = numericValues.length > 0 
            ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length 
            : 0;
          break;
        case 'min':
          computedMetrics[metric.name] = numericValues.length > 0 ? Math.min(...numericValues) : 0;
          break;
        case 'max':
          computedMetrics[metric.name] = numericValues.length > 0 ? Math.max(...numericValues) : 0;
          break;
        case 'distinct':
          computedMetrics[metric.name] = new Set(values).size;
          break;
      }
    });

    return computedMetrics;
  }

  // Группировать данные
  private groupData(data: any[], groupBy: GroupBy[], metrics: Record<string, any>): any[] {
    const groups: Record<string, any[]> = {};

    // Группируем данные
    data.forEach(item => {
      const groupKey = groupBy.map(gb => this.getFieldValue(item, gb.field)).join('|');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Вычисляем метрики для каждой группы
    return Object.entries(groups).map(([groupKey, groupData]) => {
      const groupValues = groupKey.split('|');
      const groupResult: any = {};

      // Добавляем значения группировки
      groupBy.forEach((gb, index) => {
        groupResult[gb.field] = groupValues[index];
      });

      // Вычисляем метрики для группы
      Object.entries(metrics).forEach(([metricName, metricValue]) => {
        groupResult[metricName] = metricValue;
      });

      // Добавляем количество элементов в группе
      groupResult._count = groupData.length;

      return groupResult;
    });
  }

  // Создать сводку
  private createSummary(metrics: Record<string, any>): Record<string, any> {
    const summary: Record<string, any> = {};

    Object.entries(metrics).forEach(([name, value]) => {
      summary[name] = {
        value,
        formatted: this.formatValue(value, name),
      };
    });

    return summary;
  }

  // Форматировать значение
  private formatValue(value: any, field: string): string {
    if (typeof value === 'number') {
      if (field.includes('amount') || field.includes('price')) {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        }).format(value);
      }
      
      if (field.includes('date') || field.includes('time')) {
        return new Date(value).toLocaleDateString('ru-RU');
      }
      
      return new Intl.NumberFormat('ru-RU').format(value);
    }

    return String(value);
  }

  // Получить индексы для типов документов
  private getIndicesForTypes(documentTypes?: string[]): string[] {
    if (!documentTypes || documentTypes.length === 0) {
      return ['yp-chats', 'yp-messages', 'yp-attachments', 'yp-finance', 'yp-invoices'];
    }

    return documentTypes.map(type => `yp-${type}s`);
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

  // Получить предустановленные дашборды
  getPresetDashboards(): Dashboard[] {
    return [
      {
        id: 'overview',
        name: 'Обзор',
        description: 'Общая статистика по всем типам документов',
        widgets: [
          {
            id: 'total-documents',
            type: 'metric',
            title: 'Всего документов',
            query: {
              metrics: [{ name: 'total', type: 'count' }],
              documentTypes: ['chat', 'message', 'attachment', 'finance', 'invoice'],
            },
          },
          {
            id: 'recent-activity',
            type: 'list',
            title: 'Последняя активность',
            query: {
              metrics: [{ name: 'count', type: 'count' }],
              documentTypes: ['chat', 'message'],
              limit: 10,
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'chats',
        name: 'Чаты',
        description: 'Статистика по чатам',
        widgets: [
          {
            id: 'chat-status',
            type: 'chart',
            title: 'Статусы чатов',
            query: {
              metrics: [{ name: 'count', type: 'count' }],
              groupBy: [{ field: 'status', label: 'Статус' }],
              documentTypes: ['chat'],
            },
          },
          {
            id: 'chat-timeline',
            type: 'chart',
            title: 'Создание чатов по времени',
            query: {
              metrics: [{ name: 'count', type: 'count' }],
              groupBy: [{ field: 'createdAt', label: 'Дата', type: 'date', interval: 'day' }],
              documentTypes: ['chat'],
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'finance',
        name: 'Финансы',
        description: 'Финансовая аналитика',
        widgets: [
          {
            id: 'total-amount',
            type: 'metric',
            title: 'Общая сумма',
            query: {
              metrics: [{ name: 'total', type: 'sum', field: 'amount' }],
              documentTypes: ['finance'],
            },
          },
          {
            id: 'operations-by-type',
            type: 'chart',
            title: 'Операции по типам',
            query: {
              metrics: [{ name: 'count', type: 'count' }],
              groupBy: [{ field: 'opKind', label: 'Тип операции' }],
              documentTypes: ['finance'],
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

// Экспорт утилит
export function createAnalyticsAPI(meilisearch: MeiliSearch): AnalyticsAPI {
  return new AnalyticsAPI(meilisearch);
}
