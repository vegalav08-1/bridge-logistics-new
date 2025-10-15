// Экспорт основных классов и функций
export { SearchAPI, createSearchAPI } from './api';
export { AnalyticsAPI, createAnalyticsAPI } from './analytics';
export { IndexWorker, createIndexWorker } from './worker';
export { aclManager, createACLContext, checkACLAccess, createACLFilter } from './acl';
export { ObservabilityManager, createObservabilityManager } from './observability';

// Экспорт UI компонентов
export {
  Search as SearchComponent,
  SearchResults,
  SearchResult,
  Suggestions,
  Filters,
  Analytics,
} from './ui';

export {
  Dashboard as DashboardComponent,
  Widget as WidgetComponent,
  MetricWidget,
  ChartWidget,
  TableWidget,
  ListWidget,
} from './dashboard';

// Экспорт схем и типов
export {
  validateDocument,
  getDocumentType,
  isChatDocument,
  isMessageDocument,
  isAttachmentDocument,
  isFinanceDocument,
  isInvoiceDocument,
  createChatDocument,
  createMessageDocument,
  createAttachmentDocument,
  createFinanceDocument,
  createInvoiceDocument,
} from './schemas';

export type {
  Document,
  ChatDocument,
  MessageDocument,
  AttachmentDocument,
  FinanceDocument,
  InvoiceDocument,
} from './schemas';

export type {
  User,
  UserRole,
  ACLContext,
  ACLResult,
  ACLPolicy,
  ACLRule,
  ACLFilter,
} from './acl';

export type {
  SearchRequest,
  SearchResponse,
  SuggestionsRequest,
  SuggestionsResponse,
  AnalyticsRequest,
  AnalyticsResponse,
} from './api';

export type {
  Metric,
  GroupBy,
  Filter,
  DateRange,
  AnalyticsQuery,
  AnalyticsResult,
  Dashboard,
  Widget,
} from './analytics';

export type {
  IndexJob,
  BulkIndexJob,
  ReindexJob,
  CleanupJob,
  JobData,
  WorkerConfig,
} from './worker';

export type {
  ObservabilityConfig,
  Event,
  Trace,
  MetricsCollector,
  Logger,
  Tracer,
} from './observability';

// Экспорт тестов
export {
  TestRunner,
  createTestRunner,
  SearchTestSuite,
  AnalyticsTestSuite,
  WorkerTestSuite,
  ACLTestSuite,
  ObservabilityTestSuite,
} from './tests';

// Экспорт типов для тестов
export type {
  TestConfig,
  TestData,
} from './tests';

// Экспорт UI типов
export type {
  SearchProps,
  SearchResultsProps,
  SuggestionsProps,
  FiltersProps,
  AnalyticsProps,
} from './ui';

export type {
  DashboardProps,
  WidgetProps,
  MetricWidgetProps,
  ChartWidgetProps,
  TableWidgetProps,
  ListWidgetProps,
} from './dashboard';
