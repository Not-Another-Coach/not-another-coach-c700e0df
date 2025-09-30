# Error Handling System Documentation

## Overview

The error handling system provides comprehensive error management across the application with classification, logging, user-friendly messaging, automatic retry, and React error boundaries.

## Components

### 1. Error Classification (`ErrorClassification.ts`)

Categorizes errors by type and severity:

```typescript
import { ClassifiedError, ErrorCategory, ErrorSeverity } from '@/services/errors';

// Classify a Supabase error
const error = ClassifiedError.fromSupabaseError(supabaseError, { userId: '123' });

// Classify a network error
const networkError = ClassifiedError.fromNetworkError(fetchError);

// Access error metadata
console.log(error.metadata.category); // 'database', 'authentication', etc.
console.log(error.metadata.severity); // 'low', 'medium', 'high', 'critical'
console.log(error.metadata.isRetryable); // boolean
console.log(error.metadata.userMessage); // User-friendly message
```

### 2. Error Logging (`ErrorLogger.ts`)

Centralized logging with context:

```typescript
import { errorLogger } from '@/services/errors';

// Log an error
errorLogger.log(error, userId, { operation: 'fetchProfile' });

// Get recent logs
const logs = errorLogger.getRecentLogs(20);

// Filter logs
const criticalLogs = errorLogger.getLogsBySeverity(ErrorSeverity.CRITICAL);
const authLogs = errorLogger.getLogsByCategory(ErrorCategory.AUTHENTICATION);

// Export logs
const json = errorLogger.exportLogs();
```

### 3. Error Display (`ErrorDisplay.ts`)

User-facing error messages:

```typescript
import { ErrorDisplayService } from '@/services/errors';

// Show error to user
ErrorDisplayService.showError(error, userId);

// Show success message
ErrorDisplayService.showSuccess('Profile saved', 'Your changes have been saved.');

// Show warning
ErrorDisplayService.showWarning('Unsaved changes', 'You have unsaved changes.');

// Show info
ErrorDisplayService.showInfo('Tip', 'Complete your profile to get better matches.');
```

### 4. Retry Mechanism (`RetryMechanism.ts`)

Automatic retry with backoff:

```typescript
import { withRetry, createRetryWrapper } from '@/services/errors';

// Retry a specific operation
const data = await withRetry(
  () => fetchData(),
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}`, error);
    }
  }
);

// Create a retry wrapper for a function
const fetchWithRetry = createRetryWrapper(fetchData, { maxAttempts: 3 });
const data = await fetchWithRetry();
```

### 5. React Error Boundary (`ErrorBoundary.tsx`)

Catch React component errors:

```typescript
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

// Wrap components
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <FeatureComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, info) => console.log(error)}>
  <FeatureComponent />
</ErrorBoundary>
```

### 6. Error Hook (`useErrorHandler.ts`)

React hook for error handling:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleSuccess, handleWarning, handleInfo } = useErrorHandler();

  const saveProfile = async () => {
    try {
      await ProfileService.updateProfile(data);
      handleSuccess('Profile saved');
    } catch (error) {
      handleError(error, { operation: 'saveProfile' });
    }
  };

  return <button onClick={saveProfile}>Save</button>;
}
```

## Integration with Services

The error handling system is integrated into the BaseService class:

```typescript
import { BaseService } from '@/services/base';

class MyService extends BaseService {
  static async getData() {
    // executeQuery automatically handles errors
    return this.executeQuery(async () => {
      return this.db.from('table').select().single();
    });
  }
}
```

## Best Practices

1. **Always classify errors** - Use `ClassifiedError.fromSupabaseError()` for Supabase errors
2. **Provide context** - Include relevant context when logging errors
3. **Use appropriate severity** - Set correct severity levels for proper prioritization
4. **Retry transient failures** - Use `withRetry` for operations that may fail temporarily
5. **Wrap components** - Use ErrorBoundary for React components
6. **User-friendly messages** - Always provide clear, actionable messages to users
7. **Log important errors** - Log errors with sufficient context for debugging

## Error Categories

- `AUTHENTICATION` - Sign in, sign up, session errors
- `AUTHORIZATION` - Permission and access errors
- `VALIDATION` - Input validation errors
- `DATABASE` - Database query errors
- `NETWORK` - Network connectivity errors
- `NOT_FOUND` - Resource not found errors
- `CONFLICT` - Data conflicts (e.g., duplicate entries)
- `RATE_LIMIT` - Too many requests
- `SERVER_ERROR` - Internal server errors
- `UNKNOWN` - Unclassified errors

## Error Severity Levels

- `LOW` - Minor issues that don't block functionality
- `MEDIUM` - Issues that impact user experience
- `HIGH` - Serious issues that prevent operations
- `CRITICAL` - Critical failures requiring immediate attention
