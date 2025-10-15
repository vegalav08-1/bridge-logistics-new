import { STATE_SHIPMENT_STATUSES, LOGISTICS_ACTIONS } from './shipments';

// Метрики для стейт-машины
export class StateMachineMetrics {
  private static instance: StateMachineMetrics;
  
  // Счётчики
  private transitionCounts = new Map<string, number>();
  private actionCounts = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  
  // Гистограммы времени
  private dwellTimes = new Map<string, number[]>();
  private transitionDurations = new Map<string, number[]>();
  
  // Последние обновления
  private lastTransitionTime = new Map<string, number>();
  private lastActionTime = new Map<string, number>();

  static getInstance(): StateMachineMetrics {
    if (!StateMachineMetrics.instance) {
      StateMachineMetrics.instance = new StateMachineMetrics();
    }
    return StateMachineMetrics.instance;
  }

  // Метрики переходов
  recordTransition(from: string, to: string, duration: number) {
    const key = `${from}->${to}`;
    this.transitionCounts.set(key, (this.transitionCounts.get(key) || 0) + 1);
    
    if (!this.transitionDurations.has(key)) {
      this.transitionDurations.set(key, []);
    }
    this.transitionDurations.get(key)!.push(duration);
    
    // Ограничиваем размер массива
    const durations = this.transitionDurations.get(key)!;
    if (durations.length > 1000) {
      durations.splice(0, durations.length - 1000);
    }
    
    this.lastTransitionTime.set(key, Date.now());
  }

  // Метрики действий
  recordAction(action: string, duration: number) {
    this.actionCounts.set(action, (this.actionCounts.get(action) || 0) + 1);
    this.lastActionTime.set(action, Date.now());
  }

  // Метрики ошибок
  recordError(type: string, reason: string) {
    const key = `${type}:${reason}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  // Время нахождения в статусе
  recordDwellTime(status: string, duration: number) {
    if (!this.dwellTimes.has(status)) {
      this.dwellTimes.set(status, []);
    }
    this.dwellTimes.get(status)!.push(duration);
    
    // Ограничиваем размер массива
    const times = this.dwellTimes.get(status)!;
    if (times.length > 1000) {
      times.splice(0, times.length - 1000);
    }
  }

  // Получить метрики в формате Prometheus
  getPrometheusMetrics(): string {
    const lines: string[] = [];
    
    // Счётчики переходов
    lines.push('# HELP state_transition_total Total number of state transitions');
    lines.push('# TYPE state_transition_total counter');
    for (const [key, count] of this.transitionCounts) {
      lines.push(`state_transition_total{from="${key.split('->')[0]}",to="${key.split('->')[1]}"} ${count}`);
    }
    
    // Счётчики действий
    lines.push('# HELP state_action_total Total number of actions performed');
    lines.push('# TYPE state_action_total counter');
    for (const [action, count] of this.actionCounts) {
      lines.push(`state_action_total{action="${action}"} ${count}`);
    }
    
    // Счётчики ошибок
    lines.push('# HELP state_error_total Total number of errors');
    lines.push('# TYPE state_error_total counter');
    for (const [key, count] of this.errorCounts) {
      const [type, reason] = key.split(':');
      lines.push(`state_error_total{type="${type}",reason="${reason}"} ${count}`);
    }
    
    // Гистограммы времени нахождения в статусе
    lines.push('# HELP state_dwell_seconds_bucket Time spent in each status');
    lines.push('# TYPE state_dwell_seconds_bucket histogram');
    for (const [status, times] of this.dwellTimes) {
      const sortedTimes = times.sort((a, b) => a - b);
      const buckets = [1, 5, 15, 30, 60, 300, 900, 3600]; // секунды
      
      for (const bucket of buckets) {
        const count = sortedTimes.filter(t => t <= bucket).length;
        lines.push(`state_dwell_seconds_bucket{status="${status}",le="${bucket}"} ${count}`);
      }
      lines.push(`state_dwell_seconds_bucket{status="${status}",le="+Inf"} ${times.length}`);
      lines.push(`state_dwell_seconds_sum{status="${status}"} ${times.reduce((a, b) => a + b, 0)}`);
      lines.push(`state_dwell_seconds_count{status="${status}"} ${times.length}`);
    }
    
    // Гистограммы времени переходов
    lines.push('# HELP state_transition_duration_seconds_bucket Duration of state transitions');
    lines.push('# TYPE state_transition_duration_seconds_bucket histogram');
    for (const [key, durations] of this.transitionDurations) {
      const sortedDurations = durations.sort((a, b) => a - b);
      const buckets = [0.1, 0.5, 1, 2, 5, 10]; // секунды
      
      for (const bucket of buckets) {
        const count = sortedDurations.filter(d => d <= bucket).length;
        lines.push(`state_transition_duration_seconds_bucket{transition="${key}",le="${bucket}"} ${count}`);
      }
      lines.push(`state_transition_duration_seconds_bucket{transition="${key}",le="+Inf"} ${durations.length}`);
      lines.push(`state_transition_duration_seconds_sum{transition="${key}"} ${durations.reduce((a, b) => a + b, 0)}`);
      lines.push(`state_transition_duration_seconds_count{transition="${key}"} ${durations.length}`);
    }
    
    return lines.join('\n');
  }

  // Получить статистику
  getStats() {
    return {
      transitions: Object.fromEntries(this.transitionCounts),
      actions: Object.fromEntries(this.actionCounts),
      errors: Object.fromEntries(this.errorCounts),
      dwellTimes: Object.fromEntries(
        Array.from(this.dwellTimes.entries()).map(([status, times]) => [
          status,
          {
            count: times.length,
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            p50: this.percentile(times, 0.5),
            p95: this.percentile(times, 0.95),
            p99: this.percentile(times, 0.99),
          }
        ])
      ),
      transitionDurations: Object.fromEntries(
        Array.from(this.transitionDurations.entries()).map(([transition, durations]) => [
          transition,
          {
            count: durations.length,
            avg: durations.reduce((a, b) => a + b, 0) / durations.length,
            p50: this.percentile(durations, 0.5),
            p95: this.percentile(durations, 0.95),
            p99: this.percentile(durations, 0.99),
          }
        ])
      ),
    };
  }

  // Вычислить процентиль
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  // Очистить метрики
  clear() {
    this.transitionCounts.clear();
    this.actionCounts.clear();
    this.errorCounts.clear();
    this.dwellTimes.clear();
    this.transitionDurations.clear();
    this.lastTransitionTime.clear();
    this.lastActionTime.clear();
  }
}

// Глобальный экземпляр
export const stateMetrics = StateMachineMetrics.getInstance();

// Утилиты для логирования
export function logTransition(chatId: string, from: string, to: string, duration: number, byUserId: string) {
  console.log(`[STATE] Transition: ${chatId} ${from}->${to} (${duration}ms) by ${byUserId}`);
  stateMetrics.recordTransition(from, to, duration);
}

export function logAction(chatId: string, action: string, duration: number, byUserId: string) {
  console.log(`[STATE] Action: ${chatId} ${action} (${duration}ms) by ${byUserId}`);
  stateMetrics.recordAction(action, duration);
}

export function logError(chatId: string, type: string, reason: string, error?: Error) {
  console.error(`[STATE] Error: ${chatId} ${type}:${reason}`, error);
  stateMetrics.recordError(type, reason);
}

export function logDwellTime(chatId: string, status: string, duration: number) {
  console.log(`[STATE] Dwell: ${chatId} in ${status} for ${duration}ms`);
  stateMetrics.recordDwellTime(status, duration);
}

// Алерты
export interface AlertRule {
  name: string;
  condition: (metrics: StateMachineMetrics) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export const defaultAlertRules: AlertRule[] = [
  {
    name: 'high_error_rate',
    condition: (metrics) => {
      const stats = metrics.getStats();
      const totalErrors = Object.values(stats.errors).reduce((a, b) => a + b, 0);
      const totalActions = Object.values(stats.actions).reduce((a, b) => a + b, 0);
      return totalActions > 0 && (totalErrors / totalActions) > 0.05; // >5% ошибок
    },
    severity: 'high',
    message: 'High error rate in state machine operations',
  },
  {
    name: 'long_dwell_time',
    condition: (metrics) => {
      const stats = metrics.getStats();
      const receiveDwell = stats.dwellTimes['RECEIVE'];
      return receiveDwell && receiveDwell.p95 > 3600000; // >1 hour
    },
    severity: 'medium',
    message: 'Shipments spending too long in RECEIVE status',
  },
  {
    name: 'slow_transitions',
    condition: (metrics) => {
      const stats = metrics.getStats();
      const avgTransitionTime = Object.values(stats.transitionDurations)
        .reduce((sum, t) => sum + t.avg, 0) / Object.keys(stats.transitionDurations).length;
      return avgTransitionTime > 5000; // >5 seconds
    },
    severity: 'medium',
    message: 'State transitions are taking too long',
  },
];

export function checkAlerts(): Array<{ rule: AlertRule; triggered: boolean }> {
  return defaultAlertRules.map(rule => ({
    rule,
    triggered: rule.condition(stateMetrics),
  }));
}
