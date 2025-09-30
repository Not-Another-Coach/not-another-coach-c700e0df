/**
 * Standard error class for service layer
 */

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
}
