/**
 * React Error Boundary Component
 * 
 * Catches and handles React component errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '@/services/errors/ErrorLogger';
import { ErrorCategory, ErrorSeverity, ClassifiedError } from '@/services/errors/ErrorClassification';
import { NotAnotherCoachError } from './NotAnotherCoachError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    const classifiedError = new ClassifiedError(
      error.message,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      false,
      'Something went wrong. Please refresh the page.',
      {
        componentStack: errorInfo.componentStack,
      }
    );

    errorLogger.log(classifiedError);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine if this is an auth error (403)
      const classifiedError = this.state.error instanceof ClassifiedError 
        ? this.state.error 
        : null;
      
      const isAuthError = classifiedError?.metadata.category === ErrorCategory.AUTHENTICATION ||
                         classifiedError?.metadata.category === ErrorCategory.AUTHORIZATION;

      // Check if we're offline
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      // Use branded error page
      if (isAuthError) {
        return (
          <NotAnotherCoachError
            code="403"
            homeHref="/"
            loginHref="/login"
            supportHref="/contact"
          />
        );
      }

      if (isOffline) {
        return (
          <NotAnotherCoachError
            code="offline"
            homeHref="/"
            onRetry={this.handleReset}
          />
        );
      }

      return (
        <NotAnotherCoachError
          code="500"
          homeHref="/"
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
