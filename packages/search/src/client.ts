import { MeiliSearch } from 'meilisearch';
import { FLAGS } from '@yp/shared/constants';

export interface SearchConfig {
  host: string;
  apiKey: string;
}

export class SearchClient {
  private client: MeiliSearch;
  private config: SearchConfig;

  constructor(config?: Partial<SearchConfig>) {
    this.config = {
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_KEY || 'masterKey',
      ...config,
    };

    this.client = new MeiliSearch({
      host: this.config.host,
      apiKey: this.config.apiKey,
    });
  }

  // Проверка доступности поиска
  isEnabled(): boolean {
    return FLAGS.SEARCH_ENABLED;
  }

  // Получить клиент Meilisearch
  getClient(): MeiliSearch {
    return this.client;
  }

  // Проверка здоровья индекса
  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.status === 'available';
    } catch (error) {
      console.error('Search health check failed:', error);
      return false;
    }
  }

  // Получить статистику индекса
  async getStats(): Promise<any> {
    try {
      const stats = await this.client.getStats();
      return stats;
    } catch (error) {
      console.error('Failed to get search stats:', error);
      return null;
    }
  }

  // Создать индекс
  async createIndex(indexName: string, primaryKey: string): Promise<void> {
    try {
      await this.client.createIndex(indexName, { primaryKey });
    } catch (error) {
      console.error(`Failed to create index ${indexName}:`, error);
      throw error;
    }
  }

  // Удалить индекс
  async deleteIndex(indexName: string): Promise<void> {
    try {
      await this.client.deleteIndex(indexName);
    } catch (error) {
      console.error(`Failed to delete index ${indexName}:`, error);
      throw error;
    }
  }

  // Получить индекс
  getIndex(indexName: string) {
    return this.client.index(indexName);
  }

  // Добавить документы
  async addDocuments(indexName: string, documents: any[]): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      await index.addDocuments(documents);
    } catch (error) {
      console.error(`Failed to add documents to ${indexName}:`, error);
      throw error;
    }
  }

  // Обновить документы
  async updateDocuments(indexName: string, documents: any[]): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      await index.updateDocuments(documents);
    } catch (error) {
      console.error(`Failed to update documents in ${indexName}:`, error);
      throw error;
    }
  }

  // Удалить документы
  async deleteDocuments(indexName: string, documentIds: string[]): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      await index.deleteDocuments(documentIds);
    } catch (error) {
      console.error(`Failed to delete documents from ${indexName}:`, error);
      throw error;
    }
  }

  // Поиск
  async search(indexName: string, query: string, options?: any): Promise<any> {
    try {
      const index = this.getIndex(indexName);
      const results = await index.search(query, options);
      return results;
    } catch (error) {
      console.error(`Search failed in ${indexName}:`, error);
      throw error;
    }
  }

  // Настройка индекса
  async configureIndex(indexName: string, settings: any): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      await index.updateSettings(settings);
    } catch (error) {
      console.error(`Failed to configure index ${indexName}:`, error);
      throw error;
    }
  }

  // Получить настройки индекса
  async getIndexSettings(indexName: string): Promise<any> {
    try {
      const index = this.getIndex(indexName);
      const settings = await index.getSettings();
      return settings;
    } catch (error) {
      console.error(`Failed to get settings for ${indexName}:`, error);
      throw error;
    }
  }
}

// Глобальный экземпляр
export const searchClient = new SearchClient();







