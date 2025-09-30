/**
 * Standard error class for service layer
 */

import { ClassifiedError, ErrorCategory, ErrorSeverity } from '../errors/ErrorClassification';

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }

  static fromError(error: any): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    // Handle ClassifiedError
    if (error instanceof ClassifiedError) {
      return new ServiceError(
        error.metadata.category,
        error.metadata.technicalMessage,
        error.metadata
      );
    }

    // Handle Supabase errors
    if (error?.code) {
      return new ServiceError(
        error.code,
        error.message || 'An error occurred',
        error
      );
    }

    // Handle generic errors
    return new ServiceError(
      'UNKNOWN_ERROR',
      error?.message || 'An unexpected error occurred',
      error
    );
  }

  static notFound(resource: string): ServiceError {
    return new ServiceError(
      'NOT_FOUND',
      `${resource} not found`
    );
  }

  static unauthorized(message = 'Unauthorized'): ServiceError {
    return new ServiceError('UNAUTHORIZED', message);
  }

  static validation(message: string, details?: any): ServiceError {
    return new ServiceError('VALIDATION_ERROR', message, details);
  }

  static database(message: string, details?: any): ServiceError {
    return new ServiceError('DATABASE_ERROR', message, details);
  }

  /**
   * Convert to ClassifiedError for enhanced error handling
   */
  toClassifiedError(): ClassifiedError {
    const category = this.code === 'NOT_FOUND' ? ErrorCategory.NOT_FOUND :
                     this.code === 'UNAUTHORIZED' ? ErrorCategory.AUTHENTICATION :
                     this.code === 'VALIDATION_ERROR' ? ErrorCategory.VALIDATION :
                     this.code === 'DATABASE_ERROR' ? ErrorCategory.DATABASE :
                     ErrorCategory.UNKNOWN;

    const severity = this.code === 'UNAUTHORIZED' ? ErrorSeverity.HIGH :
                     this.code === 'DATABASE_ERROR' ? ErrorSeverity.HIGH :
                     ErrorSeverity.MEDIUM;

    const isRetryable = this.code === 'DATABASE_ERROR';

    return new ClassifiedError(
      this.message,
      category,
      severity,
      isRetryable,
      this.getUserMessage(),
      this.details
    );
  }

  private getUserMessage(): string {
    switch (this.code) {
      case 'NOT_FOUND':
        return 'The requested item could not be found.';
      case 'UNAUTHORIZED':
        return 'You need to be signed in to perform this action.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'DATABASE_ERROR':
        return 'We encountered an issue. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
