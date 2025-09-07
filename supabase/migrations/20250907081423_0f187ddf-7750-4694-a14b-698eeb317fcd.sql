-- Update the auto_publish_on_verification trigger to sync both verification fields
CREATE OR REPLACE FUNCTION public.auto_publish_on_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When verification status becomes verified, sync is_verified and check for auto-publish
  IF NEW.verification_status = 'verified' AND 
     (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
    
    -- Sync the is_verified field
    NEW.is_verified := true;
    
    -- Check if there's an approved publication request
    IF EXISTS (
      SELECT 1 FROM profile_publication_requests 
      WHERE trainer_id = NEW.id AND status = 'approved'
    ) THEN
      -- Auto-publish the profile
      NEW.profile_published := true;
      
      -- Create success notification
      INSERT INTO alerts (
        alert_type,
        title,
        content,
        target_audience,
        metadata,
        is_active
      )
      VALUES (
        'profile_published',
        'Profile Published!',
        'Your verification is complete and your trainer profile is now published and visible to clients!',
        jsonb_build_object('trainers', jsonb_build_array(NEW.id)),
        jsonb_build_object(
          'trainer_id', NEW.id,
          'published_at', now(),
          'auto_published_on_verification', true
        ),
        true
      );
    END IF;
  END IF;
  
  -- When verification status becomes something other than verified, sync is_verified
  IF NEW.verification_status != 'verified' AND OLD.verification_status = 'verified' THEN
    NEW.is_verified := false;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create function to sync existing inconsistent records
CREATE OR REPLACE FUNCTION public.sync_verification_fields()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update is_verified to match verification_status
  UPDATE profiles 
  SET is_verified = (verification_status = 'verified')
  WHERE user_type = 'trainer'
    AND ((verification_status = 'verified' AND is_verified = false) 
         OR (verification_status != 'verified' AND is_verified = true));
         
  -- Fix Trainer 4's specific issue - set profile_published = true if verified and has approved publication
  UPDATE profiles 
  SET profile_published = true,
      is_verified = true
  WHERE user_type = 'trainer'
    AND verification_status = 'verified' 
    AND profile_published = false
    AND EXISTS (
      SELECT 1 FROM profile_publication_requests 
      WHERE trainer_id = profiles.id AND status = 'approved'
    );
END;
$function$;

-- Run the sync function to fix existing data
SELECT sync_verification_fields();