-- Add profile update tracking table for 3-week streak functionality
CREATE TABLE public.profile_update_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, week_start_date)
);

-- Enable RLS
ALTER TABLE public.profile_update_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Trainers can view their own streak data" 
ON public.profile_update_streaks 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "System can insert streak data" 
ON public.profile_update_streaks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update streak data" 
ON public.profile_update_streaks 
FOR UPDATE 
USING (true);

-- Create function to track profile updates for streak calculation
CREATE OR REPLACE FUNCTION public.track_profile_update()
RETURNS TRIGGER AS $$
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
    ON CONFLICT (trainer_id, week_start_date) 
    DO UPDATE SET updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track profile updates
CREATE TRIGGER track_trainer_profile_updates
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION public.track_profile_update();

-- Create function to get current streak count for a trainer
CREATE OR REPLACE FUNCTION public.get_trainer_streak_count(trainer_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_week_start DATE;
  streak_count INTEGER := 0;
  check_date DATE;
BEGIN
  -- Calculate current week start (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Start checking from current week and go backwards
  check_date := current_week_start;
  
  -- Check for consecutive weeks with updates
  WHILE EXISTS (
    SELECT 1 FROM public.profile_update_streaks 
    WHERE trainer_id = trainer_uuid 
    AND week_start_date = check_date
  ) LOOP
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '7 days';
    
    -- Prevent infinite loop, max check 52 weeks
    IF streak_count >= 52 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;