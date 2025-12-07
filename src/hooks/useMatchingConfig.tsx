import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WeightConfig {
  value: number;
  min: number;
  max: number;
}

export interface MatchingAlgorithmConfig {
  version: number;
  is_active: boolean;
  weights: {
    goals_specialties: WeightConfig;
    location_format: WeightConfig;
    coaching_style: WeightConfig;
    schedule_frequency: WeightConfig;
    budget_fit: WeightConfig;
    experience_level: WeightConfig;
    ideal_client_type: WeightConfig;
    package_alignment: WeightConfig;
    discovery_call: WeightConfig;
  };
  thresholds: {
    min_match_to_show: number;
    top_match_label: number;
    good_match_label: number;
  };
  package_boundaries: {
    single_session: { max_sessions: number; max_weeks: number };
    short_term: { min_sessions: number; max_sessions: number; max_weeks: number };
    ongoing: { min_sessions: number; min_months: number };
  };
  budget: {
    soft_tolerance_percent: number;
    hard_exclusion_percent: number;
  };
  availability: {
    asap: { max_days_full_score: number; max_days_partial: number };
    within_month: { max_days_full_score: number };
  };
  feature_flags: {
    use_ideal_client_bonus: boolean;
    use_discovery_call_penalty: boolean;
    enable_hard_exclusions: boolean;
  };
}

export const DEFAULT_MATCHING_CONFIG: MatchingAlgorithmConfig = {
  version: 1,
  is_active: true,
  weights: {
    goals_specialties: { value: 25, min: 15, max: 35 },
    location_format: { value: 20, min: 10, max: 30 },
    coaching_style: { value: 20, min: 10, max: 30 },
    schedule_frequency: { value: 15, min: 5, max: 25 },
    budget_fit: { value: 5, min: 0, max: 15 },
    experience_level: { value: 5, min: 0, max: 15 },
    ideal_client_type: { value: 5, min: 0, max: 10 },
    package_alignment: { value: 3, min: 0, max: 10 },
    discovery_call: { value: 2, min: 0, max: 5 }
  },
  thresholds: {
    min_match_to_show: 30,
    top_match_label: 75,
    good_match_label: 50
  },
  package_boundaries: {
    single_session: { max_sessions: 2, max_weeks: 2 },
    short_term: { min_sessions: 3, max_sessions: 12, max_weeks: 20 },
    ongoing: { min_sessions: 12, min_months: 3 }
  },
  budget: {
    soft_tolerance_percent: 20,
    hard_exclusion_percent: 40
  },
  availability: {
    asap: { max_days_full_score: 3, max_days_partial: 14 },
    within_month: { max_days_full_score: 30 }
  },
  feature_flags: {
    use_ideal_client_bonus: true,
    use_discovery_call_penalty: true,
    enable_hard_exclusions: true
  }
};

export function useMatchingConfig() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['app-settings', 'matching_algorithm_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'matching_algorithm_config')
        .maybeSingle();

      if (error) {
        console.error('Error fetching matching config:', error);
        throw error;
      }

      // Cast through unknown first to satisfy TypeScript
      return data?.setting_value ? (data.setting_value as unknown as MatchingAlgorithmConfig) : null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (config: MatchingAlgorithmConfig) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from('app_settings')
        .upsert([{
          setting_key: 'matching_algorithm_config',
          setting_value: JSON.parse(JSON.stringify(config))
        }], {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings', 'matching_algorithm_config'] });
      toast.success('Matching configuration saved successfully');
    },
    onError: (error) => {
      console.error('Error saving matching config:', error);
      toast.error('Failed to save matching configuration');
    }
  });

  return {
    config: data ?? null,
    isConfigured: !!data,
    isLoading,
    error,
    saveConfig: saveMutation.mutate,
    isSaving: saveMutation.isPending
  };
}
