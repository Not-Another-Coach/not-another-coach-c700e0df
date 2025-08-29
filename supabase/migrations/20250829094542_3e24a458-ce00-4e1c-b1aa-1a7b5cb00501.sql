-- Phase 1: Add source_activity_id to track relationships between Ways of Working and Activities
ALTER TABLE public.package_ways_of_working 
ADD COLUMN onboarding_activity_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN first_week_activity_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN ongoing_structure_activity_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN tracking_tools_activity_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN client_expectations_activity_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN what_i_bring_activity_ids jsonb DEFAULT '[]'::jsonb;

-- Add source information to activities to track where they came from
ALTER TABLE public.trainer_onboarding_activities 
ADD COLUMN source_type text DEFAULT 'manual',
ADD COLUMN source_package_id text DEFAULT NULL,
ADD COLUMN source_section text DEFAULT NULL;

-- Create index for better performance on source lookups
CREATE INDEX idx_trainer_activities_source ON public.trainer_onboarding_activities(trainer_id, source_type, source_package_id);

-- Add activity usage tracking for templates
CREATE TABLE IF NOT EXISTS public.template_activity_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.onboarding_templates(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.trainer_onboarding_activities(id) ON DELETE CASCADE,
  usage_count integer DEFAULT 1,
  last_used_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(template_id, activity_id)
);

-- Enable RLS on the new table
ALTER TABLE public.template_activity_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for template activity usage
CREATE POLICY "Trainers can manage their template activity usage" 
ON public.template_activity_usage 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.onboarding_templates t 
    WHERE t.id = template_activity_usage.template_id 
    AND t.trainer_id = auth.uid()
  )
);

-- Function to sync ways of working to activities with enhanced tracking
CREATE OR REPLACE FUNCTION public.sync_ways_of_working_to_activities(
  p_trainer_id uuid,
  p_package_id text,
  p_section text,
  p_items jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_activity_ids jsonb := '[]'::jsonb;
  v_item jsonb;
  v_activity_id uuid;
  v_existing_activity_id uuid;
  v_text text;
BEGIN
  -- Only allow the trainer to sync their own data
  IF auth.uid() != p_trainer_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Process each item in the section
  FOR v_item IN SELECT jsonb_array_elements(p_items) LOOP
    v_text := trim(both from v_item->>'text');
    
    IF v_text IS NOT NULL AND v_text <> '' THEN
      -- Check if this activity already exists for this trainer and section
      SELECT id INTO v_existing_activity_id
      FROM public.trainer_onboarding_activities
      WHERE trainer_id = p_trainer_id
        AND activity_name = v_text
        AND source_package_id = p_package_id
        AND source_section = p_section;
      
      IF v_existing_activity_id IS NOT NULL THEN
        -- Activity already exists, just add to the array
        v_activity_ids := v_activity_ids || to_jsonb(v_existing_activity_id);
      ELSE
        -- Create new activity
        INSERT INTO public.trainer_onboarding_activities (
          trainer_id,
          activity_name,
          category,
          source_type,
          source_package_id,
          source_section,
          is_system
        ) VALUES (
          p_trainer_id,
          v_text,
          p_section,
          'ways_of_working',
          p_package_id,
          p_section,
          false
        ) RETURNING id INTO v_activity_id;
        
        -- Add to the array
        v_activity_ids := v_activity_ids || to_jsonb(v_activity_id);
      END IF;
    END IF;
  END LOOP;
  
  RETURN v_activity_ids;
END;
$function$;

-- Function to get activity recommendations for templates based on Ways of Working
CREATE OR REPLACE FUNCTION public.get_activity_recommendations_for_template(
  p_trainer_id uuid,
  p_package_ids text[] DEFAULT NULL
) RETURNS TABLE(
  activity_id uuid,
  activity_name text,
  category text,
  usage_count bigint,
  source_packages text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow trainers to get their own recommendations
  IF auth.uid() != p_trainer_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    a.id as activity_id,
    a.activity_name,
    a.category,
    COALESCE(tau.total_usage, 0) as usage_count,
    COALESCE(
      array_agg(DISTINCT a.source_package_id) FILTER (WHERE a.source_package_id IS NOT NULL),
      '{}'::text[]
    ) as source_packages
  FROM public.trainer_onboarding_activities a
  LEFT JOIN (
    SELECT 
      activity_id,
      SUM(usage_count) as total_usage
    FROM public.template_activity_usage tau2
    JOIN public.onboarding_templates ot ON ot.id = tau2.template_id
    WHERE ot.trainer_id = p_trainer_id
    GROUP BY activity_id
  ) tau ON tau.activity_id = a.id
  WHERE a.trainer_id = p_trainer_id
    AND (p_package_ids IS NULL OR a.source_package_id = ANY(p_package_ids))
  GROUP BY a.id, a.activity_name, a.category, tau.total_usage
  ORDER BY tau.total_usage DESC NULLS LAST, a.activity_name;
END;
$function$;