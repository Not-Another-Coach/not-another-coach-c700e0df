import { createContext, useContext, ReactNode } from 'react';
import { useStatusFeedback } from '@/hooks/useStatusFeedback';
import type { StatusVariant } from '@/hooks/useStatusFeedback';

interface StatusFeedbackContextType {
  showStatus: (message: string, variant?: StatusVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideStatus: () => void;
  status: {
    message: string;
    variant: StatusVariant;
    isVisible: boolean;
  };
}

const StatusFeedbackContext = createContext<StatusFeedbackContextType | undefined>(undefined);

export function StatusFeedbackProvider({ children }: { children: ReactNode }) {
  const statusFeedback = useStatusFeedback();

  return (
    <StatusFeedbackContext.Provider value={statusFeedback}>
      {children}
    </StatusFeedbackContext.Provider>
  );
}

export function useStatusFeedbackContext() {
  const context = useContext(StatusFeedbackContext);
  if (!context) {
    throw new Error('useStatusFeedbackContext must be used within StatusFeedbackProvider');
  }
  return context;
}
