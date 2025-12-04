import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type StatusVariant = 'success' | 'info' | 'warning' | 'error';

interface StatusMessage {
  message: string;
  variant: StatusVariant;
  isVisible: boolean;
}

export const useStatusFeedback = () => {
  const [status, setStatus] = useState<StatusMessage>({
    message: '',
    variant: 'info',
    isVisible: false,
  });

  const showStatus = useCallback((message: string, variant: StatusVariant = 'info') => {
    setStatus({ message, variant, isVisible: true });
  }, []);

  const hideStatus = useCallback(() => {
    setStatus(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showStatus(message, 'success');
  }, [showStatus]);

  const showError = useCallback((message: string) => {
    showStatus(message, 'error');
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, [showStatus]);

  const showWarning = useCallback((message: string) => {
    showStatus(message, 'warning');
  }, [showStatus]);

  const showInfo = useCallback((message: string) => {
    showStatus(message, 'info');
  }, [showStatus]);

  return {
    status,
    showStatus,
    hideStatus,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
