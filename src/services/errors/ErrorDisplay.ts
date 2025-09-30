/**
 * Error Display Service
 * 
 * Handles user-facing error messages and toast notifications
 */

import { toast } from '@/hooks/use-toast';
import { ClassifiedError, ErrorSeverity } from './ErrorClassification';
import { errorLogger } from './ErrorLogger';

export class ErrorDisplayService {
  /**
   * Display error to user via toast notification
   */
  static showError(error: ClassifiedError | Error, userId?: string) {
    // Log the error
    errorLogger.log(error, userId);

    // Get user-friendly message
    const message = error instanceof ClassifiedError
      ? error.metadata.userMessage
      : 'An unexpected error occurred. Please try again.';

    // Determine toast variant based on severity
    const variant = this.getToastVariant(error);

    // Show toast
    toast({
      title: this.getErrorTitle(error),
      description: message,
      variant,
    });
  }

  /**
   * Display success message
   */
  static showSuccess(title: string, description?: string) {
    toast({
      title,
      description,
      variant: 'default',
    });
  }

  /**
   * Display info message
   */
  static showInfo(title: string, description?: string) {
    toast({
      title,
      description,
      variant: 'default',
    });
  }

  /**
   * Display warning message
   */
  static showWarning(title: string, description: string) {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }

  /**
   * Get error title based on error type
   */
  private static getErrorTitle(error: ClassifiedError | Error): string {
    if (!(error instanceof ClassifiedError)) {
      return 'Error';
    }

    switch (error.metadata.category) {
      case 'authentication':
        return 'Authentication Error';
      case 'authorization':
        return 'Permission Denied';
      case 'validation':
        return 'Validation Error';
      case 'not_found':
        return 'Not Found';
      case 'network':
        return 'Connection Error';
      case 'rate_limit':
        return 'Too Many Requests';
      case 'server_error':
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  /**
   * Get toast variant based on error severity
   */
  private static getToastVariant(error: ClassifiedError | Error): 'default' | 'destructive' {
    if (!(error instanceof ClassifiedError)) {
      return 'destructive';
    }

    switch (error.metadata.severity) {
      case ErrorSeverity.LOW:
        return 'default';
      case ErrorSeverity.MEDIUM:
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'destructive';
    }
  }

  /**
   * Format validation errors for display
   */
  static formatValidationErrors(errors: Record<string, string[]>): string {
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
  }
}
