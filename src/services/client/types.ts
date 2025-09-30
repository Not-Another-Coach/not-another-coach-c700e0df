/**
 * Client Types
 */

import type { BaseProfile } from '../profile/types';

export type ClientJourneyStage = 
  | 'discovering'
  | 'exploring_options'
  | 'narrowed_down'
  | 'ready_to_commit'
  | 'engaged';

export type FitnessGoal = 
  | 'weight_loss'
  | 'muscle_gain'
  | 'general_fitness'
  | 'athletic_performance'
  | 'rehabilitation'
  | 'flexibility'
  | 'endurance';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type PackagePreference = 'ongoing_support' | 'short_term_plan' | 'single_sessions';

export interface ClientProfile extends BaseProfile {
  primary_goal?: FitnessGoal;
  secondary_goals?: string[];
  experience_level?: ExperienceLevel;
  package_preference?: PackagePreference;
  coaching_style_preferences?: string[];
  personality_type?: string[];
  motivation_factors?: string[];
  journey_stage: ClientJourneyStage;
  journey_stage_updated_at?: string;
  survey_completed: boolean;
  survey_completed_at?: string;
  saved_trainers: string[];
  shortlisted_trainers: string[];
}

export interface ClientSurveyData {
  primary_goal?: FitnessGoal;
  secondary_goals?: string[];
  experience_level?: ExperienceLevel;
  package_preference?: PackagePreference;
  coaching_style_preferences?: string[];
  personality_type?: string[];
  motivation_factors?: string[];
}

export interface ClientProfileUpdate {
  primary_goal?: FitnessGoal;
  secondary_goals?: string[];
  experience_level?: ExperienceLevel;
  package_preference?: PackagePreference;
  coaching_style_preferences?: string[];
  personality_type?: string[];
  motivation_factors?: string[];
}

export interface SavedTrainer {
  trainer_id: string;
  saved_at: string;
  notes?: string;
}

export interface ShortlistedTrainer {
  trainer_id: string;
  shortlisted_at: string;
  priority?: number;
  notes?: string;
}

export interface ClientJourneyUpdate {
  stage: ClientJourneyStage;
  metadata?: Record<string, any>;
}
