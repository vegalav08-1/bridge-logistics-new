import { z } from 'zod';
import { MeiliSearch } from 'meilisearch';
import { SearchAPI, SearchRequest, SearchResponse } from './api';
import { AnalyticsAPI, AnalyticsQuery, AnalyticsResult } from './analytics';
import { IndexWorker, JobData } from './worker';

// Схема для метрики
export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  timestamp: z.string(),
  tags: z.record(z.string()).optional(),
  unit: z.string().optional(),
});

export type Metric = z.infer<typeof MetricSchema>;

// Схема для события
export const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string(),
  timestamp: z.string(),
  data: z.record(z.any()).optional(),
  tags: z.record(z.string()).optional(),
});

export type Event = z.infer<typeof EventSchema>;

// Схема для трассировки
export const TraceSchema = z.object({
  id: z.string(),
  operation: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  status: z.enum(['success', 'error', 'timeout']),
  tags: z.record(z.string()).optional(),
  spans: z.array(z.any()).optional(),
});

export type Trace = z.infer<typeof TraceSchema>;

// Схема для конфигурации наблюдаемости
export const ObservabilityConfigSchema = z.object({
  enableMetrics: z.boolean().default(true),
  enableLogging: z.boolean().default(true),
  enableTracing: z.boolean().default(true),
  metricsInterval: z.number().default(60000), // 1 минута
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  traceSamplingRate: z.number().min(0).max(1).default(0.1),
  customTags: z.record(z.string()).optional(),
});

export type ObservabilityConfig = z.infer<typeof ObservabilityConfigSchema>;

// Интерфейс для отправки метрик
export interface MetricsCollector {
  recordMetric(metric: Metric): void;
  recordCounter(name: string, value: number, tags?: Record<string, string>): void;
  recordGauge(name: string, value: number, tags?: Record<string, string>): void;
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  recordTimer(name: string, duration: number, tags?: Record<string, string>): void;
  getMetrics(): Metric[];
  clearMetrics(): void;
}

// Интерфейс для логирования
export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
  getEvents(): Event[];
  clearEvents(): void;
}

// Интерфейс для трассировки
export interface Tracer {
  startTrace(operation: string, tags?: Record<string, string>): Trace;
  endTrace(traceId: string, status: 'success' | 'error' | 'timeout'): void;
  addSpan(traceId: string, span: any): void;
  getTraces(): Trace[];
  clearTraces(): void;
}

// Класс для сбора метрик
export class MetricsCollectorImpl implements MetricsCollector {
  private metrics: Metric[] = [];
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
  }

  recordMetric(metric: Metric): void {
    if (!this.config.enableMetrics) return;
    
    this.metrics.push(metric);
    
    // Ограничиваем количество метрик в памяти
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  recordCounter(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `counter.${name}`,
      value,
      timestamp: new Date().toISOString(),
      tags,
      unit: 'count',
    });
  }

  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `gauge.${name}`,
      value,
      timestamp: new Date().toISOString(),
      tags,
      unit: 'value',
    });
  }

  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `histogram.${name}`,
      value,
      timestamp: new Date().toISOString(),
      tags,
      unit: 'value',
    });
  }

  recordTimer(name: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `timer.${name}`,
      value: duration,
      timestamp: new Date().toISOString(),
      tags,
      unit: 'ms',
    });
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Класс для логирования
export class LoggerImpl implements Logger {
  private events: Event[] = [];
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
  }

  debug(message: string, data?: any): void {
    if (!this.config.enableLogging || this.config.logLevel === 'error') return;
    
    this.recordEvent({
      id: this.generateEventId(),
      type: 'log',
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  info(message: string, data?: any): void {
    if (!this.config.enableLogging || this.config.logLevel === 'error') return;
    
    this.recordEvent({
      id: this.generateEventId(),
      type: 'log',
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  warn(message: string, data?: any): void {
    if (!this.config.enableLogging || this.config.logLevel === 'error') return;
    
    this.recordEvent({
      id: this.generateEventId(),
      type: 'log',
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  error(message: string, error?: Error, data?: any): void {
    if (!this.config.enableLogging) return;
    
    this.recordEvent({
      id: this.generateEventId(),
      type: 'log',
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
    });
  }

  private recordEvent(event: Event): void {
    this.events.push(event);
    
    // Ограничиваем количество событий в памяти
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getEvents(): Event[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Класс для трассировки
export class TracerImpl implements Tracer {
  private traces: Map<string, Trace> = new Map();
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
  }

  startTrace(operation: string, tags?: Record<string, string>): Trace {
    if (!this.config.enableTracing) {
      return {
        id: 'disabled',
        operation,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        status: 'success',
        tags,
      };
    }

    const trace: Trace = {
      id: this.generateTraceId(),
      operation,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      status: 'success',
      tags,
    };

    this.traces.set(trace.id, trace);
    return trace;
  }

  endTrace(traceId: string, status: 'success' | 'error' | 'timeout'): void {
    if (!this.config.enableTracing || traceId === 'disabled') return;

    const trace = this.traces.get(traceId);
    if (!trace) return;

    trace.endTime = new Date().toISOString();
    trace.duration = new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime();
    trace.status = status;

    // Ограничиваем количество трассировок в памяти
    if (this.traces.size > 1000) {
      const oldestTrace = Array.from(this.traces.values())[0];
      this.traces.delete(oldestTrace.id);
    }
  }

  addSpan(traceId: string, span: any): void {
    if (!this.config.enableTracing || traceId === 'disabled') return;

    const trace = this.traces.get(traceId);
    if (!trace) return;

    if (!trace.spans) {
      trace.spans = [];
    }
    trace.spans.push(span);
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  clearTraces(): void {
    this.traces.clear();
  }
}

// Класс для наблюдаемости
export class ObservabilityManager {
  private config: ObservabilityConfig;
  private metricsCollector: MetricsCollector;
  private logger: Logger;
  private tracer: Tracer;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: ObservabilityConfig) {
    this.config = config;
    this.metricsCollector = new MetricsCollectorImpl(config);
    this.logger = new LoggerImpl(config);
    this.tracer = new TracerImpl(config);

    if (config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  // Запуск сбора метрик
  private startMetricsCollection(): void {
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.metricsInterval);
  }

  // Сбор системных метрик
  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.metricsCollector.recordGauge('memory.heap.used', memoryUsage.heapUsed, {
      unit: 'bytes',
    });
    this.metricsCollector.recordGauge('memory.heap.total', memoryUsage.heapTotal, {
      unit: 'bytes',
    });
    this.metricsCollector.recordGauge('memory.external', memoryUsage.external, {
      unit: 'bytes',
    });
    this.metricsCollector.recordGauge('memory.rss', memoryUsage.rss, {
      unit: 'bytes',
    });

    this.metricsCollector.recordGauge('cpu.user', cpuUsage.user, {
      unit: 'microseconds',
    });
    this.metricsCollector.recordGauge('cpu.system', cpuUsage.system, {
      unit: 'microseconds',
    });
  }

  // Метрики для поиска
  recordSearchMetrics(request: any, response: any, duration: number): void {
    this.metricsCollector.recordCounter('search.requests', 1, {
      documentTypes: request.documentTypes?.join(',') || 'all',
    });
    
    this.metricsCollector.recordTimer('search.duration', duration, {
      documentTypes: request.documentTypes?.join(',') || 'all',
    });
    
    this.metricsCollector.recordGauge('search.results.count', response.totalHits, {
      documentTypes: request.documentTypes?.join(',') || 'all',
    });
    
    this.metricsCollector.recordGauge('search.processing.time', response.processingTimeMs, {
      documentTypes: request.documentTypes?.join(',') || 'all',
    });
  }

  // Метрики для аналитики
  recordAnalyticsMetrics(query: any, result: any, duration: number): void {
    this.metricsCollector.recordCounter('analytics.requests', 1, {
      documentTypes: query.documentTypes?.join(',') || 'all',
    });
    
    this.metricsCollector.recordTimer('analytics.duration', duration, {
      documentTypes: query.documentTypes?.join(',') || 'all',
    });
    
    this.metricsCollector.recordGauge('analytics.results.count', result.totalHits, {
      documentTypes: query.documentTypes?.join(',') || 'all',
    });
  }

  // Метрики для воркера
  recordWorkerMetrics(job: any, duration: number, status: 'success' | 'error'): void {
    this.metricsCollector.recordCounter('worker.jobs', 1, {
      type: job.type,
      documentType: job.documentType,
      status,
    });
    
    this.metricsCollector.recordTimer('worker.job.duration', duration, {
      type: job.type,
      documentType: job.documentType,
      status,
    });
  }

  // Метрики для индексации
  recordIndexingMetrics(documentType: string, operation: string, count: number, duration: number): void {
    this.metricsCollector.recordCounter('indexing.operations', count, {
      documentType,
      operation,
    });
    
    this.metricsCollector.recordTimer('indexing.duration', duration, {
      documentType,
      operation,
    });
  }

  // Логирование поиска
  logSearch(request: any, response: any, duration: number): void {
    this.logger.info('Search request completed', {
      query: request.query,
      documentTypes: request.documentTypes,
      totalHits: response.totalHits,
      duration,
      processingTime: response.processingTimeMs,
    });
  }

  // Логирование ошибки поиска
  logSearchError(request: any, error: Error): void {
    this.logger.error('Search request failed', error, {
      query: request.query,
      documentTypes: request.documentTypes,
    });
  }

  // Логирование аналитики
  logAnalytics(query: any, result: any, duration: number): void {
    this.logger.info('Analytics request completed', {
      documentTypes: query.documentTypes,
      metrics: query.metrics.map((m: any) => m.name),
      totalHits: result.totalHits,
      duration,
    });
  }

  // Логирование ошибки аналитики
  logAnalyticsError(query: any, error: Error): void {
    this.logger.error('Analytics request failed', error, {
      documentTypes: query.documentTypes,
      metrics: query.metrics.map((m: any) => m.name),
    });
  }

  // Логирование воркера
  logWorker(job: any, duration: number, status: 'success' | 'error', error?: Error): void {
    if (status === 'success') {
      this.logger.info('Worker job completed', {
        type: job.type,
        documentType: job.documentType,
        duration,
      });
    } else {
      this.logger.error('Worker job failed', error, {
        type: job.type,
        documentType: job.documentType,
        duration,
      });
    }
  }

  // Трассировка поиска
  traceSearch(request: any): Trace {
    return this.tracer.startTrace('search', {
      query: request.query,
      documentTypes: request.documentTypes?.join(',') || 'all',
    });
  }

  // Трассировка аналитики
  traceAnalytics(query: any): Trace {
    return this.tracer.startTrace('analytics', {
      documentTypes: query.documentTypes?.join(',') || 'all',
      metrics: query.metrics.map((m: any) => m.name).join(','),
    });
  }

  // Трассировка воркера
  traceWorker(job: any): Trace {
    return this.tracer.startTrace('worker', {
      type: job.type,
      documentType: job.documentType,
    });
  }

  // Получить все метрики
  getMetrics(): Metric[] {
    return this.metricsCollector.getMetrics();
  }

  // Получить все события
  getEvents(): Event[] {
    return this.logger.getEvents();
  }

  // Получить все трассировки
  getTraces(): Trace[] {
    return this.tracer.getTraces();
  }

  // Очистить все данные
  clear(): void {
    this.metricsCollector.clearMetrics();
    this.logger.clearEvents();
    this.tracer.clearTraces();
  }

  // Остановить сбор метрик
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Получить статистику
  getStats(): any {
    const metrics = this.getMetrics();
    const events = this.getEvents();
    const traces = this.getTraces();

    return {
      metrics: {
        total: metrics.length,
        byType: this.groupBy(metrics, 'name'),
      },
      events: {
        total: events.length,
        byLevel: this.groupBy(events, 'level'),
      },
      traces: {
        total: traces.length,
        byStatus: this.groupBy(traces, 'status'),
      },
    };
  }

  private groupBy<T>(items: T[], key: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Экспорт утилит
export function createObservabilityManager(config: ObservabilityConfig): ObservabilityManager {
  return new ObservabilityManager(config);
}
