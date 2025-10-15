import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { AnalyticsAPI, Dashboard, Widget, AnalyticsQuery, AnalyticsResult } from './analytics';

// Схема для пропсов компонента дашборда
export const DashboardPropsSchema = z.object({
  analyticsAPI: z.any(),
  dashboard: z.any().optional(), // Dashboard schema
  onDashboardChange: z.function().args(z.any()).returns(z.void()).optional(),
  onWidgetClick: z.function().args(z.any()).returns(z.void()).optional(),
  editable: z.boolean().default(false),
  showControls: z.boolean().default(true),
});

export type DashboardProps = z.infer<typeof DashboardPropsSchema>;

// Схема для пропсов компонента виджета
export const WidgetPropsSchema = z.object({
  widget: z.any(), // Widget schema
  analyticsAPI: z.any(),
  onWidgetClick: z.function().args(z.any()).returns(z.void()).optional(),
  onEdit: z.function().args(z.any()).returns(z.void()).optional(),
  onDelete: z.function().args(z.any()).returns(z.void()).optional(),
  editable: z.boolean().default(false),
  loading: z.boolean().default(false),
});

export type WidgetProps = z.infer<typeof WidgetPropsSchema>;

// Схема для пропсов компонента метрики
export const MetricWidgetPropsSchema = z.object({
  title: z.string(),
  value: z.any(),
  format: z.string().optional(),
  trend: z.object({
    value: z.number(),
    direction: z.enum(['up', 'down', 'neutral']),
    period: z.string(),
  }).optional(),
  onClick: z.function().returns(z.void()).optional(),
});

export type MetricWidgetProps = z.infer<typeof MetricWidgetPropsSchema>;

// Схема для пропсов компонента графика
export const ChartWidgetPropsSchema = z.object({
  title: z.string(),
  data: z.array(z.any()),
  type: z.enum(['line', 'bar', 'pie', 'area']).default('bar'),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  onClick: z.function().args(z.any()).returns(z.void()).optional(),
});

export type ChartWidgetProps = z.infer<typeof ChartWidgetPropsSchema>;

// Схема для пропсов компонента таблицы
export const TableWidgetPropsSchema = z.object({
  title: z.string(),
  data: z.array(z.any()),
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    format: z.string().optional(),
    sortable: z.boolean().default(false),
  })),
  onClick: z.function().args(z.any()).returns(z.void()).optional(),
  limit: z.number().default(10),
});

export type TableWidgetProps = z.infer<typeof TableWidgetPropsSchema>;

// Схема для пропсов компонента списка
export const ListWidgetPropsSchema = z.object({
  title: z.string(),
  data: z.array(z.any()),
  itemRenderer: z.function().args(z.any()).returns(z.any()).optional(),
  onClick: z.function().args(z.any()).returns(z.void()).optional(),
  limit: z.number().default(10),
});

export type ListWidgetProps = z.infer<typeof ListWidgetPropsSchema>;

// Компонент дашборда
export function Dashboard({
  analyticsAPI,
  dashboard,
  onDashboardChange,
  onWidgetClick,
  editable = false,
  showControls = true,
}: DashboardProps) {
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(dashboard || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем предустановленные дашборды если не передан конкретный
  useEffect(() => {
    if (!currentDashboard) {
      loadPresetDashboards();
    }
  }, [currentDashboard]);

  const loadPresetDashboards = async () => {
    try {
      const presetDashboards = analyticsAPI.getPresetDashboards();
      if (presetDashboards.length > 0) {
        setCurrentDashboard(presetDashboards[0]);
      }
    } catch (err) {
      setError('Ошибка загрузки дашбордов');
    }
  };

  const handleWidgetEdit = useCallback((widget: Widget) => {
    if (onDashboardChange && currentDashboard) {
      const updatedDashboard = {
        ...currentDashboard,
        widgets: currentDashboard.widgets.map(w => 
          w.id === widget.id ? widget : w
        ),
        updatedAt: new Date().toISOString(),
      };
      setCurrentDashboard(updatedDashboard);
      onDashboardChange(updatedDashboard);
    }
  }, [currentDashboard, onDashboardChange]);

  const handleWidgetDelete = useCallback((widgetId: string) => {
    if (onDashboardChange && currentDashboard) {
      const updatedDashboard = {
        ...currentDashboard,
        widgets: currentDashboard.widgets.filter(w => w.id !== widgetId),
        updatedAt: new Date().toISOString(),
      };
      setCurrentDashboard(updatedDashboard);
      onDashboardChange(updatedDashboard);
    }
  }, [currentDashboard, onDashboardChange]);

  const handleAddWidget = useCallback(() => {
    if (onDashboardChange && currentDashboard) {
      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type: 'metric',
        title: 'Новый виджет',
        query: {
          metrics: [{ name: 'count', type: 'count' }],
          documentTypes: ['chat'],
        },
        position: {
          x: 0,
          y: 0,
          width: 200,
          height: 150,
        },
      };

      const updatedDashboard = {
        ...currentDashboard,
        widgets: [...currentDashboard.widgets, newWidget],
        updatedAt: new Date().toISOString(),
      };
      setCurrentDashboard(updatedDashboard);
      onDashboardChange(updatedDashboard);
    }
  }, [currentDashboard, onDashboardChange]);

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
        <button onClick={loadPresetDashboards} className="retry-button">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!currentDashboard) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Загрузка дашборда...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{currentDashboard.name}</h1>
        {currentDashboard.description && (
          <p className="dashboard-description">{currentDashboard.description}</p>
        )}
        
        {showControls && (
          <div className="dashboard-controls">
            {editable && (
              <button onClick={handleAddWidget} className="add-widget-button">
                Добавить виджет
              </button>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-content">
        <div className="widgets-grid">
          {currentDashboard.widgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              analyticsAPI={analyticsAPI}
              onWidgetClick={onWidgetClick}
              onEdit={handleWidgetEdit}
              onDelete={handleWidgetDelete}
              editable={editable}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент виджета
export function Widget({
  widget,
  analyticsAPI,
  onWidgetClick,
  onEdit,
  onDelete,
  editable = false,
  loading = false,
}: WidgetProps) {
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные виджета
  useEffect(() => {
    loadWidgetData();
  }, [widget.query]);

  const loadWidgetData = async () => {
    setWidgetLoading(true);
    setError(null);
    
    try {
      const result = await analyticsAPI.executeQuery(widget.query);
      setData(result);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setWidgetLoading(false);
    }
  };

  const handleWidgetClick = useCallback(() => {
    if (onWidgetClick) {
      onWidgetClick(widget);
    }
  }, [widget, onWidgetClick]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(widget);
    }
  }, [widget, onEdit]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(widget.id);
    }
  }, [widget.id, onDelete]);

  const renderWidgetContent = () => {
    if (widgetLoading || loading) {
      return <div className="widget-loading">Загрузка...</div>;
    }

    if (error) {
      return <div className="widget-error">{error}</div>;
    }

    if (!data) {
      return <div className="widget-empty">Нет данных</div>;
    }

    switch (widget.type) {
      case 'metric':
        return <MetricWidget title={widget.title} value={data.summary} />;
      case 'chart':
        return <ChartWidget title={widget.title} data={data.data} type="bar" />;
      case 'table':
        return <TableWidget title={widget.title} data={data.data} columns={[]} />;
      case 'list':
        return <ListWidget title={widget.title} data={data.data} />;
      default:
        return <div className="widget-unknown">Неизвестный тип виджета</div>;
    }
  };

  return (
    <div 
      className={`widget widget-${widget.type}`}
      style={widget.position ? {
        gridColumn: `span ${Math.ceil(widget.position.width / 200)}`,
        gridRow: `span ${Math.ceil(widget.position.height / 150)}`,
      } : undefined}
    >
      <div className="widget-header">
        <h3 className="widget-title">{widget.title}</h3>
        {editable && (
          <div className="widget-controls">
            <button onClick={handleEdit} className="edit-button">✏️</button>
            <button onClick={handleDelete} className="delete-button">🗑️</button>
          </div>
        )}
      </div>
      
      <div className="widget-content" onClick={handleWidgetClick}>
        {renderWidgetContent()}
      </div>
    </div>
  );
}

// Компонент метрики
export function MetricWidget({ title, value, format, trend, onClick }: MetricWidgetProps) {
  const formatValue = (val: any) => {
    if (typeof val === 'number') {
      if (format === 'currency') {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        }).format(val);
      }
      if (format === 'percent') {
        return `${val.toFixed(1)}%`;
      }
      return new Intl.NumberFormat('ru-RU').format(val);
    }
    return String(val);
  };

  return (
    <div className="metric-widget" onClick={onClick}>
      <div className="metric-title">{title}</div>
      <div className="metric-value">
        {value ? formatValue(value) : '—'}
      </div>
      {trend && (
        <div className={`metric-trend trend-${trend.direction}`}>
          <span className="trend-icon">
            {trend.direction === 'up' ? '↗️' : trend.direction === 'down' ? '↘️' : '→'}
          </span>
          <span className="trend-value">{Math.abs(trend.value)}%</span>
          <span className="trend-period">{trend.period}</span>
        </div>
      )}
    </div>
  );
}

// Компонент графика
export function ChartWidget({ title, data, type = 'bar', xAxis, yAxis, onClick }: ChartWidgetProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Простая обработка данных для отображения
    return data.slice(0, 10).map((item, index) => ({
      label: item[xAxis || 'id'] || `Item ${index + 1}`,
      value: item[yAxis || 'count'] || 0,
    }));
  }, [data, xAxis, yAxis]);

  return (
    <div className="chart-widget" onClick={onClick}>
      <div className="chart-title">{title}</div>
      <div className="chart-content">
        {chartData.length > 0 ? (
          <div className="chart-bars">
            {chartData.map((item, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${Math.max(10, (item.value / Math.max(...chartData.map(d => d.value))) * 100)}%` 
                  }}
                />
                <div className="bar-label">{item.label}</div>
                <div className="bar-value">{item.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="chart-empty">Нет данных для отображения</div>
        )}
      </div>
    </div>
  );
}

// Компонент таблицы
export function TableWidget({ title, data, columns, onClick, limit = 10 }: TableWidgetProps) {
  const tableData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(0, limit);
  }, [data, limit]);

  const tableColumns = useMemo(() => {
    if (columns.length > 0) return columns;
    
    // Автоматически определяем колонки из данных
    if (tableData.length > 0) {
      const firstItem = tableData[0];
      return Object.keys(firstItem).map(key => ({
        key,
        label: key,
        sortable: false,
      }));
    }
    
    return [];
  }, [columns, tableData]);

  return (
    <div className="table-widget" onClick={onClick}>
      <div className="table-title">{title}</div>
      <div className="table-content">
        {tableData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th key={column.key} className="table-header">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index} className="table-row">
                  {tableColumns.map(column => (
                    <td key={column.key} className="table-cell">
                      {item[column.key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="table-empty">Нет данных для отображения</div>
        )}
      </div>
    </div>
  );
}

// Компонент списка
export function ListWidget({ title, data, itemRenderer, onClick, limit = 10 }: ListWidgetProps) {
  const listData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(0, limit);
  }, [data, limit]);

  const renderItem = (item: any, index: number) => {
    if (itemRenderer) {
      return itemRenderer(item);
    }

    // Простой рендеринг по умолчанию
    return (
      <div key={index} className="list-item">
        <div className="item-title">{item.title || item.name || item.id}</div>
        <div className="item-subtitle">{item.description || item.subtitle}</div>
        <div className="item-meta">
          {item.date && <span className="item-date">{item.date}</span>}
          {item.count && <span className="item-count">{item.count}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="list-widget" onClick={onClick}>
      <div className="list-title">{title}</div>
      <div className="list-content">
        {listData.length > 0 ? (
          <div className="list-items">
            {listData.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <div className="list-empty">Нет данных для отображения</div>
        )}
      </div>
    </div>
  );
}

