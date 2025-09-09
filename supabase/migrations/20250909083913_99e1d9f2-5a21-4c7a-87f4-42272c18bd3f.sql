-- Expand the content_type enum to include new profile components
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'basic_information';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'specializations';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'pricing_discovery_call';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'stats_ratings';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'description_bio';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'certifications_qualifications';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'professional_journey';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'professional_milestones';

-- Update the get_content_visibility function to handle new content types with proper defaults
CREATE OR REPLACE FUNCTION public.get_content_visibility(p_trainer_id uuid, p_content_type content_type, p_engagement_stage engagement_stage)
 RETURNS visibility_state
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Always visible content types (not amendable by admin)
  IF p_content_type = 'stats_ratings' THEN
    RETURN 'visible';
  END IF;
  
  -- Default visible content types (not editable by admin but shown in matrix)
  IF p_content_type IN ('specializations', 'description_bio', 'certifications_qualifications', 'professional_journey', 'professional_milestones') THEN
    RETURN 'visible';
  END IF;
  
  -- Admin controllable content types with engagement-based defaults
  default_visibility := CASE
    WHEN p_engagement_stage = 'browsing' THEN
      CASE p_content_type
        WHEN 'profile_image' THEN 'visible'
        WHEN 'basic_information' THEN 'visible'
        WHEN 'testimonial_images' THEN 'visible'
        WHEN 'gallery_images' THEN 'blurred'
        WHEN 'pricing_discovery_call' THEN 'visible'
        ELSE 'hidden'
      END
    WHEN p_engagement_stage = 'liked' THEN
      CASE p_content_type
        WHEN 'profile_image' THEN 'visible'
        WHEN 'basic_information' THEN 'visible'
        WHEN 'testimonial_images' THEN 'visible'
        WHEN 'gallery_images' THEN 'blurred'
        WHEN 'pricing_discovery_call' THEN 'visible'
        ELSE 'blurred'
      END
    WHEN p_engagement_stage IN ('matched', 'discovery_completed', 'active_client') THEN 'visible'
    ELSE 'hidden'
  END;
  
  RETURN default_visibility;
END;
$function$;

-- Update the initialize_trainer_visibility_defaults function to handle new content types
CREATE OR REPLACE FUNCTION public.initialize_trainer_visibility_defaults(p_trainer_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  -- Only admin-controllable content types need settings rows
  admin_controllable_types content_type[] := ARRAY['profile_image', 'basic_information', 'testimonial_images', 'gallery_images', 'pricing_discovery_call'];
  stages engagement_stage[] := ARRAY['browsing', 'liked', 'matched', 'discovery_completed', 'active_client'];
  ct content_type;
  stage engagement_stage;
BEGIN
  -- Only initialize if user is the trainer
  IF auth.uid() != p_trainer_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Create default settings only for admin-controllable content types
  FOREACH ct IN ARRAY admin_controllable_types LOOP
    FOREACH stage IN ARRAY stages LOOP
      INSERT INTO trainer_visibility_settings (trainer_id, content_type, engagement_stage, visibility_state)
      VALUES (p_trainer_id, ct, stage, get_content_visibility(p_trainer_id, ct, stage))
      ON CONFLICT (trainer_id, content_type, engagement_stage) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$function$;