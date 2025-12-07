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
    minimum_baseline_score: number;
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
    enable_hard_exclusions: boolean;
  };
}

export type MatchingVersionStatus = 'draft' | 'live' | 'archived';

export interface MatchingVersion {
  id: string;
  name: string;
  version_number: number;
  config: MatchingAlgorithmConfig;
  status: MatchingVersionStatus;
  created_at: string;
  created_by: string | null;
  published_at: string | null;
  published_by: string | null;
  archived_at: string | null;
  notes: string | null;
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
    good_match_label: 50,
    minimum_baseline_score: 45
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
    enable_hard_exclusions: true
  }
};
