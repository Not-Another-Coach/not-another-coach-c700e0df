import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DataLoadingState {
  trainersLoaded: boolean;
  engagementLoaded: boolean;
  allDataReady: boolean;
  isRefreshing: boolean;
}

/**
 * Hook to synchronize data loading and provide real-time updates
 * Fixes timing issues between trainer profiles and engagement data
 */
export function useDataSynchronization() {
  const { user } = useAuth();
  const refreshTimeout = useRef<NodeJS.Timeout>();
  const [loadingState, setLoadingState] = useState<DataLoadingState>({
    trainersLoaded: false,
    engagementLoaded: false,
    allDataReady: false,
    isRefreshing: false
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Mark trainers as loaded
  const markTrainersLoaded = useCallback(() => {
    console.log('🎯 Trainers data loaded');
    setLoadingState(prev => ({
      ...prev,
      trainersLoaded: true,
      allDataReady: prev.engagementLoaded
    }));
  }, []);

  // Mark engagement as loaded
  const markEngagementLoaded = useCallback(() => {
    console.log('🎯 Engagement data loaded');
    setLoadingState(prev => ({
      ...prev,
      engagementLoaded: true,
      allDataReady: prev.trainersLoaded
    }));
  }, []);

  // Force refresh all data
  const refreshData = useCallback(() => {
    console.log('🔄 Forcing data refresh');
    setLoadingState({
      trainersLoaded: false,
      engagementLoaded: false,
      allDataReady: false,
      isRefreshing: true
    });
    setRefreshTrigger(prev => prev + 1);
    
    // Reset refreshing state after a delay
    setTimeout(() => {
      setLoadingState(prev => ({ ...prev, isRefreshing: false }));
    }, 1000);
  }, []);

  // Set up real-time subscriptions for engagement changes (OPTIMIZED)
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Setting up real-time subscriptions for user:', user.id);

    // Combined channel for better performance
    const dataChangesChannel = supabase
      .channel(`data-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_trainer_engagement',
          filter: `client_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time engagement update:', payload);
          // Longer debounce to batch updates
          clearTimeout(refreshTimeout.current);
          refreshTimeout.current = setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
          }, 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',  // Only listen to new calls, not all changes
          schema: 'public',
          table: 'discovery_calls',
          filter: `client_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time discovery call created:', payload);
          clearTimeout(refreshTimeout.current);
          refreshTimeout.current = setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions');
      clearTimeout(refreshTimeout.current);
      supabase.removeChannel(dataChangesChannel);
    };
  }, [user?.id]);

  // Listen for manual refresh events from dashboard
  useEffect(() => {
    const handleDashboardRefresh = () => {
      console.log('🔄 Dashboard triggered refresh');
      refreshData();
    };

    window.addEventListener('refreshMyTrainersData', handleDashboardRefresh);
    return () => {
      window.removeEventListener('refreshMyTrainersData', handleDashboardRefresh);
    };
  }, [refreshData]);

  return {
    loadingState,
    markTrainersLoaded,
    markEngagementLoaded,
    refreshData,
    refreshTrigger,
    // Computed states for easy consumption
    isDataReady: loadingState.allDataReady,
    isLoading: !loadingState.allDataReady && !loadingState.isRefreshing,
    isRefreshing: loadingState.isRefreshing
  };
}