-- Fix critical security issue: Restrict trainer image access to authorized users only

-- First, drop the insecure policies that allow unauthorized access
DROP POLICY IF EXISTS "Anyone can view selected trainer images" ON public.trainer_uploaded_images;
DROP POLICY IF EXISTS "secure_view_trainer_images_2025" ON public.trainer_uploaded_images;

-- Create a secure function to check if a client has authorized access to trainer's images
CREATE OR REPLACE FUNCTION public.client_can_view_trainer_images(p_trainer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- If no user is authenticated, deny access
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Trainers can always view their own images
  IF current_user_id = p_trainer_id THEN
    RETURN true;
  END IF;
  
  -- Check if the client has any active engagement with this trainer
  RETURN EXISTS (
    SELECT 1 FROM client_trainer_engagement 
    WHERE client_id = current_user_id 
    AND trainer_id = p_trainer_id
    AND stage IN ('shortlisted', 'discovery_call_booked', 'discovery_in_progress', 'discovery_completed', 'waitlist', 'active_client')
  ) OR EXISTS (
    -- Or has an active discovery call (past or future)
    SELECT 1 FROM discovery_calls 
    WHERE client_id = current_user_id 
    AND trainer_id = p_trainer_id
    AND status IN ('scheduled', 'completed')
  ) OR EXISTS (
    -- Or is on the trainer's waitlist
    SELECT 1 FROM coach_waitlists 
    WHERE client_id = current_user_id 
    AND coach_id = p_trainer_id 
    AND status = 'active'
  );
END;
$$;

-- Create secure RLS policies for trainer images
CREATE POLICY "Trainers can manage their own images" 
ON public.trainer_uploaded_images 
FOR ALL 
TO authenticated
USING (auth.uid() = trainer_id)
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Authorized clients can view trainer images" 
ON public.trainer_uploaded_images 
FOR SELECT 
TO authenticated
USING (
  -- Only allow viewing if client has authorized access to this trainer
  client_can_view_trainer_images(trainer_id)
);

-- Ensure RLS is enabled on the table
ALTER TABLE public.trainer_uploaded_images ENABLE ROW LEVEL SECURITY;

-- Also secure the Instagram selections table if it exists
CREATE POLICY "Trainers can manage their Instagram selections" 
ON public.trainer_instagram_selections 
FOR ALL 
TO authenticated
USING (auth.uid() = trainer_id)
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Authorized clients can view Instagram selections" 
ON public.trainer_instagram_selections 
FOR SELECT 
TO authenticated
USING (
  client_can_view_trainer_images(trainer_id)
);

ALTER TABLE public.trainer_instagram_selections ENABLE ROW LEVEL SECURITY;