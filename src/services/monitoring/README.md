# Monitoring Services

This directory contains monitoring and performance tracking utilities for the service layer.

## RequestLogger

Tracks all service layer requests, responses, and errors.

### Usage

```typescript
import { RequestLogger } from '@/services/monitoring';

// Get request metrics
const metrics = RequestLogger.getMetrics();
console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(1)}%`);

// Get slow queries
const slowQueries = RequestLogger.getSlowQueries(1000); // Over 1 second
console.log(`Found ${slowQueries.length} slow queries`);

// Print summary
RequestLogger.printSummary();

// Export logs for analysis
const logsJSON = RequestLogger.exportLogs();
```

### Features

- Automatic request/response tracking
- Error logging with context
- Performance metrics (avg, p50, p90, p95, p99)
- Slow query detection
- Request filtering by service, method, duration
- Sensitive data sanitization
- Log export for external analysis

## PerformanceTracker

Tracks query performance, identifies bottlenecks, and monitors connection health.

### Usage

```typescript
import { PerformanceTracker } from '@/services/monitoring';

// Manual tracking
const stopTracking = PerformanceTracker.startTracking('getUserProfile', 'query');
// ... perform operation
stopTracking();

// Get performance report
const report = PerformanceTracker.getReport();
console.log(`Average Duration: ${report.averageDuration.toFixed(2)}ms`);
console.log(`P95: ${report.p95.toFixed(2)}ms`);

// Get slow queries
const slowQueries = PerformanceTracker.getSlowQueries(500); // Over 500ms

// Check connection health
const health = PerformanceTracker.getConnectionHealth();
console.log(`Connection: ${health.isHealthy ? 'Healthy' : 'Degraded'}`);

// Print summary
PerformanceTracker.printSummary();

// Get baseline for comparison
const baseline = PerformanceTracker.getBaseline();
```

### Features

- Performance metric collection
- Percentile calculations (P50, P90, P95, P99)
- Bottleneck detection with severity levels
- Connection health monitoring
- Configurable thresholds per operation type
- Performance baselines for comparison

## Integration with BaseService

Both monitoring tools are automatically integrated into `BaseService`:

```typescript
// All service methods automatically:
// 1. Log requests to RequestLogger
// 2. Track performance with PerformanceTracker
// 3. Report slow queries
// 4. Update connection health

// Example:
const result = await ProfileService.getCurrentUserProfile();
// Automatically logged and tracked!
```

## Console Commands

You can access monitoring data from the browser console:

```javascript
// Import in console
import { RequestLogger, PerformanceTracker } from '@/services/monitoring';

// View summaries
RequestLogger.printSummary();
PerformanceTracker.printSummary();

// Get detailed metrics
const metrics = RequestLogger.getMetrics();
const report = PerformanceTracker.getReport();

// Export data
const logs = RequestLogger.exportLogs();
const perfData = PerformanceTracker.exportMetrics();
```

## Performance Thresholds

Default thresholds for operation types:

- **Query**: 500ms
- **Mutation**: 1000ms
- **RPC**: 750ms
- **Storage**: 2000ms
- **Auth**: 1000ms

Operations exceeding these thresholds are flagged as slow queries.

## Customization

```typescript
// Adjust thresholds
PerformanceTracker.setThresholds({
  query: 300,  // More strict
  mutation: 1500,
});

// Adjust max logs kept
RequestLogger.setMaxLogs(5000);

// Disable tracking in production
if (import.meta.env.PROD) {
  RequestLogger.setEnabled(false);
  PerformanceTracker.setEnabled(false);
}
```

## Best Practices

1. **Monitor during development** - Use summaries to catch performance regressions early
2. **Set appropriate thresholds** - Adjust based on your app's requirements
3. **Export for analysis** - Use exported data for detailed performance analysis
4. **Track baselines** - Establish baselines before and after optimizations
5. **Check connection health** - Monitor for degraded connections
6. **Review bottlenecks regularly** - Address high-severity bottlenecks first
7. **Use with Service Migrator** - Track performance improvements during migration
