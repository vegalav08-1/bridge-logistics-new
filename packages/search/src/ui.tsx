import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { SearchAPI, SearchRequest, SearchResponse, SuggestionsRequest, SuggestionsResponse } from './api';
import { AnalyticsAPI, AnalyticsQuery, AnalyticsResult } from './analytics';
import { Document, getDocumentType } from './schemas';

// Схема для пропсов компонента поиска
export const SearchPropsSchema = z.object({
  searchAPI: z.any(),
  analyticsAPI: z.any().optional(),
  onResultClick: z.function().args(z.any()).returns(z.void()).optional(),
  placeholder: z.string().default('Поиск...'),
  showSuggestions: z.boolean().default(true),
  showFilters: z.boolean().default(true),
  showAnalytics: z.boolean().default(false),
  documentTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])).optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type SearchProps = z.infer<typeof SearchPropsSchema>;

// Схема для пропсов компонента результатов поиска
export const SearchResultsPropsSchema = z.object({
  results: z.array(z.any()),
  totalHits: z.number(),
  loading: z.boolean(),
  onResultClick: z.function().args(z.any()).returns(z.void()).optional(),
  onLoadMore: z.function().returns(z.void()).optional(),
  hasMore: z.boolean().default(false),
});

export type SearchResultsProps = z.infer<typeof SearchResultsPropsSchema>;

// Схема для пропсов компонента подсказок
export const SuggestionsPropsSchema = z.object({
  suggestions: z.array(z.object({
    text: z.string(),
    type: z.string(),
    documentType: z.string(),
    documentId: z.string(),
    score: z.number(),
  })),
  loading: z.boolean(),
  onSuggestionClick: z.function().args(z.any()).returns(z.void()).optional(),
  visible: z.boolean().default(false),
});

export type SuggestionsProps = z.infer<typeof SuggestionsPropsSchema>;

// Схема для пропсов компонента фильтров
export const FiltersPropsSchema = z.object({
  documentTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])),
  selectedTypes: z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice'])),
  onTypesChange: z.function().args(z.array(z.enum(['chat', 'message', 'attachment', 'finance', 'invoice']))).returns(z.void()),
  filters: z.array(z.string()).optional(),
  onFiltersChange: z.function().args(z.array(z.string())).returns(z.void()).optional(),
  visible: z.boolean().default(false),
});

export type FiltersProps = z.infer<typeof FiltersPropsSchema>;

// Схема для пропсов компонента аналитики
export const AnalyticsPropsSchema = z.object({
  analyticsAPI: z.any(),
  query: z.any().optional(),
  onQueryChange: z.function().args(z.any()).returns(z.void()).optional(),
  visible: z.boolean().default(false),
});

export type AnalyticsProps = z.infer<typeof AnalyticsPropsSchema>;

// Компонент поиска
export function Search({
  searchAPI,
  analyticsAPI,
  onResultClick,
  placeholder = 'Поиск...',
  showSuggestions = true,
  showFilters = true,
  showAnalytics = false,
  documentTypes,
  limit = 20,
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse['suggestions']>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<('chat' | 'message' | 'attachment' | 'finance' | 'invoice')[]>(documentTypes || []);
  const [filters, setFilters] = useState<string[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Обработка поиска
  const handleSearch = useCallback(async (searchQuery: string, searchOffset = 0) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalHits(0);
      return;
    }

    setLoading(true);
    try {
      const request: SearchRequest = {
        query: searchQuery,
        documentTypes: selectedTypes.length > 0 ? selectedTypes as any : undefined,
        filters: filters.length > 0 ? filters : undefined,
        limit,
        offset: searchOffset,
      };

      const response = await searchAPI.search(request);
      
      if (searchOffset === 0) {
        setResults(response.hits);
      } else {
        setResults(prev => [...prev, ...response.hits]);
      }
      
      setTotalHits(response.totalHits);
      setOffset(searchOffset + response.hits.length);
      setHasMore(response.hits.length === limit);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchAPI, selectedTypes, filters, limit]);

  // Обработка подсказок
  const handleSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const request: SuggestionsRequest = {
        query: searchQuery,
        documentTypes: selectedTypes.length > 0 ? selectedTypes as any : undefined,
        filters: filters.length > 0 ? filters : undefined,
        limit: 10,
      };

      const response = await searchAPI.getSuggestions(request);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [searchAPI, selectedTypes, filters, showSuggestions]);

  // Обработка изменения запроса
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setOffset(0);
    
    if (newQuery.trim()) {
      handleSuggestions(newQuery);
      setShowSuggestionsDropdown(true);
    } else {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
    }
  }, [handleSuggestions]);

  // Обработка отправки поиска
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestionsDropdown(false);
    handleSearch(query, 0);
  }, [query, handleSearch]);

  // Обработка клика по подсказке
  const handleSuggestionClick = useCallback((suggestion: any) => {
    setQuery(suggestion.text);
    setShowSuggestionsDropdown(false);
    handleSearch(suggestion.text, 0);
  }, [handleSearch]);

  // Обработка загрузки дополнительных результатов
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      handleSearch(query, offset);
    }
  }, [hasMore, loading, query, offset, handleSearch]);

  // Обработка изменения типов документов
  const handleTypesChange = useCallback((newTypes: ('chat' | 'message' | 'attachment' | 'finance' | 'invoice')[]) => {
    setSelectedTypes(newTypes);
    setOffset(0);
    if (query.trim()) {
      handleSearch(query, 0);
    }
  }, [query, handleSearch]);

  // Обработка изменения фильтров
  const handleFiltersChange = useCallback((newFilters: string[]) => {
    setFilters(newFilters);
    setOffset(0);
    if (query.trim()) {
      handleSearch(query, 0);
    }
  }, [query, handleSearch]);

  // Обработка клика по результату
  const handleResultClick = useCallback((result: Document) => {
    if (onResultClick) {
      onResultClick(result);
    }
  }, [onResultClick]);

  return (
    <div className="search-container">
      {/* Поисковая строка */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Поиск...' : 'Найти'}
          </button>
        </div>
        
        {/* Кнопки управления */}
        <div className="search-controls">
          {showFilters && (
            <button
              type="button"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="control-button"
            >
              Фильтры
            </button>
          )}
          {showAnalytics && analyticsAPI && (
            <button
              type="button"
              onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
              className="control-button"
            >
              Аналитика
            </button>
          )}
        </div>
      </form>

      {/* Подсказки */}
      {showSuggestions && showSuggestionsDropdown && (
        <Suggestions
          suggestions={suggestions}
          loading={suggestionsLoading}
          onSuggestionClick={handleSuggestionClick}
          visible={showSuggestionsDropdown}
        />
      )}

      {/* Панель фильтров */}
      {showFilters && showFiltersPanel && (
        <Filters
          documentTypes={documentTypes || ['chat', 'message', 'attachment', 'finance', 'invoice']}
          selectedTypes={selectedTypes}
          onTypesChange={handleTypesChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          visible={showFiltersPanel}
        />
      )}

      {/* Панель аналитики */}
      {showAnalytics && showAnalyticsPanel && analyticsAPI && (
        <Analytics
          analyticsAPI={analyticsAPI}
          query={{ documentTypes: selectedTypes, filters }}
          onQueryChange={(newQuery) => {
            // Обновляем фильтры на основе аналитического запроса
            if (newQuery.filters) {
              handleFiltersChange(newQuery.filters);
            }
          }}
          visible={showAnalyticsPanel}
        />
      )}

      {/* Результаты поиска */}
      <SearchResults
        results={results}
        totalHits={totalHits}
        loading={loading}
        onResultClick={handleResultClick}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}

// Компонент результатов поиска
export function SearchResults({
  results,
  totalHits,
  loading,
  onResultClick,
  onLoadMore,
  hasMore,
}: SearchResultsProps) {
  if (loading && results.length === 0) {
    return (
      <div className="search-results loading">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results empty">
        <div className="empty-message">Результаты не найдены</div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <div className="results-count">
          Найдено: {totalHits} результатов
        </div>
      </div>
      
      <div className="results-list">
        {results.map((result, index) => (
          <SearchResult
            key={`${(result as any).id}-${index}`}
            result={result}
            onClick={() => onResultClick?.(result)}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="load-more">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="load-more-button"
          >
            {loading ? 'Загрузка...' : 'Загрузить ещё'}
          </button>
        </div>
      )}
    </div>
  );
}

// Компонент отдельного результата поиска
export function SearchResult({ result, onClick }: { result: any; onClick?: () => void }) {
  const documentType = getDocumentType(result);
  
  const getResultIcon = (type: string | null) => {
    switch (type) {
      case 'chat': return '💬';
      case 'message': return '📝';
      case 'attachment': return '📎';
      case 'finance': return '💰';
      case 'invoice': return '🧾';
      default: return '📄';
    }
  };

  const getResultTitle = (result: any) => {
    switch (result.type) {
      case 'chat':
        return result.number || result.id;
      case 'message':
        return result.text?.substring(0, 100) || 'Сообщение';
      case 'attachment':
        return result.fileName || 'Вложение';
      case 'finance':
        return result.title || 'Финансовая операция';
      case 'invoice':
        return result.number || 'Инвойс';
      default:
        return result.id;
    }
  };

  const getResultSubtitle = (result: any) => {
    switch (result.type) {
      case 'chat':
        return result.preview || result.status;
      case 'message':
        return result.authorEmail || result.kind;
      case 'attachment':
        return result.mime || result.fileType;
      case 'finance':
        return `${result.amount} ${result.currency}`;
      case 'invoice':
        return `${result.amount} ${result.currency}`;
      default:
        return '';
    }
  };

  return (
    <div className="search-result" onClick={onClick}>
      <div className="result-icon">
        {getResultIcon(documentType)}
      </div>
      <div className="result-content">
        <div className="result-title">
          {getResultTitle(result)}
        </div>
        <div className="result-subtitle">
          {getResultSubtitle(result)}
        </div>
        <div className="result-meta">
          <span className="result-type">{documentType}</span>
          <span className="result-date">
            {new Date((result as any).updatedAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>
    </div>
  );
}

// Компонент подсказок
export function Suggestions({
  suggestions,
  loading,
  onSuggestionClick,
  visible,
}: SuggestionsProps) {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggestions">
      {loading && (
        <div className="suggestions-loading">
          <div className="loading-spinner">Загрузка подсказок...</div>
        </div>
      )}
      
      {!loading && (
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              <div className="suggestion-text">{suggestion.text}</div>
              <div className="suggestion-meta">
                <span className="suggestion-type">{suggestion.documentType}</span>
                <span className="suggestion-score">{suggestion.score.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент фильтров
export function Filters({
  documentTypes,
  selectedTypes,
  onTypesChange,
  filters,
  onFiltersChange,
  visible,
}: FiltersProps) {
  if (!visible) {
    return null;
  }

  const handleTypeToggle = (type: 'chat' | 'message' | 'attachment' | 'finance' | 'invoice') => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypesChange(newTypes);
  };

  return (
    <div className="filters-panel">
      <div className="filters-section">
        <h3>Типы документов</h3>
        <div className="filter-options">
          {documentTypes.map(type => (
            <label key={type} className="filter-option">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
              />
              <span className="filter-label">{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      {onFiltersChange && (
        <div className="filters-section">
          <h3>Дополнительные фильтры</h3>
          <div className="filter-input">
            <input
              type="text"
              placeholder="Введите фильтр..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    onFiltersChange([...filters, input.value.trim()]);
                    input.value = '';
                  }
                }
              }}
            />
          </div>
          {filters && filters.length > 0 && (
            <div className="active-filters">
              {filters.map((filter, index) => (
                <span key={index} className="active-filter">
                  {filter}
                  <button
                    onClick={() => onFiltersChange(filters.filter((_, i) => i !== index))}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Компонент аналитики
export function Analytics({
  analyticsAPI,
  query,
  onQueryChange,
  visible,
}: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && query) {
      loadAnalytics();
    }
  }, [visible, query]);

  const loadAnalytics = async () => {
    if (!query) return;

    setLoading(true);
    try {
      const result = await analyticsAPI.executeQuery(query);
      setAnalytics(result);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="analytics-panel">
      <h3>Аналитика</h3>
      
      {loading && (
        <div className="analytics-loading">
          <div className="loading-spinner">Загрузка аналитики...</div>
        </div>
      )}
      
      {!loading && analytics && (
        <div className="analytics-content">
        {analytics.summary && (
          <div className="analytics-summary">
            {Object.entries(analytics.summary).map(([key, value]) => (
              <div key={key} className="summary-item">
                <div className="summary-label">{key}</div>
                <div className="summary-value">{(value as any).formatted || (value as any).value}</div>
              </div>
            ))}
          </div>
        )}
          
          {analytics.data.length > 0 && (
            <div className="analytics-data">
              <h4>Данные</h4>
              <div className="data-table">
                {analytics.data.slice(0, 10).map((item, index) => (
                  <div key={index} className="data-row">
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key} className="data-cell">
                        <span className="cell-label">{key}:</span>
                        <span className="cell-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

