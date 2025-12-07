-- Create matching_algorithm_versions table
CREATE TABLE public.matching_algorithm_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default',
  version_number INTEGER NOT NULL,
  config JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'live', 'archived')),
  CONSTRAINT unique_version_number UNIQUE (version_number)
);

-- Ensure only ONE live version at a time
CREATE UNIQUE INDEX idx_matching_versions_only_one_live 
  ON public.matching_algorithm_versions (status) 
  WHERE status = 'live';

-- Index for quick lookups
CREATE INDEX idx_matching_versions_status ON public.matching_algorithm_versions (status);

-- Enable RLS
ALTER TABLE public.matching_algorithm_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can read all versions
CREATE POLICY "Admins can read all matching versions"
  ON public.matching_algorithm_versions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert new versions (drafts only enforced by trigger)
CREATE POLICY "Admins can insert matching versions"
  ON public.matching_algorithm_versions
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND status = 'draft');

-- Admins can only update draft versions
CREATE POLICY "Admins can update draft matching versions"
  ON public.matching_algorithm_versions
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role) AND status = 'draft')
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can only delete draft versions
CREATE POLICY "Admins can delete draft matching versions"
  ON public.matching_algorithm_versions
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role) AND status = 'draft');

-- Service role can read live version (for matching engine)
CREATE POLICY "Service role can read live matching version"
  ON public.matching_algorithm_versions
  FOR SELECT
  USING (status = 'live');

-- Trigger function to archive previous live version when publishing
CREATE OR REPLACE FUNCTION public.archive_previous_live_matching_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When a version is being set to 'live'
  IF NEW.status = 'live' AND (OLD.status IS NULL OR OLD.status != 'live') THEN
    -- Archive any existing live version
    UPDATE public.matching_algorithm_versions
    SET status = 'archived',
        archived_at = now()
    WHERE status = 'live' AND id != NEW.id;
    
    -- Set published timestamp
    NEW.published_at := now();
    NEW.published_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_archive_previous_live_matching_version
  BEFORE UPDATE ON public.matching_algorithm_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_previous_live_matching_version();

-- Migrate existing config from app_settings as v1 (live)
INSERT INTO public.matching_algorithm_versions (
  name,
  version_number,
  config,
  status,
  created_at,
  published_at,
  notes
)
SELECT 
  'Default',
  1,
  COALESCE(setting_value, '{
    "version": 1,
    "is_active": true,
    "weights": {
      "goals_specialties": {"value": 25, "min": 15, "max": 35},
      "location_format": {"value": 20, "min": 10, "max": 30},
      "coaching_style": {"value": 20, "min": 10, "max": 30},
      "schedule_frequency": {"value": 15, "min": 5, "max": 25},
      "budget_fit": {"value": 5, "min": 0, "max": 15},
      "experience_level": {"value": 5, "min": 0, "max": 15},
      "ideal_client_type": {"value": 5, "min": 0, "max": 10},
      "package_alignment": {"value": 3, "min": 0, "max": 10},
      "discovery_call": {"value": 2, "min": 0, "max": 5}
    },
    "thresholds": {
      "min_match_to_show": 30,
      "top_match_label": 75,
      "good_match_label": 50
    },
    "package_boundaries": {
      "single_session": {"max_sessions": 2, "max_weeks": 2},
      "short_term": {"min_sessions": 3, "max_sessions": 12, "max_weeks": 20},
      "ongoing": {"min_sessions": 12, "min_months": 3}
    },
    "budget": {
      "soft_tolerance_percent": 20,
      "hard_exclusion_percent": 40
    },
    "availability": {
      "asap": {"max_days_full_score": 3, "max_days_partial": 14},
      "within_month": {"max_days_full_score": 30}
    },
    "feature_flags": {
      "use_ideal_client_bonus": true,
      "use_discovery_call_penalty": true,
      "enable_hard_exclusions": true
    }
  }'::jsonb),
  'live',
  COALESCE(created_at, now()),
  now(),
  'Migrated from app_settings'
FROM public.app_settings
WHERE setting_key = 'matching_algorithm_config'
LIMIT 1;

-- If no existing config, insert default as v1
INSERT INTO public.matching_algorithm_versions (
  name,
  version_number,
  config,
  status,
  published_at,
  notes
)
SELECT 
  'Default',
  1,
  '{
    "version": 1,
    "is_active": true,
    "weights": {
      "goals_specialties": {"value": 25, "min": 15, "max": 35},
      "location_format": {"value": 20, "min": 10, "max": 30},
      "coaching_style": {"value": 20, "min": 10, "max": 30},
      "schedule_frequency": {"value": 15, "min": 5, "max": 25},
      "budget_fit": {"value": 5, "min": 0, "max": 15},
      "experience_level": {"value": 5, "min": 0, "max": 15},
      "ideal_client_type": {"value": 5, "min": 0, "max": 10},
      "package_alignment": {"value": 3, "min": 0, "max": 10},
      "discovery_call": {"value": 2, "min": 0, "max": 5}
    },
    "thresholds": {
      "min_match_to_show": 30,
      "top_match_label": 75,
      "good_match_label": 50
    },
    "package_boundaries": {
      "single_session": {"max_sessions": 2, "max_weeks": 2},
      "short_term": {"min_sessions": 3, "max_sessions": 12, "max_weeks": 20},
      "ongoing": {"min_sessions": 12, "min_months": 3}
    },
    "budget": {
      "soft_tolerance_percent": 20,
      "hard_exclusion_percent": 40
    },
    "availability": {
      "asap": {"max_days_full_score": 3, "max_days_partial": 14},
      "within_month": {"max_days_full_score": 30}
    },
    "feature_flags": {
      "use_ideal_client_bonus": true,
      "use_discovery_call_penalty": true,
      "enable_hard_exclusions": true
    }
  }'::jsonb,
  'live',
  now(),
  'Initial default configuration'
WHERE NOT EXISTS (
  SELECT 1 FROM public.matching_algorithm_versions WHERE version_number = 1
);