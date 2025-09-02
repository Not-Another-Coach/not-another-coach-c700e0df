-- Security Fix: Add proper search_path to all security definer functions
-- This prevents search path manipulation attacks

-- Fix calculate_execution_score function
DROP FUNCTION IF EXISTS public.calculate_execution_score(uuid, date);
CREATE OR REPLACE FUNCTION public.calculate_execution_score(p_trainer_id uuid, p_week_start date)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_weight numeric := 0;
  completed_weight numeric := 0;
  ct_record RECORD;
  score numeric;
BEGIN
  -- Get all critical tasks for the trainer and week
  FOR ct_record IN 
    SELECT weight, status 
    FROM critical_tasks 
    WHERE trainer_id = p_trainer_id 
      AND week_start = p_week_start
  LOOP
    total_weight := total_weight + ct_record.weight;
    
    IF ct_record.status = 'completed' THEN
      completed_weight := completed_weight + ct_record.weight;
    END IF;
  END LOOP;
  
  -- Calculate score (avoid division by zero)
  IF total_weight > 0 THEN
    score := (completed_weight / total_weight) * 100;
  ELSE
    score := 0;
  END IF;
  
  RETURN ROUND(score, 2);
END;
$$;

-- Fix carry_forward_incomplete_cts function
DROP FUNCTION IF EXISTS public.carry_forward_incomplete_cts();
CREATE OR REPLACE FUNCTION public.carry_forward_incomplete_cts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  incomplete_ct RECORD;
  new_week_start date;
BEGIN
  -- Get current week start (Monday)
  new_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  -- Carry forward incomplete critical tasks from previous week
  FOR incomplete_ct IN 
    SELECT * FROM critical_tasks 
    WHERE status != 'completed' 
      AND week_start < new_week_start
      AND NOT EXISTS (
        SELECT 1 FROM critical_tasks ct2 
        WHERE ct2.trainer_id = critical_tasks.trainer_id
          AND ct2.title = critical_tasks.title
          AND ct2.week_start = new_week_start
      )
  LOOP
    INSERT INTO critical_tasks (
      trainer_id, title, description, ct_type, status, weight, 
      due_date, week_start, target_count, current_count
    ) VALUES (
      incomplete_ct.trainer_id, incomplete_ct.title, incomplete_ct.description,
      incomplete_ct.ct_type, 'to_do', incomplete_ct.weight,
      new_week_start + (incomplete_ct.due_date - incomplete_ct.week_start),
      new_week_start, incomplete_ct.target_count, 0
    );
  END LOOP;
END;
$$;

-- Fix get_trainer_streak_count function
DROP FUNCTION IF EXISTS public.get_trainer_streak_count(uuid);
CREATE OR REPLACE FUNCTION public.get_trainer_streak_count(p_trainer_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  streak_count integer := 0;
  current_week date;
  week_found boolean;
BEGIN
  current_week := date_trunc('week', CURRENT_DATE)::date;
  
  -- Count consecutive weeks with profile updates
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM profile_update_streaks 
      WHERE trainer_id = p_trainer_id 
        AND week_start_date = current_week
    ) INTO week_found;
    
    IF NOT week_found THEN
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    current_week := current_week - interval '1 week';
  END LOOP;
  
  RETURN streak_count;
END;
$$;

-- Fix update_execution_score_on_ct_change function  
DROP FUNCTION IF EXISTS public.update_execution_score_on_ct_change();
CREATE OR REPLACE FUNCTION public.update_execution_score_on_ct_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_score numeric;
BEGIN
  -- Calculate and update execution score
  new_score := public.calculate_execution_score(NEW.trainer_id, NEW.week_start);
  
  -- Update or insert execution score
  INSERT INTO trainer_execution_scores (trainer_id, week_start, score)
  VALUES (NEW.trainer_id, NEW.week_start, new_score)
  ON CONFLICT (trainer_id, week_start)
  DO UPDATE SET 
    score = EXCLUDED.score,
    updated_at = now();
    
  RETURN NEW;
END;
$$;