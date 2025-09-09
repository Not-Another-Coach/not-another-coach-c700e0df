-- Fix security issues by setting search_path on the functions
CREATE OR REPLACE FUNCTION public.get_content_visibility(
  p_trainer_id UUID,
  p_content_type content_type,
  p_engagement_stage engagement_stage
) RETURNS visibility_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  visibility visibility_state;
  default_visibility visibility_state;
BEGIN
  -- Get custom setting
  SELECT visibility_state INTO visibility
  FROM trainer_visibility_settings
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
        WHEN 'testimonial_images' THEN 'visible'
        WHEN 'gallery_images' THEN 'blurred'
        ELSE 'hidden'
      END
    WHEN p_engagement_stage = 'liked' THEN
      CASE p_content_type
        WHEN 'profile_image' THEN 'visible'
        WHEN 'testimonial_images' THEN 'visible'
        WHEN 'gallery_images' THEN 'blurred'
        ELSE 'blurred'
      END
    WHEN p_engagement_stage IN ('matched', 'discovery_completed', 'active_client') THEN 'visible'
    ELSE 'hidden'
  END;
  
  RETURN default_visibility;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_trainer_visibility_defaults(p_trainer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  content_types content_type[] := ARRAY['profile_image', 'testimonial_images', 'gallery_images'];
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
      INSERT INTO trainer_visibility_settings (trainer_id, content_type, engagement_stage, visibility_state)
      VALUES (p_trainer_id, ct, stage, get_content_visibility(p_trainer_id, ct, stage))
      ON CONFLICT (trainer_id, content_type, engagement_stage) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;