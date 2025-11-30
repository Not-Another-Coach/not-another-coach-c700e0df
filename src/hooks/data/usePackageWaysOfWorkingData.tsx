import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryConfig } from '@/lib/queryConfig';

export interface PackageWaysOfWorking {
  id: string;
  trainer_id: string;
  package_id: string;
  package_name: string;
  onboarding_items: Array<{ id: string; text: string }>;
  first_week_items: Array<{ id: string; text: string }>;
  ongoing_structure_items: Array<{ id: string; text: string }>;
  tracking_tools_items: Array<{ id: string; text: string }>;
  client_expectations_items: Array<{ id: string; text: string }>;
  what_i_bring_items: Array<{ id: string; text: string }>;
  visibility: 'public' | 'post_match';
  created_at: string;
  updated_at: string;
  onboarding_activity_ids: any;
  first_week_activity_ids: any;
  ongoing_structure_activity_ids: any;
  tracking_tools_activity_ids: any;
  client_expectations_activity_ids: any;
  what_i_bring_activity_ids: any;
}

export const usePackageWaysOfWorkingData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['package-ways-of-working', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('package_ways_of_working')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        onboarding_items: (item.onboarding_items as any) || [],
        first_week_items: (item.first_week_items as any) || [],
        ongoing_structure_items: (item.ongoing_structure_items as any) || [],
        tracking_tools_items: (item.tracking_tools_items as any) || [],
        client_expectations_items: (item.client_expectations_items as any) || [],
        what_i_bring_items: (item.what_i_bring_items as any) || [],
        visibility: (item.visibility as 'public' | 'post_match') || 'public'
      })) as PackageWaysOfWorking[];
    },
    enabled: !!user?.id,
    staleTime: queryConfig.availability.staleTime,
    gcTime: queryConfig.availability.gcTime,
  });
};
