/**
 * Error Logging Service
 * 
 * Centralized error logging with context and severity tracking
 */

import { ClassifiedError, ErrorCategory, ErrorSeverity } from './ErrorClassification';

interface LogEntry {
  id: string;
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  technicalMessage: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log an error with full context
   */
  log(error: ClassifiedError | Error, userId?: string, additionalContext?: Record<string, any>) {
    const isClassified = error instanceof ClassifiedError;
    
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category: isClassified ? error.metadata.category : ErrorCategory.UNKNOWN,
      severity: isClassified ? error.metadata.severity : ErrorSeverity.MEDIUM,
      message: isClassified ? error.metadata.userMessage : error.message,
      technicalMessage: error.message,
      context: isClassified 
        ? { ...error.metadata.context, ...additionalContext }
        : additionalContext,
      userId,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      stackTrace: error.stack,
    };

    // Add to in-memory logs
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(entry);
    }

    // Send to external logging service if configured
    this.sendToExternalLogger(entry);
  }

  /**
   * Console logging with formatting
   */
  private consoleLog(entry: LogEntry) {
    const prefix = `[${entry.severity.toUpperCase()}] ${entry.category}:`;
    const style = this.getConsoleStyle(entry.severity);
    
    console.group(`%c${prefix}`, style);
    console.log('Message:', entry.message);
    console.log('Technical:', entry.technicalMessage);
    if (entry.context) {
      console.log('Context:', entry.context);
    }
    if (entry.stackTrace) {
      console.log('Stack:', entry.stackTrace);
    }
    console.groupEnd();
  }

  private getConsoleStyle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'color: #3b82f6; font-weight: bold;';
      case ErrorSeverity.MEDIUM:
        return 'color: #f59e0b; font-weight: bold;';
      case ErrorSeverity.HIGH:
        return 'color: #ef4444; font-weight: bold;';
      case ErrorSeverity.CRITICAL:
        return 'color: #dc2626; font-weight: bold; background: #fee2e2;';
      default:
        return 'color: #6b7280; font-weight: bold;';
    }
  }

  /**
   * Send logs to external logging service (placeholder)
   */
  private async sendToExternalLogger(entry: LogEntry) {
    // Only send critical errors and high severity errors in production
    if (
      process.env.NODE_ENV === 'production' &&
      (entry.severity === ErrorSeverity.CRITICAL || entry.severity === ErrorSeverity.HIGH)
    ) {
      // TODO: Integrate with external logging service (e.g., Sentry, LogRocket)
      // Example:
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   body: JSON.stringify(entry),
      // });
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 20): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): LogEntry[] {
    return this.logs.filter(log => log.severity === severity);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: ErrorCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();
