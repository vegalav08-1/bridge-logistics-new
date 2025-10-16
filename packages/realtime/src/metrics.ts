/**
 * Metrics and observability for real-time communication
 */

interface Metrics {
  // Connection metrics
  connectionsTotal: number;
  connectionsActive: number;
  connectionsFailed: number;
  reconnectionsTotal: number;
  
  // Message metrics
  messagesReceived: number;
  messagesSent: number;
  messagesFailed: number;
  
  // Event metrics
  eventsPublished: number;
  eventsDelivered: number;
  eventsFailed: number;
  
  // Room metrics
  roomsActive: number;
  subscriptionsTotal: number;
  
  // Latency metrics
  avgLatencyMs: number;
  maxLatencyMs: number;
  
  // Error metrics
  issuesTotal: number;
  issuesByType: Record<string, number>;
  errorsTotal: number;
  errorsByType: Record<string, number>;
}

class MetricsCollector {
  private metrics: Metrics = {
    connectionsTotal: 0,
    connectionsActive: 0,
    connectionsFailed: 0,
    reconnectionsTotal: 0,
    messagesReceived: 0,
    messagesSent: 0,
    messagesFailed: 0,
    eventsPublished: 0,
    eventsDelivered: 0,
    eventsFailed: 0,
    roomsActive: 0,
    subscriptionsTotal: 0,
    avgLatencyMs: 0,
    maxLatencyMs: 0,
    issuesTotal: 0,
    issuesByType: {},
    errorsTotal: 0,
    errorsByType: {},
  };

  private latencySamples: number[] = [];
  private readonly maxLatencySamples = 1000;

  // Connection metrics
  incrementConnections(): void {
    this.metrics.connectionsTotal++;
    this.metrics.connectionsActive++;
    this.log('connection.established', { total: this.metrics.connectionsTotal });
  }

  decrementConnections(): void {
    this.metrics.connectionsActive = Math.max(0, this.metrics.connectionsActive - 1);
  }

  incrementConnectionFailures(): void {
    this.metrics.connectionsFailed++;
    this.log('connection.failed', { total: this.metrics.connectionsFailed });
  }

  incrementReconnections(): void {
    this.metrics.reconnectionsTotal++;
    this.log('connection.reconnected', { total: this.metrics.reconnectionsTotal });
  }

  // Message metrics
  incrementMessagesReceived(): void {
    this.metrics.messagesReceived++;
  }

  incrementMessagesSent(): void {
    this.metrics.messagesSent++;
  }

  incrementMessagesFailed(): void {
    this.metrics.messagesFailed++;
  }

  // Event metrics
  incrementEventsPublished(eventType: string): void {
    this.metrics.eventsPublished++;
    this.log('event.published', { type: eventType });
  }

  incrementEventsDelivered(eventType: string): void {
    this.metrics.eventsDelivered++;
  }

  incrementEventsFailed(eventType: string, error: string): void {
    this.metrics.eventsFailed++;
    this.log('event.failed', { type: eventType, error });
  }

  // Room metrics
  setActiveRooms(count: number): void {
    this.metrics.roomsActive = count;
  }

  setSubscriptionsTotal(count: number): void {
    this.metrics.subscriptionsTotal = count;
  }

  // Latency metrics
  recordLatency(latencyMs: number): void {
    this.latencySamples.push(latencyMs);
    
    // Keep only recent samples
    if (this.latencySamples.length > this.maxLatencySamples) {
      this.latencySamples = this.latencySamples.slice(-this.maxLatencySamples);
    }
    
    // Update average latency
    const sum = this.latencySamples.reduce((a, b) => a + b, 0);
    this.metrics.avgLatencyMs = sum / this.latencySamples.length;
    
    // Update max latency
    this.metrics.maxLatencyMs = Math.max(this.metrics.maxLatencyMs, latencyMs);
  }

  // Error metrics
  recordError(errorType: string, error: Error): void {
    this.metrics.issuesTotal++;
    this.metrics.issuesByType[errorType] = (this.metrics.issuesByType[errorType] || 0) + 1;
    this.log('error.recorded', { 
      type: errorType, 
      message: error.message,
      stack: error.stack 
    });
  }

  // Get current metrics
  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  // Get metrics summary for logging
  getMetricsSummary(): string {
    const m = this.metrics;
    return `Connections: ${m.connectionsActive}/${m.connectionsTotal} active, ` +
           `${m.connectionsFailed} failed, ${m.reconnectionsTotal} reconnected. ` +
           `Messages: ${m.messagesReceived} received, ${m.messagesSent} sent, ` +
           `${m.messagesFailed} failed. Events: ${m.eventsPublished} published, ` +
           `${m.eventsDelivered} delivered, ${m.eventsFailed} failed. ` +
           `Rooms: ${m.roomsActive} active, ${m.subscriptionsTotal} subscriptions. ` +
           `Latency: avg ${m.avgLatencyMs.toFixed(1)}ms, max ${m.maxLatencyMs}ms. ` +
           `Errors: ${m.issuesTotal} total.`;
  }

  // Reset metrics (useful for testing)
  reset(): void {
    this.metrics = {
      connectionsTotal: 0,
      connectionsActive: 0,
      connectionsFailed: 0,
      reconnectionsTotal: 0,
      messagesReceived: 0,
      messagesSent: 0,
      messagesFailed: 0,
      eventsPublished: 0,
      eventsDelivered: 0,
      eventsFailed: 0,
      roomsActive: 0,
      subscriptionsTotal: 0,
      avgLatencyMs: 0,
      maxLatencyMs: 0,
      issuesTotal: 0,
      issuesByType: {},
      errorsTotal: 0,
      errorsByType: {},
    };
    this.latencySamples = [];
  }

  private log(level: string, data: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [REALTIME] [${level.toUpperCase()}]`, data);
  }
}

// Global metrics instance
export const metrics = new MetricsCollector();

// Prometheus-style metrics export (for monitoring systems)
export function getPrometheusMetrics(): string {
  const m = metrics.getMetrics();
  
  return [
    '# HELP realtime_connections_total Total number of connections',
    '# TYPE realtime_connections_total counter',
    `realtime_connections_total ${m.connectionsTotal}`,
    '',
    '# HELP realtime_connections_active Current number of active connections',
    '# TYPE realtime_connections_active gauge',
    `realtime_connections_active ${m.connectionsActive}`,
    '',
    '# HELP realtime_connections_failed Total number of failed connections',
    '# TYPE realtime_connections_failed counter',
    `realtime_connections_failed ${m.connectionsFailed}`,
    '',
    '# HELP realtime_messages_received_total Total number of messages received',
    '# TYPE realtime_messages_received_total counter',
    `realtime_messages_received_total ${m.messagesReceived}`,
    '',
    '# HELP realtime_messages_sent_total Total number of messages sent',
    '# TYPE realtime_messages_sent_total counter',
    `realtime_messages_sent_total ${m.messagesSent}`,
    '',
    '# HELP realtime_events_published_total Total number of events published',
    '# TYPE realtime_events_published_total counter',
    `realtime_events_published_total ${m.eventsPublished}`,
    '',
    '# HELP realtime_events_delivered_total Total number of events delivered',
    '# TYPE realtime_events_delivered_total counter',
    `realtime_events_delivered_total ${m.eventsDelivered}`,
    '',
    '# HELP realtime_rooms_active Current number of active rooms',
    '# TYPE realtime_rooms_active gauge',
    `realtime_rooms_active ${m.roomsActive}`,
    '',
    '# HELP realtime_latency_avg_ms Average message latency in milliseconds',
    '# TYPE realtime_latency_avg_ms gauge',
    `realtime_latency_avg_ms ${m.avgLatencyMs}`,
    '',
    '# HELP realtime_latency_max_ms Maximum message latency in milliseconds',
    '# TYPE realtime_latency_max_ms gauge',
    `realtime_latency_max_ms ${m.maxLatencyMs}`,
    '',
    '# HELP realtime_errors_total Total number of errors',
    '# TYPE realtime_errors_total counter',
    `realtime_errors_total ${m.issuesTotal}`,
  ].join('\n');
}

// Health check function
export function getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; metrics: Metrics } {
  const m = metrics.getMetrics();
  
  // Determine health status based on metrics
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  // Check error rate
  const totalOperations = m.messagesReceived + m.messagesSent + m.eventsPublished;
  const errorRate = totalOperations > 0 ? m.issuesTotal / totalOperations : 0;
  
  if (errorRate > 0.1) { // 10% error rate
    status = 'unhealthy';
  } else if (errorRate > 0.05) { // 5% error rate
    status = 'degraded';
  }
  
  // Check latency
  if (m.avgLatencyMs > 5000) { // 5 seconds
    status = 'unhealthy';
  } else if (m.avgLatencyMs > 2000) { // 2 seconds
    status = 'degraded';
  }
  
  // Check connection failure rate
  const connectionFailureRate = m.connectionsTotal > 0 ? m.connectionsFailed / m.connectionsTotal : 0;
  if (connectionFailureRate > 0.2) { // 20% failure rate
    status = 'unhealthy';
  } else if (connectionFailureRate > 0.1) { // 10% failure rate
    status = 'degraded';
  }
  
  return { status, metrics: m };
}







