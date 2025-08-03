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

-- Create enum types first
DO $$ BEGIN
  CREATE TYPE client_status_enum AS ENUM ('open', 'waitlist', 'paused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to profiles table for trainer-specific data
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS training_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifying_body TEXT,
ADD COLUMN IF NOT EXISTS year_certified INTEGER,
ADD COLUMN IF NOT EXISTS proof_upload_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS special_credentials TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ideal_client_age_range TEXT,
ADD COLUMN IF NOT EXISTS ideal_client_fitness_level TEXT,
ADD COLUMN IF NOT EXISTS ideal_client_personality TEXT,
ADD COLUMN IF NOT EXISTS training_vibe TEXT,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_clients INTEGER,
ADD COLUMN IF NOT EXISTS client_status client_status_enum DEFAULT 'open',
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS package_options JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS free_discovery_call BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calendar_link TEXT,
ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status verification_status_enum DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS internal_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_setup_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_setup_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_profile_setup_steps INTEGER DEFAULT 10;

-- Add constraints
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT check_hourly_rate_positive CHECK (hourly_rate IS NULL OR hourly_rate > 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT check_max_clients_positive CHECK (max_clients IS NULL OR max_clients > 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT check_year_certified_valid CHECK (year_certified IS NULL OR (year_certified >= 1980 AND year_certified <= EXTRACT(YEAR FROM NOW()) + 1));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_specializations ON profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_profiles_training_types ON profiles USING GIN(training_types);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status) WHERE user_type = 'trainer';
CREATE INDEX IF NOT EXISTS idx_profiles_client_status ON profiles(client_status) WHERE user_type = 'trainer';

-- Create a security definer function to check user role (to avoid infinite recursion in RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS TEXT AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update existing storage policy to use security definer function
DROP POLICY IF EXISTS "Admins can view all qualification proofs" ON storage.objects;
CREATE POLICY "Admins can view all qualification proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'qualification-proofs' AND public.get_current_user_type() = 'admin');

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
DROP TRIGGER IF EXISTS trigger_check_trainer_profile_completion ON profiles;
CREATE TRIGGER trigger_check_trainer_profile_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trainer_profile_completion();