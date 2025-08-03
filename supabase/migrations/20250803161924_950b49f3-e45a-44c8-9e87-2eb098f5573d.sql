-- Create enum for engagement stages
CREATE TYPE public.engagement_stage AS ENUM (
  'browsing',
  'liked', 
  'matched',
  'discovery_completed',
  'active_client'
);

-- Create table to track client-trainer engagement stages
CREATE TABLE public.client_trainer_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  stage engagement_stage NOT NULL DEFAULT 'browsing',
  liked_at TIMESTAMP WITH TIME ZONE,
  matched_at TIMESTAMP WITH TIME ZONE,
  discovery_completed_at TIMESTAMP WITH TIME ZONE,
  became_client_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, trainer_id)
);

-- Enable RLS
ALTER TABLE public.client_trainer_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own engagements as client" 
ON public.client_trainer_engagement 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Users can view their own engagements as trainer" 
ON public.client_trainer_engagement 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can create their own engagements" 
ON public.client_trainer_engagement 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own engagements" 
ON public.client_trainer_engagement 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = trainer_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_client_trainer_engagement_updated_at
BEFORE UPDATE ON public.client_trainer_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add fields to profiles table for tiered content
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  profile_blocks jsonb DEFAULT '{
    "hero": {},
    "mini_bio": {},
    "specialisms": {},
    "ways_of_working": {},
    "gallery_packages": {},
    "process_timeline": {},
    "reviews": {}
  }'::jsonb;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  pricing_unlock_required boolean DEFAULT true;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  discovery_call_price numeric;

-- Create function to get engagement stage between client and trainer
CREATE OR REPLACE FUNCTION public.get_engagement_stage(client_uuid UUID, trainer_uuid UUID)
RETURNS engagement_stage
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  current_stage engagement_stage;
BEGIN
  SELECT stage INTO current_stage
  FROM public.client_trainer_engagement
  WHERE client_id = client_uuid AND trainer_id = trainer_uuid;
  
  -- Return 'browsing' if no engagement record exists
  RETURN COALESCE(current_stage, 'browsing');
END;
$$;

-- Create function to update engagement stage
CREATE OR REPLACE FUNCTION public.update_engagement_stage(
  client_uuid UUID, 
  trainer_uuid UUID, 
  new_stage engagement_stage
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.client_trainer_engagement (client_id, trainer_id, stage)
  VALUES (client_uuid, trainer_uuid, new_stage)
  ON CONFLICT (client_id, trainer_id)
  DO UPDATE SET 
    stage = new_stage,
    updated_at = now(),
    liked_at = CASE WHEN new_stage = 'liked' AND OLD.liked_at IS NULL THEN now() ELSE OLD.liked_at END,
    matched_at = CASE WHEN new_stage = 'matched' AND OLD.matched_at IS NULL THEN now() ELSE OLD.matched_at END,
    discovery_completed_at = CASE WHEN new_stage = 'discovery_completed' AND OLD.discovery_completed_at IS NULL THEN now() ELSE OLD.discovery_completed_at END,
    became_client_at = CASE WHEN new_stage = 'active_client' AND OLD.became_client_at IS NULL THEN now() ELSE OLD.became_client_at END;
END;
$$;