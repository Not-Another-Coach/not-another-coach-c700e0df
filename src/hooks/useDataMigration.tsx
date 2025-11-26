import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

// Simplified migration hook - anonymous sessions removed
// This hook now only tracks migration state for potential future use
export function useDataMigration() {
  const { user } = useAuth();
  
  const [migrationState, setMigrationState] = useState<'idle' | 'completed'>('idle');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationMessage, setMigrationMessage] = useState('');
  
  // Legacy compatibility
  const isMigrating = false;
  const migrationCompleted = migrationState === 'completed';

  const migrateAnonymousData = useCallback(async () => {
    // No-op function for backward compatibility
    console.log('Anonymous session migration is no longer available');
    setMigrationState('completed');
    setMigrationProgress(100);
  }, []);

  // Reset migration state when user changes
  useEffect(() => {
    if (!user) {
      setMigrationState('idle');
      setMigrationProgress(0);
      setMigrationMessage('');
    } else {
      // Auto-complete for authenticated users
      setMigrationState('completed');
      setMigrationProgress(100);
    }
  }, [user]);

  return {
    migrateAnonymousData,
    isMigrating,
    migrationCompleted,
    migrationState,
    migrationProgress,
    migrationMessage,
  };
}
