import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryConfig } from '@/lib/queryConfig';

interface UserRole {
  role: 'admin' | 'moderator' | 'user';
}

/**
 * Cached hook for fetching user roles
 * Uses React Query to prevent duplicate API calls
 */
export const useUserRolesData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as UserRole[];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,  // 10 minutes - roles rarely change
    gcTime: 30 * 60 * 1000,      // Keep in cache for 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

/**
 * Helper hook to check if the current user is an admin
 * Uses cached user roles data
 */
export const useIsAdmin = () => {
  const { data: roles, isLoading } = useUserRolesData();
  
  return {
    isAdmin: roles?.some(r => r.role === 'admin') ?? false,
    loading: isLoading
  };
};
