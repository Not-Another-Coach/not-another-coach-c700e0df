-- Insert dummy trainers as real users in the database
-- First create the auth users (Note: In production, this would be done through proper auth signup)
-- For now, we'll create profiles directly

-- Insert trainer profiles
INSERT INTO public.profiles (
  id, 
  user_type, 
  first_name, 
  last_name, 
  bio, 
  profile_photo_url, 
  location, 
  specializations, 
  hourly_rate, 
  rating, 
  total_ratings, 
  is_verified, 
  profile_setup_completed,
  profile_published,
  training_types,
  qualifications,
  experience_level,
  created_at
) VALUES
-- Sarah Johnson
(
  'sarah-johnson-trainer-1',
  'trainer',
  'Sarah',
  'Johnson', 
  'Passionate about helping clients achieve sustainable weight loss and building strength.',
  '/assets/trainer-sarah.jpg',
  'Downtown',
  ARRAY['Weight Loss', 'Strength Training', 'Nutrition'],
  85.00,
  4.9,
  127,
  true,
  true,
  true,
  ARRAY['In-Person', 'Online'],
  ARRAY['NASM-CPT', 'Precision Nutrition'],
  'intermediate',
  now()
),
-- Mike Rodriguez  
(
  'mike-rodriguez-trainer-2',
  'trainer',
  'Mike',
  'Rodriguez',
  'Former competitive powerlifter dedicated to helping clients build serious muscle and strength.',
  '/assets/trainer-mike.jpg', 
  'Westside',
  ARRAY['Muscle Building', 'Powerlifting', 'Sports Performance'],
  95.00,
  4.8,
  94,
  true,
  true,
  true,
  ARRAY['In-Person', 'Hybrid'],
  ARRAY['CSCS', 'USAPL Coach'],
  'advanced',
  now()
),
-- Emma Chen
(
  'emma-chen-trainer-3',
  'trainer',
  'Emma', 
  'Chen',
  'Certified yoga instructor focusing on mind-body connection and flexibility.',
  '/assets/trainer-emma.jpg',
  'Eastside', 
  ARRAY['Yoga', 'Flexibility', 'Mindfulness', 'Rehabilitation'],
  70.00,
  4.9,
  156,
  true,
  true,
  true,
  ARRAY['Online', 'In-Person'],
  ARRAY['RYT-500', 'Corrective Exercise'],
  'intermediate',
  now()
),
-- Alex Thompson
(
  'alex-thompson-trainer-4',
  'trainer',
  'Alex',
  'Thompson',
  'High-energy trainer specializing in functional movements and metabolic conditioning.',
  '/assets/trainer-alex.jpg',
  'Northside',
  ARRAY['CrossFit', 'HIIT', 'Endurance', 'Functional Training'], 
  80.00,
  4.7,
  89,
  true,
  true,
  true,
  ARRAY['In-Person', 'Group'],
  ARRAY['CrossFit L2', 'ACSM-CPT'],
  'intermediate',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  bio = EXCLUDED.bio,
  profile_photo_url = EXCLUDED.profile_photo_url,
  location = EXCLUDED.location,
  specializations = EXCLUDED.specializations,
  hourly_rate = EXCLUDED.hourly_rate,
  rating = EXCLUDED.rating,
  total_ratings = EXCLUDED.total_ratings,
  is_verified = EXCLUDED.is_verified,
  profile_setup_completed = EXCLUDED.profile_setup_completed,
  profile_published = EXCLUDED.profile_published,
  training_types = EXCLUDED.training_types,
  qualifications = EXCLUDED.qualifications,
  experience_level = EXCLUDED.experience_level;

-- Create global visibility settings table
CREATE TABLE IF NOT EXISTS public.global_visibility_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type content_type NOT NULL,
  engagement_stage engagement_stage NOT NULL,
  visibility_state visibility_state NOT NULL DEFAULT 'hidden',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(content_type, engagement_stage)
);

-- Enable RLS
ALTER TABLE public.global_visibility_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for global visibility settings
CREATE POLICY "Admins can manage global visibility settings"
ON public.global_visibility_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view global visibility settings"
ON public.global_visibility_settings
FOR SELECT
TO authenticated
USING (true);

-- Insert default global visibility settings
INSERT INTO public.global_visibility_settings (content_type, engagement_stage, visibility_state)
VALUES
  -- Browsing stage
  ('profile_image', 'browsing', 'visible'),
  ('before_after_images', 'browsing', 'blurred'),
  ('package_images', 'browsing', 'hidden'),
  ('testimonial_images', 'browsing', 'visible'),
  ('certification_images', 'browsing', 'hidden'),
  ('gallery_images', 'browsing', 'blurred'),
  
  -- Liked stage
  ('profile_image', 'liked', 'visible'),
  ('before_after_images', 'liked', 'blurred'),
  ('package_images', 'liked', 'blurred'),
  ('testimonial_images', 'liked', 'visible'),
  ('certification_images', 'liked', 'blurred'),
  ('gallery_images', 'liked', 'blurred'),
  
  -- Matched stage
  ('profile_image', 'matched', 'visible'),
  ('before_after_images', 'matched', 'visible'),
  ('package_images', 'matched', 'visible'),
  ('testimonial_images', 'matched', 'visible'),
  ('certification_images', 'matched', 'visible'),
  ('gallery_images', 'matched', 'visible'),
  
  -- Discovery completed stage
  ('profile_image', 'discovery_completed', 'visible'),
  ('before_after_images', 'discovery_completed', 'visible'),
  ('package_images', 'discovery_completed', 'visible'),
  ('testimonial_images', 'discovery_completed', 'visible'),
  ('certification_images', 'discovery_completed', 'visible'),
  ('gallery_images', 'discovery_completed', 'visible'),
  
  -- Active client stage
  ('profile_image', 'active_client', 'visible'),
  ('before_after_images', 'active_client', 'visible'),
  ('package_images', 'active_client', 'visible'),
  ('testimonial_images', 'active_client', 'visible'),
  ('certification_images', 'active_client', 'visible'),
  ('gallery_images', 'active_client', 'visible')
ON CONFLICT (content_type, engagement_stage) DO UPDATE SET
  visibility_state = EXCLUDED.visibility_state;

-- Update the get_content_visibility function to use global settings first
CREATE OR REPLACE FUNCTION public.get_content_visibility(
  p_trainer_id uuid, 
  p_content_type content_type, 
  p_engagement_stage engagement_stage
)
RETURNS visibility_state
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  visibility visibility_state;
BEGIN
  -- First check for global settings
  SELECT visibility_state INTO visibility
  FROM public.global_visibility_settings
  WHERE content_type = p_content_type 
    AND engagement_stage = p_engagement_stage;
  
  -- If global setting exists, return it
  IF FOUND THEN
    RETURN visibility;
  END IF;
  
  -- Fallback to trainer-specific settings if no global setting
  SELECT visibility_state INTO visibility
  FROM public.trainer_visibility_settings
  WHERE trainer_id = p_trainer_id 
    AND content_type = p_content_type 
    AND engagement_stage = p_engagement_stage;
  
  -- If trainer-specific setting exists, return it
  IF FOUND THEN
    RETURN visibility;
  END IF;
  
  -- Default visibility rules as final fallback
  visibility := CASE
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
  
  RETURN visibility;
END;
$function$;