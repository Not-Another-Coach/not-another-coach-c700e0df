-- Create enum for content types
CREATE TYPE public.content_type AS ENUM (
  'profile_image',
  'before_after_images', 
  'package_images',
  'testimonial_images',
  'certification_images',
  'gallery_images'
);

-- Create enum for visibility states
CREATE TYPE public.visibility_state AS ENUM (
  'hidden',
  'blurred', 
  'visible'
);

-- Create trainer visibility settings table
CREATE TABLE public.trainer_visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  engagement_stage engagement_stage NOT NULL,
  visibility_state visibility_state NOT NULL DEFAULT 'hidden',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trainer_id, content_type, engagement_stage)
);

-- Enable RLS
ALTER TABLE public.trainer_visibility_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Trainers can manage their own visibility settings"
ON public.trainer_visibility_settings
FOR ALL 
TO authenticated
USING (auth.uid() = trainer_id);

CREATE POLICY "Users can view visibility settings"
ON public.trainer_visibility_settings
FOR SELECT
TO authenticated
USING (true);

-- Function to get visibility state for content
CREATE OR REPLACE FUNCTION public.get_content_visibility(
  p_trainer_id UUID,
  p_content_type content_type,
  p_engagement_stage engagement_stage
) RETURNS visibility_state
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  visibility visibility_state;
  default_visibility visibility_state;
BEGIN
  -- Get custom setting
  SELECT visibility_state INTO visibility
  FROM public.trainer_visibility_settings
  WHERE trainer_id = p_trainer_id 
    AND content_type = p_content_type 
    AND engagement_stage = p_engagement_stage;
  
  -- If custom setting exists, return it
  IF FOUND THEN
    RETURN visibility;
  END IF;
  
  -- Default visibility rules based on engagement stage and content type
  default_visibility := CASE
    WHEN p_engagement_stage = 'browsing' THEN
      CASE p_content_type
        WHEN 'profile_image' THEN 'visible'
        WHEN 'before_after_images' THEN 'blurred'
        WHEN 'package_images' THEN 'hidden'
        WHEN 'testimonial_images' THEN 'visible'
        WHEN 'certification_images' THEN 'hidden'
        WHEN 'gallery_images' THEN 'blurred'
        ELSE 'hidden'
      END
    WHEN p_engagement_stage = 'liked' THEN
      CASE p_content_type
        WHEN 'profile_image' THEN 'visible'
        WHEN 'before_after_images' THEN 'blurred'
        WHEN 'package_images' THEN 'blurred'
        WHEN 'testimonial_images' THEN 'visible'
        WHEN 'certification_images' THEN 'blurred'
        WHEN 'gallery_images' THEN 'blurred'
        ELSE 'blurred'
      END
    WHEN p_engagement_stage IN ('matched', 'discovery_completed', 'active_client') THEN 'visible'
    ELSE 'hidden'
  END;
  
  RETURN default_visibility;
END;
$$;

-- Function to set default visibility settings for a trainer
CREATE OR REPLACE FUNCTION public.initialize_trainer_visibility_defaults(p_trainer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  content_types content_type[] := ARRAY['profile_image', 'before_after_images', 'package_images', 'testimonial_images', 'certification_images', 'gallery_images'];
  stages engagement_stage[] := ARRAY['browsing', 'liked', 'matched', 'discovery_completed', 'active_client'];
  ct content_type;
  stage engagement_stage;
BEGIN
  -- Only initialize if user is the trainer
  IF auth.uid() != p_trainer_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Create default settings for all combinations
  FOREACH ct IN ARRAY content_types LOOP
    FOREACH stage IN ARRAY stages LOOP
      INSERT INTO public.trainer_visibility_settings (trainer_id, content_type, engagement_stage, visibility_state)
      VALUES (p_trainer_id, ct, stage, public.get_content_visibility(p_trainer_id, ct, stage))
      ON CONFLICT (trainer_id, content_type, engagement_stage) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_trainer_visibility_settings_updated_at
  BEFORE UPDATE ON public.trainer_visibility_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();