/**
 * Request Logger
 * 
 * Tracks all service layer requests, responses, and errors for monitoring and debugging.
 */

import { ServiceError } from '../base/ServiceError';

export interface RequestLog {
  id: string;
  timestamp: number;
  service: string;
  method: string;
  params?: any;
  duration?: number;
  success: boolean;
  error?: ServiceError;
  metadata?: Record<string, any>;
}

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestRequest: RequestLog | null;
  fastestRequest: RequestLog | null;
  errorRate: number;
  requestsByService: Record<string, number>;
  requestsByMethod: Record<string, number>;
}

class RequestLoggerClass {
  private logs: RequestLog[] = [];
  private maxLogs: number = 1000;
  private isEnabled: boolean = true;

  /**
   * Start tracking a request
   */
  startRequest(service: string, method: string, params?: any): string {
    if (!this.isEnabled) return '';

    const requestId = `${service}_${method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const log: RequestLog = {
      id: requestId,
      timestamp: Date.now(),
      service,
      method,
      params: this.sanitizeParams(params),
      success: false,
    };

    this.logs.push(log);
    this.trimLogs();

    return requestId;
  }

  /**
   * Complete a request successfully
   */
  completeRequest(requestId: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled || !requestId) return;

    const log = this.logs.find(l => l.id === requestId);
    if (!log) return;

    log.duration = Date.now() - log.timestamp;
    log.success = true;
    log.metadata = metadata;
  }

  /**
   * Mark a request as failed
   */
  failRequest(requestId: string, error: ServiceError, metadata?: Record<string, any>): void {
    if (!this.isEnabled || !requestId) return;

    const log = this.logs.find(l => l.id === requestId);
    if (!log) return;

    log.duration = Date.now() - log.timestamp;
    log.success = false;
    log.error = error;
    log.metadata = metadata;
  }

  /**
   * Get all logs
   */
  getLogs(filters?: {
    service?: string;
    method?: string;
    success?: boolean;
    minDuration?: number;
    maxDuration?: number;
    startTime?: number;
    endTime?: number;
  }): RequestLog[] {
    let filtered = [...this.logs];

    if (filters) {
      if (filters.service) {
        filtered = filtered.filter(log => log.service === filters.service);
      }
      if (filters.method) {
        filtered = filtered.filter(log => log.method === filters.method);
      }
      if (filters.success !== undefined) {
        filtered = filtered.filter(log => log.success === filters.success);
      }
      if (filters.minDuration !== undefined) {
        filtered = filtered.filter(log => (log.duration || 0) >= filters.minDuration!);
      }
      if (filters.maxDuration !== undefined) {
        filtered = filtered.filter(log => (log.duration || 0) <= filters.maxDuration!);
      }
      if (filters.startTime !== undefined) {
        filtered = filtered.filter(log => log.timestamp >= filters.startTime!);
      }
      if (filters.endTime !== undefined) {
        filtered = filtered.filter(log => log.timestamp <= filters.endTime!);
      }
    }

    return filtered;
  }

  /**
   * Get request metrics
   */
  getMetrics(timeWindowMs?: number): RequestMetrics {
    const now = Date.now();
    const logs = timeWindowMs 
      ? this.logs.filter(log => now - log.timestamp <= timeWindowMs)
      : this.logs;

    const completedLogs = logs.filter(log => log.duration !== undefined);
    const successfulLogs = logs.filter(log => log.success);
    const failedLogs = logs.filter(log => !log.success);

    const totalDuration = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const averageResponseTime = completedLogs.length > 0 ? totalDuration / completedLogs.length : 0;

    const sortedByDuration = [...completedLogs].sort((a, b) => (b.duration || 0) - (a.duration || 0));

    const requestsByService = logs.reduce((acc, log) => {
      acc[log.service] = (acc[log.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const requestsByMethod = logs.reduce((acc, log) => {
      acc[log.method] = (acc[log.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests: logs.length,
      successfulRequests: successfulLogs.length,
      failedRequests: failedLogs.length,
      averageResponseTime,
      slowestRequest: sortedByDuration[0] || null,
      fastestRequest: sortedByDuration[sortedByDuration.length - 1] || null,
      errorRate: logs.length > 0 ? (failedLogs.length / logs.length) * 100 : 0,
      requestsByService,
      requestsByMethod,
    };
  }

  /**
   * Get slow queries (above threshold)
   */
  getSlowQueries(thresholdMs: number = 1000): RequestLog[] {
    return this.logs
      .filter(log => log.duration !== undefined && log.duration > thresholdMs)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }

  /**
   * Get failed requests
   */
  getFailedRequests(): RequestLog[] {
    return this.logs.filter(log => !log.success);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set maximum number of logs to keep
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    this.trimLogs();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get logs summary for console
   */
  printSummary(timeWindowMs?: number): void {
    const metrics = this.getMetrics(timeWindowMs);
    
    console.group('📊 Request Logger Summary');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${metrics.failedRequests} (${metrics.errorRate.toFixed(1)}%)`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    
    if (metrics.slowestRequest) {
      console.log(`Slowest Request: ${metrics.slowestRequest.service}.${metrics.slowestRequest.method} (${metrics.slowestRequest.duration}ms)`);
    }
    
    console.log('\nRequests by Service:');
    Object.entries(metrics.requestsByService).forEach(([service, count]) => {
      console.log(`  ${service}: ${count}`);
    });
    
    const slowQueries = this.getSlowQueries();
    if (slowQueries.length > 0) {
      console.warn(`\n⚠️  ${slowQueries.length} slow queries detected (>1000ms)`);
    }
    
    console.groupEnd();
  }

  /**
   * Sanitize params to remove sensitive data
   */
  private sanitizeParams(params: any): any {
    if (!params) return params;
    
    const sanitized = { ...params };
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key'];
    
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  /**
   * Trim logs to max size
   */
  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
}

export const RequestLogger = new RequestLoggerClass();
