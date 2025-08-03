-- Add client journey stage tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN client_journey_stage text DEFAULT 'preferences_identified';

-- Create index for better performance
CREATE INDEX idx_profiles_client_journey_stage ON public.profiles(client_journey_stage);