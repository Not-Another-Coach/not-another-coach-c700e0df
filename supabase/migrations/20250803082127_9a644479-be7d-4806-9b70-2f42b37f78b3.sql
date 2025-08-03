-- Add fields for enhanced package management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS before_after_photos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS package_inclusions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS admin_verification_notes text,
ADD COLUMN IF NOT EXISTS profile_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_verification_request timestamp with time zone;

-- Update package_options structure to include terms and notice periods
-- This will be handled in the application layer for existing data

-- Create storage bucket for client before/after photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-photos', 'client-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for client photos
CREATE POLICY "Trainers can upload client photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'client-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trainers can view their client photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trainers can update their client photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'client-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trainers can delete their client photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'client-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update the profile completion check function to include verification
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

-- Create trigger for profile completion check
DROP TRIGGER IF EXISTS check_profile_completion ON public.profiles;
CREATE TRIGGER check_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trainer_profile_completion();

-- Function to request admin verification
CREATE OR REPLACE FUNCTION public.request_profile_verification(trainer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only the trainer themselves can request verification
  IF auth.uid() != trainer_id THEN
    RETURN false;
  END IF;
  
  -- Update verification status to pending and timestamp
  UPDATE public.profiles 
  SET 
    verification_status = 'pending',
    last_verification_request = now()
  WHERE id = trainer_id AND user_type = 'trainer';
  
  RETURN true;
END;
$function$;