/**
 * Error Classification System
 * 
 * Categorizes errors by type and provides metadata for handling
 */

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorMetadata {
  category: ErrorCategory;
  severity: ErrorSeverity;
  isRetryable: boolean;
  userMessage: string;
  technicalMessage: string;
  statusCode?: number;
  timestamp: string;
  context?: Record<string, any>;
}

export class ClassifiedError extends Error {
  public readonly metadata: ErrorMetadata;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    isRetryable: boolean,
    userMessage: string,
    context?: Record<string, any>,
    statusCode?: number
  ) {
    super(message);
    this.name = 'ClassifiedError';
    
    this.metadata = {
      category,
      severity,
      isRetryable,
      userMessage,
      technicalMessage: message,
      statusCode,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  static fromSupabaseError(error: any, context?: Record<string, any>): ClassifiedError {
    const code = error?.code || error?.status;
    
    // Supabase error codes mapping
    switch (code) {
      case 'PGRST301':
      case '23503':
        return new ClassifiedError(
          error.message,
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          false,
          'The requested operation failed validation. Please check your input.',
          context,
          400
        );
      
      case 'PGRST116':
      case '404':
        return new ClassifiedError(
          error.message,
          ErrorCategory.NOT_FOUND,
          ErrorSeverity.LOW,
          false,
          'The requested resource was not found.',
          context,
          404
        );
      
      case '401':
      case 'invalid_grant':
        return new ClassifiedError(
          error.message,
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.HIGH,
          false,
          'Your session has expired. Please sign in again.',
          context,
          401
        );
      
      case '403':
        return new ClassifiedError(
          error.message,
          ErrorCategory.AUTHORIZATION,
          ErrorSeverity.MEDIUM,
          false,
          'You do not have permission to perform this action.',
          context,
          403
        );
      
      case '23505':
        return new ClassifiedError(
          error.message,
          ErrorCategory.CONFLICT,
          ErrorSeverity.MEDIUM,
          false,
          'A record with this information already exists.',
          context,
          409
        );
      
      case '429':
        return new ClassifiedError(
          error.message,
          ErrorCategory.RATE_LIMIT,
          ErrorSeverity.MEDIUM,
          true,
          'Too many requests. Please try again in a moment.',
          context,
          429
        );
      
      case '500':
      case '502':
      case '503':
        return new ClassifiedError(
          error.message,
          ErrorCategory.SERVER_ERROR,
          ErrorSeverity.HIGH,
          true,
          'We encountered a server issue. Please try again.',
          context,
          code
        );
      
      default:
        return new ClassifiedError(
          error.message || 'An unknown error occurred',
          ErrorCategory.UNKNOWN,
          ErrorSeverity.MEDIUM,
          true,
          'Something went wrong. Please try again.',
          context
        );
    }
  }

  static fromNetworkError(error: any, context?: Record<string, any>): ClassifiedError {
    return new ClassifiedError(
      error.message || 'Network error',
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      true,
      'Unable to connect. Please check your internet connection.',
      context
    );
  }
}
