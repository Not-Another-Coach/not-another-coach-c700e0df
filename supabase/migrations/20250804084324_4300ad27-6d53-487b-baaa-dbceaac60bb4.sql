-- Create shortlisted_trainers table
CREATE TABLE public.shortlisted_trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trainer_id TEXT NOT NULL,
  shortlisted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  chat_enabled BOOLEAN NOT NULL DEFAULT false,
  discovery_call_enabled BOOLEAN NOT NULL DEFAULT false,
  discovery_call_booked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shortlisted_trainers ENABLE ROW LEVEL SECURITY;

-- Create policies for shortlisted_trainers
CREATE POLICY "Users can manage their own shortlisted trainers" 
ON public.shortlisted_trainers 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_shortlisted_trainers_user_id ON public.shortlisted_trainers(user_id);
CREATE INDEX idx_shortlisted_trainers_trainer_id ON public.shortlisted_trainers(trainer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_shortlisted_trainers_updated_at
BEFORE UPDATE ON public.shortlisted_trainers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create coach_analytics table for tracking trainer stats
CREATE TABLE public.coach_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id TEXT NOT NULL UNIQUE,
  total_views INTEGER NOT NULL DEFAULT 0,
  total_likes INTEGER NOT NULL DEFAULT 0,
  total_saves INTEGER NOT NULL DEFAULT 0,
  total_shortlists INTEGER NOT NULL DEFAULT 0,
  match_tier_stats JSONB NOT NULL DEFAULT '{}',
  conversion_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for coach_analytics
ALTER TABLE public.coach_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for coach_analytics (trainers can view their own stats)
CREATE POLICY "Trainers can view their own analytics" 
ON public.coach_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.user_type = 'trainer'
  AND profiles.id::text = trainer_id
));

-- Admins can manage all analytics
CREATE POLICY "Admins can manage all analytics" 
ON public.coach_analytics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.user_type = 'admin'
));

-- Add trigger for updated_at
CREATE TRIGGER update_coach_analytics_updated_at
BEFORE UPDATE ON public.coach_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update coach analytics when engagement changes
CREATE OR REPLACE FUNCTION public.update_coach_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert or update analytics for the trainer
  INSERT INTO public.coach_analytics (trainer_id, last_activity_at)
  VALUES (NEW.trainer_id, now())
  ON CONFLICT (trainer_id)
  DO UPDATE SET 
    last_activity_at = now(),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Create trigger to update analytics on engagement changes
CREATE TRIGGER update_analytics_on_engagement
AFTER INSERT OR UPDATE ON public.client_trainer_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_coach_analytics();