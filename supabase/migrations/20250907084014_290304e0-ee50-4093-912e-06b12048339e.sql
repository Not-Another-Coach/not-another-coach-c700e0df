-- Update the profile completion function to use packages instead of hourly_rate
CREATE OR REPLACE FUNCTION public.check_trainer_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if all required fields are completed for trainer profiles
  IF NEW.user_type = 'trainer' THEN
    -- Update profile_setup_completed based on package configuration instead of hourly_rate
    NEW.profile_setup_completed := (
      NEW.first_name IS NOT NULL AND
      NEW.last_name IS NOT NULL AND
      NEW.profile_photo_url IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM trainer_profiles tp 
        WHERE tp.id = NEW.id 
        AND tp.package_options IS NOT NULL 
        AND jsonb_array_length(tp.package_options) > 0
        AND tp.terms_agreed = true
        AND tp.specializations IS NOT NULL
        AND jsonb_array_length(tp.specializations) > 0
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update Trainer 4's profile completion status immediately
UPDATE profiles 
SET profile_setup_completed = (
  first_name IS NOT NULL AND
  last_name IS NOT NULL AND
  profile_photo_url IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM trainer_profiles tp 
    WHERE tp.id = profiles.id 
    AND tp.package_options IS NOT NULL 
    AND jsonb_array_length(tp.package_options) > 0
    AND tp.terms_agreed = true
    AND tp.specializations IS NOT NULL
    AND jsonb_array_length(tp.specializations) > 0
  )
)
WHERE id = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7' AND user_type = 'trainer';

-- Run the sync function to fix verification fields and auto-publish if conditions are met
SELECT public.sync_verification_fields();