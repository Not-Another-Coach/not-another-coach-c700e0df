-- Insert dummy trainers as real users with proper UUIDs
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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
  gen_random_uuid(),
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
);

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

-- Insert default global visibility settings with proper stage handling
INSERT INTO public.global_visibility_settings (content_type, engagement_stage, visibility_state)
VALUES
  -- Browsing stage - more restrictive
  ('profile_image', 'browsing', 'hidden'),
  ('before_after_images', 'browsing', 'hidden'),
  ('package_images', 'browsing', 'hidden'),
  ('testimonial_images', 'browsing', 'blurred'),
  ('certification_images', 'browsing', 'hidden'),
  ('gallery_images', 'browsing', 'hidden'),
  
  -- Liked stage - slightly more open
  ('profile_image', 'liked', 'blurred'),
  ('before_after_images', 'liked', 'hidden'),
  ('package_images', 'liked', 'hidden'),
  ('testimonial_images', 'liked', 'visible'),
  ('certification_images', 'liked', 'hidden'),
  ('gallery_images', 'liked', 'blurred'),
  
  -- Matched stage - more visible
  ('profile_image', 'matched', 'visible'),
  ('before_after_images', 'matched', 'blurred'),
  ('package_images', 'matched', 'blurred'),
  ('testimonial_images', 'matched', 'visible'),
  ('certification_images', 'matched', 'blurred'),
  ('gallery_images', 'matched', 'blurred'),
  
  -- Discovery completed stage - mostly visible
  ('profile_image', 'discovery_completed', 'visible'),
  ('before_after_images', 'discovery_completed', 'visible'),
  ('package_images', 'discovery_completed', 'visible'),
  ('testimonial_images', 'discovery_completed', 'visible'),
  ('certification_images', 'discovery_completed', 'blurred'),
  ('gallery_images', 'discovery_completed', 'visible'),
  
  -- Active client stage - everything visible
  ('profile_image', 'active_client', 'visible'),
  ('before_after_images', 'active_client', 'visible'),
  ('package_images', 'active_client', 'visible'),
  ('testimonial_images', 'active_client', 'visible'),
  ('certification_images', 'active_client', 'visible'),
  ('gallery_images', 'active_client', 'visible')
ON CONFLICT (content_type, engagement_stage) DO UPDATE SET
  visibility_state = EXCLUDED.visibility_state;