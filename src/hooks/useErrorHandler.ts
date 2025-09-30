/**
 * Error Hook
 * 
 * React hook for error handling in functional components
 */

import { useCallback } from 'react';
import { ClassifiedError } from '@/services/errors/ErrorClassification';
import { ErrorDisplayService } from '@/services/errors/ErrorDisplay';
import { errorLogger } from '@/services/errors/ErrorLogger';

export function useErrorHandler() {
  const handleError = useCallback((error: Error | ClassifiedError, context?: Record<string, any>) => {
    // Classify error if not already classified
    const classifiedError = error instanceof ClassifiedError
      ? error
      : ClassifiedError.fromSupabaseError(error, context);

    // Log the error
    errorLogger.log(classifiedError, undefined, context);

    // Display error to user
    ErrorDisplayService.showError(classifiedError);

    return classifiedError;
  }, []);

  const handleSuccess = useCallback((title: string, description?: string) => {
    ErrorDisplayService.showSuccess(title, description);
  }, []);

  const handleWarning = useCallback((title: string, description: string) => {
    ErrorDisplayService.showWarning(title, description);
  }, []);

  const handleInfo = useCallback((title: string, description?: string) => {
    ErrorDisplayService.showInfo(title, description);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}
