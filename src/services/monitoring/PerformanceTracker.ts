/**
 * Performance Tracker
 * 
 * Tracks query performance, connection health, and identifies bottlenecks.
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  category: 'query' | 'mutation' | 'rpc' | 'storage' | 'auth';
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  totalOperations: number;
  averageDuration: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  slowestOperations: PerformanceMetric[];
  operationsByCategory: Record<string, number>;
  bottlenecks: Bottleneck[];
}

export interface Bottleneck {
  operation: string;
  category: string;
  averageDuration: number;
  occurrences: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConnectionHealth {
  isHealthy: boolean;
  averageLatency: number;
  failureRate: number;
  lastCheckTime: number;
  consecutiveFailures: number;
}

class PerformanceTrackerClass {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 5000;
  private isEnabled: boolean = true;
  private connectionHealth: ConnectionHealth = {
    isHealthy: true,
    averageLatency: 0,
    failureRate: 0,
    lastCheckTime: Date.now(),
    consecutiveFailures: 0,
  };

  // Performance thresholds
  private thresholds = {
    query: 500,      // 500ms
    mutation: 1000,  // 1s
    rpc: 750,        // 750ms
    storage: 2000,   // 2s
    auth: 1000,      // 1s
  };

  /**
   * Start tracking a performance metric
   */
  startTracking(name: string, category: PerformanceMetric['category']): () => void {
    if (!this.isEnabled) return () => {};

    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        category,
      });
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    this.trimMetrics();

    // Check if this operation is slow
    const threshold = this.thresholds[metric.category];
    if (metric.duration > threshold) {
      console.warn(`🐌 Slow ${metric.category}: ${metric.name} took ${metric.duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }
  }

  /**
   * Get performance report
   */
  getReport(timeWindowMs?: number): PerformanceReport {
    const now = Date.now();
    const metrics = timeWindowMs
      ? this.metrics.filter(m => now - m.timestamp <= timeWindowMs)
      : this.metrics;

    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        slowestOperations: [],
        operationsByCategory: {},
        bottlenecks: [],
      };
    }

    const sortedByDuration = [...metrics].sort((a, b) => a.duration - b.duration);
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);

    const operationsByCategory = metrics.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bottlenecks = this.identifyBottlenecks(metrics);
    const slowestOperations = [...metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalOperations: metrics.length,
      averageDuration: totalDuration / metrics.length,
      p50: this.getPercentile(sortedByDuration, 50),
      p90: this.getPercentile(sortedByDuration, 90),
      p95: this.getPercentile(sortedByDuration, 95),
      p99: this.getPercentile(sortedByDuration, 99),
      slowestOperations,
      operationsByCategory,
      bottlenecks,
    };
  }

  /**
   * Get slow queries above threshold
   */
  getSlowQueries(thresholdMs?: number): PerformanceMetric[] {
    const threshold = thresholdMs || this.thresholds.query;
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get connection health
   */
  getConnectionHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }

  /**
   * Update connection health
   */
  updateConnectionHealth(success: boolean, latency: number): void {
    const recentMetrics = this.metrics.slice(-100); // Last 100 operations
    const failedCount = recentMetrics.filter(m => m.metadata?.failed).length;
    
    this.connectionHealth = {
      isHealthy: success && this.connectionHealth.consecutiveFailures < 3,
      averageLatency: latency,
      failureRate: recentMetrics.length > 0 ? (failedCount / recentMetrics.length) * 100 : 0,
      lastCheckTime: Date.now(),
      consecutiveFailures: success ? 0 : this.connectionHealth.consecutiveFailures + 1,
    };

    if (!this.connectionHealth.isHealthy) {
      console.error('❌ Connection health degraded:', this.connectionHealth);
    }
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get thresholds
   */
  getThresholds() {
    return { ...this.thresholds };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Print performance summary to console
   */
  printSummary(timeWindowMs?: number): void {
    const report = this.getReport(timeWindowMs);
    
    console.group('⚡ Performance Tracker Summary');
    console.log(`Total Operations: ${report.totalOperations}`);
    console.log(`Average Duration: ${report.averageDuration.toFixed(2)}ms`);
    console.log(`P50: ${report.p50.toFixed(2)}ms`);
    console.log(`P90: ${report.p90.toFixed(2)}ms`);
    console.log(`P95: ${report.p95.toFixed(2)}ms`);
    console.log(`P99: ${report.p99.toFixed(2)}ms`);
    
    console.log('\nOperations by Category:');
    Object.entries(report.operationsByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    if (report.bottlenecks.length > 0) {
      console.warn('\n🚨 Bottlenecks Detected:');
      report.bottlenecks.forEach(b => {
        console.warn(`  [${b.severity.toUpperCase()}] ${b.operation} (${b.category}): ${b.averageDuration.toFixed(2)}ms avg (${b.occurrences} occurrences)`);
      });
    }
    
    if (report.slowestOperations.length > 0) {
      console.log('\n🐌 Slowest Operations:');
      report.slowestOperations.slice(0, 5).forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} (${m.category}): ${m.duration.toFixed(2)}ms`);
      });
    }
    
    const health = this.getConnectionHealth();
    console.log('\n🏥 Connection Health:');
    console.log(`  Status: ${health.isHealthy ? '✅ Healthy' : '❌ Degraded'}`);
    console.log(`  Average Latency: ${health.averageLatency.toFixed(2)}ms`);
    console.log(`  Failure Rate: ${health.failureRate.toFixed(2)}%`);
    
    console.groupEnd();
  }

  /**
   * Get baseline metrics for comparison
   */
  getBaseline(): Record<string, any> {
    const report = this.getReport();
    
    return {
      timestamp: Date.now(),
      totalOperations: report.totalOperations,
      averageDuration: report.averageDuration,
      p50: report.p50,
      p90: report.p90,
      p95: report.p95,
      p99: report.p99,
      bottleneckCount: report.bottlenecks.length,
      slowQueryCount: this.getSlowQueries().length,
      connectionHealth: this.getConnectionHealth(),
    };
  }

  /**
   * Identify bottlenecks
   */
  private identifyBottlenecks(metrics: PerformanceMetric[]): Bottleneck[] {
    const operationMap = new Map<string, { durations: number[]; category: string }>();

    metrics.forEach(m => {
      if (!operationMap.has(m.name)) {
        operationMap.set(m.name, { durations: [], category: m.category });
      }
      operationMap.get(m.name)!.durations.push(m.duration);
    });

    const bottlenecks: Bottleneck[] = [];

    operationMap.forEach((data, operation) => {
      const avgDuration = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      const threshold = this.thresholds[data.category as keyof typeof this.thresholds] || 500;

      if (avgDuration > threshold) {
        const severity = this.calculateSeverity(avgDuration, threshold);
        bottlenecks.push({
          operation,
          category: data.category,
          averageDuration: avgDuration,
          occurrences: data.durations.length,
          severity,
        });
      }
    });

    return bottlenecks.sort((a, b) => b.averageDuration - a.averageDuration);
  }

  /**
   * Calculate bottleneck severity
   */
  private calculateSeverity(duration: number, threshold: number): Bottleneck['severity'] {
    const ratio = duration / threshold;
    if (ratio > 5) return 'critical';
    if (ratio > 3) return 'high';
    if (ratio > 2) return 'medium';
    return 'low';
  }

  /**
   * Get percentile value
   */
  private getPercentile(sortedMetrics: PerformanceMetric[], percentile: number): number {
    if (sortedMetrics.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedMetrics.length) - 1;
    return sortedMetrics[index].duration;
  }

  /**
   * Trim metrics to max size
   */
  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
}

export const PerformanceTracker = new PerformanceTrackerClass();
