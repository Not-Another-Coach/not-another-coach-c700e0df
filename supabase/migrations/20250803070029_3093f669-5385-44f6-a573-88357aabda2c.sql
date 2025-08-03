-- Create storage buckets for trainer files
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-photos', 'profile-photos', true),
  ('qualification-proofs', 'qualification-proofs', false);

-- Create storage policies for profile photos (public access)
CREATE POLICY "Profile photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for qualification proofs (private access)
CREATE POLICY "Users can view their own qualification proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'qualification-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own qualification proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'qualification-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own qualification proofs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'qualification-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own qualification proofs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'qualification-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all qualification proofs for verification
CREATE POLICY "Admins can view all qualification proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'qualification-proofs' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
));

-- Add new columns to profiles table for trainer-specific data
ALTER TABLE profiles 
ADD COLUMN tagline TEXT,
ADD COLUMN training_types TEXT[] DEFAULT '{}',
ADD COLUMN certifying_body TEXT,
ADD COLUMN year_certified INTEGER,
ADD COLUMN proof_upload_urls TEXT[] DEFAULT '{}',
ADD COLUMN special_credentials TEXT[] DEFAULT '{}',
ADD COLUMN ideal_client_age_range TEXT,
ADD COLUMN ideal_client_fitness_level TEXT,
ADD COLUMN ideal_client_personality TEXT,
ADD COLUMN training_vibe TEXT,
ADD COLUMN availability_schedule JSONB DEFAULT '{}',
ADD COLUMN max_clients INTEGER,
ADD COLUMN client_status TEXT DEFAULT 'open',
ADD COLUMN hourly_rate DECIMAL(8,2),
ADD COLUMN package_options JSONB DEFAULT '[]',
ADD COLUMN free_discovery_call BOOLEAN DEFAULT false,
ADD COLUMN calendar_link TEXT,
ADD COLUMN testimonials JSONB DEFAULT '[]',
ADD COLUMN terms_agreed BOOLEAN DEFAULT false,
ADD COLUMN verification_status TEXT DEFAULT 'pending',
ADD COLUMN internal_tags TEXT[] DEFAULT '{}',
ADD COLUMN profile_setup_completed BOOLEAN DEFAULT false,
ADD COLUMN profile_setup_step INTEGER DEFAULT 1,
ADD COLUMN total_profile_setup_steps INTEGER DEFAULT 10;

-- Create enum for client status if it doesn't exist
DO $$ BEGIN
  CREATE TYPE client_status_enum AS ENUM ('open', 'waitlist', 'paused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for verification status
DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update columns to use enums
ALTER TABLE profiles 
ALTER COLUMN client_status TYPE client_status_enum USING client_status::client_status_enum,
ALTER COLUMN verification_status TYPE verification_status_enum USING verification_status::verification_status_enum;

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT check_hourly_rate_positive CHECK (hourly_rate IS NULL OR hourly_rate > 0),
ADD CONSTRAINT check_max_clients_positive CHECK (max_clients IS NULL OR max_clients > 0),
ADD CONSTRAINT check_year_certified_valid CHECK (year_certified IS NULL OR (year_certified >= 1980 AND year_certified <= EXTRACT(YEAR FROM NOW()) + 1));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_specializations ON profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_profiles_training_types ON profiles USING GIN(training_types);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status) WHERE user_type = 'trainer';
CREATE INDEX IF NOT EXISTS idx_profiles_client_status ON profiles(client_status) WHERE user_type = 'trainer';

-- Create a function to update profile_setup_completed based on required fields
CREATE OR REPLACE FUNCTION public.check_trainer_profile_completion()
RETURNS TRIGGER AS $$
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically check profile completion
CREATE TRIGGER trigger_check_trainer_profile_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trainer_profile_completion();