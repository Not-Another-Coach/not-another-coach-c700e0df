import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchingAlgorithmConfig, DEFAULT_MATCHING_CONFIG } from "@/types/matching";

// Re-export types for backwards compatibility
export type { MatchingAlgorithmConfig, WeightConfig } from "@/types/matching";
export { DEFAULT_MATCHING_CONFIG } from "@/types/matching";

/**
 * Hook to fetch the LIVE matching algorithm configuration.
 * This reads from the versioned matching_algorithm_versions table.
 */
export function useMatchingConfig() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['matching-algorithm-versions', 'live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .select('id, config')
        .eq('status', 'live')
        .maybeSingle();

      if (error) {
        console.error('Error fetching live matching config:', error);
        throw error;
      }

      return data ? {
        versionId: data.id,
        config: data.config as unknown as MatchingAlgorithmConfig
      } : null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    config: data?.config ?? DEFAULT_MATCHING_CONFIG,
    versionId: data?.versionId ?? null,
    isConfigured: !!data,
    isLoading,
    error,
  };
}
