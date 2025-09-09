import React, { createContext, useContext, useEffect, useState } from 'react';
import { VisibilityConfigService, SystemVisibilityConfig } from '@/services/VisibilityConfigService';
import { ContentType, EngagementStageGroup, VisibilityState } from '@/hooks/useVisibilityMatrix';

interface VisibilityConfigContextType {
  getDefaultVisibility: (contentType: ContentType, stageGroup: EngagementStageGroup) => VisibilityState;
  refreshCache: () => Promise<void>;
  isLoading: boolean;
}

const VisibilityConfigContext = createContext<VisibilityConfigContextType | undefined>(undefined);

export const useVisibilityConfig = (): VisibilityConfigContextType => {
  const context = useContext(VisibilityConfigContext);
  if (!context) {
    throw new Error('useVisibilityConfig must be used within a VisibilityConfigProvider');
  }
  return context;
};

export const VisibilityConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Map<string, VisibilityState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const loadDefaults = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading visibility defaults...');
      const defaults = await VisibilityConfigService.getSystemDefaults();
      console.log('📋 Visibility defaults loaded:', Array.from(defaults.entries()));
      setCache(new Map(defaults));
    } catch (error) {
      console.error('Failed to load visibility defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaults();
  }, []);

  const getDefaultVisibility = (contentType: ContentType, stageGroup: EngagementStageGroup): VisibilityState => {
    const key = `${contentType}_${stageGroup}`;
    const result = cache.get(key) || 'hidden';
    console.log(`🔍 Getting default visibility for ${key}:`, result);
    return result;
  };

  const refreshCache = async () => {
    console.log('🔄 Refreshing visibility cache...');
    await VisibilityConfigService.refreshCache();
    await loadDefaults();
  };

  const value = {
    getDefaultVisibility,
    refreshCache,
    isLoading,
  };

  return (
    <VisibilityConfigContext.Provider value={value}>
      {children}
    </VisibilityConfigContext.Provider>
  );
};