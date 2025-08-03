-- Add missing fields to profiles table for trainer setup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ideal_client_types text[],
ADD COLUMN IF NOT EXISTS coaching_styles text[],
ADD COLUMN IF NOT EXISTS availability_slots jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_uk_based boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS works_bank_holidays boolean DEFAULT false;

-- Update the profile completion trigger to include new fields
CREATE OR REPLACE FUNCTION public.check_trainer_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only check for trainers
  IF NEW.user_type = 'trainer' THEN
    NEW.profile_setup_completed := (
      NEW.first_name IS NOT NULL AND
      NEW.last_name IS NOT NULL AND
      NEW.tagline IS NOT NULL AND
      NEW.location IS NOT NULL AND
      NEW.training_types IS NOT NULL AND array_length(NEW.training_types, 1) > 0 AND
      NEW.specializations IS NOT NULL AND array_length(NEW.specializations, 1) > 0 AND
      NEW.ideal_client_types IS NOT NULL AND array_length(NEW.ideal_client_types, 1) > 0 AND
      NEW.coaching_styles IS NOT NULL AND array_length(NEW.coaching_styles, 1) > 0 AND
      NEW.bio IS NOT NULL AND
      NEW.hourly_rate IS NOT NULL AND
      NEW.terms_agreed = true
    );
    
    -- Profile can only be published if setup is complete and verified
    IF NEW.profile_setup_completed = true AND NEW.verification_status = 'verified' THEN
      NEW.profile_published := true;
    ELSE
      NEW.profile_published := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;