-- Add progress tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN journey_stage TEXT DEFAULT 'profile_setup',
ADD COLUMN journey_progress JSONB DEFAULT '{}'::jsonb,
ADD COLUMN onboarding_step INTEGER DEFAULT 1,
ADD COLUMN total_onboarding_steps INTEGER DEFAULT 5;

-- Create user_journey_tracking table for detailed progress
CREATE TABLE public.user_journey_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  step_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Index for better performance
  UNIQUE(user_id, stage, step_name)
);

-- Enable Row Level Security
ALTER TABLE public.user_journey_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user_journey_tracking
CREATE POLICY "Users can view their own journey tracking" 
ON public.user_journey_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journey tracking" 
ON public.user_journey_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey tracking" 
ON public.user_journey_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_journey_tracking_user_id ON public.user_journey_tracking(user_id);
CREATE INDEX idx_user_journey_tracking_stage ON public.user_journey_tracking(stage);

-- Update existing users to have proper journey stage
UPDATE public.profiles 
SET journey_stage = CASE 
  WHEN quiz_completed = true THEN 'discovery'
  WHEN first_name IS NOT NULL THEN 'onboarding'
  ELSE 'profile_setup'
END;