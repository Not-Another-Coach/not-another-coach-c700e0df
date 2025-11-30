import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryConfig } from '@/lib/queryConfig';

export type WaitlistStatus = 'active' | 'contacted' | 'converted' | 'archived';

export interface WaitlistEntry {
  id: string;
  client_id: string;
  coach_id: string;
  status: WaitlistStatus;
  joined_at: string;
  estimated_start_date?: string;
  follow_up_scheduled_date?: string;
  last_contacted_at?: string;
  coach_notes?: string;
  client_goals?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Pure data hook for fetching waitlist entries using React Query
 * Only fetches data - no mutations or business logic
 */
export function useWaitlistEntriesData() {
  const { user } = useAuth();

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['waitlist-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('coach_waitlists')
        .select('*')
        .eq('coach_id', user.id)
        .neq('status', 'converted') // Exclude converted clients from waitlist view
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WaitlistEntry[];
    },
    enabled: !!user?.id,
    staleTime: queryConfig.lists.staleTime,
    gcTime: queryConfig.lists.gcTime,
  });

  return {
    entries,
    loading: isLoading,
    refetch,
  };
}
