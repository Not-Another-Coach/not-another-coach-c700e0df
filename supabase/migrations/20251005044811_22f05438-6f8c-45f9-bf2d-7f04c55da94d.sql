-- Update client_can_view_trainer_images function to include browsing stage
CREATE OR REPLACE FUNCTION public.client_can_view_trainer_images(
  p_trainer_id uuid,
  p_client_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_engagement boolean;
BEGIN
  -- Check if client has an engagement with the trainer in allowed stages
  SELECT EXISTS (
    SELECT 1
    FROM client_trainer_engagement
    WHERE client_id = p_client_id
      AND trainer_id = p_trainer_id
      AND stage IN (
        'browsing',
        'liked',
        'shortlisted',
        'getting_to_know_your_coach',
        'discovery_in_progress',
        'matched',
        'discovery_completed',
        'agreed',
        'payment_pending',
        'active_client'
      )
  ) INTO has_engagement;
  
  RETURN has_engagement;
END;
$$;