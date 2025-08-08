-- Fix the remaining functions that don't have proper search_path settings
-- These are likely older functions that need to be updated

-- Fix update_alerts_updated_at function
CREATE OR REPLACE FUNCTION public.update_alerts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix track_profile_update function (check if it exists and fix it)
CREATE OR REPLACE FUNCTION public.track_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  week_start DATE;
  week_end DATE;
BEGIN
  -- Only track for trainers
  IF NEW.user_type = 'trainer' THEN
    -- Calculate current week (Monday to Sunday)
    week_start := date_trunc('week', CURRENT_DATE)::DATE;
    week_end := week_start + INTERVAL '6 days';
    
    -- Insert or update the streak record for this week
    INSERT INTO public.profile_update_streaks (trainer_id, week_start_date, week_end_date)
    VALUES (NEW.id, week_start, week_end)
    ON CONFLICT (trainer_id, week_start_date) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;