-- Create enum for publication request status
CREATE TYPE publication_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profile publication requests table
CREATE TABLE profile_publication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES profiles(id) NOT NULL,
  status publication_request_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainer_id, status) -- Prevent multiple pending requests
);

-- Enable RLS
ALTER TABLE profile_publication_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Trainers can view their own publication requests"
ON profile_publication_requests FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create their own publication requests"
ON profile_publication_requests FOR INSERT
WITH CHECK (auth.uid() = trainer_id AND status = 'pending');

CREATE POLICY "Admins can manage all publication requests"
ON profile_publication_requests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to request profile publication
CREATE OR REPLACE FUNCTION request_profile_publication()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id UUID;
  trainer_name TEXT;
BEGIN
  -- Check if user is authenticated trainer
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;
  
  -- Check if profile is already published
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND profile_published = true) THEN
    RAISE EXCEPTION 'Profile is already published';
  END IF;
  
  -- Check if there's already a pending request
  IF EXISTS (SELECT 1 FROM profile_publication_requests WHERE trainer_id = auth.uid() AND status = 'pending') THEN
    RAISE EXCEPTION 'You already have a pending publication request';
  END IF;
  
  -- Create the publication request
  INSERT INTO profile_publication_requests (trainer_id)
  VALUES (auth.uid())
  RETURNING id INTO request_id;
  
  -- Get trainer name for notification
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = auth.uid();
  
  -- Create admin notification
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'profile_publication_request',
    'New Profile Publication Request',
    trainer_name || ' has requested to publish their trainer profile',
    jsonb_build_object('admins', jsonb_build_array('all')),
    jsonb_build_object(
      'trainer_id', auth.uid(),
      'request_id', request_id,
      'trainer_name', trainer_name
    ),
    true
  );
  
  RETURN request_id;
END;
$$;

-- Function for admin to review publication requests
CREATE OR REPLACE FUNCTION review_profile_publication(
  p_request_id UUID,
  p_action publication_request_status,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req_record RECORD;
  trainer_name TEXT;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can review publication requests';
  END IF;
  
  -- Get request details
  SELECT * INTO req_record
  FROM profile_publication_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Publication request not found or already processed';
  END IF;
  
  -- Update the request
  UPDATE profile_publication_requests
  SET 
    status = p_action,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_action = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at = now()
  WHERE id = p_request_id;
  
  -- Get trainer name
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = req_record.trainer_id;
  
  -- If approved, check verification status and auto-publish if verified
  IF p_action = 'approved' THEN
    -- Check if trainer is already verified
    IF EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = req_record.trainer_id AND verification_status = 'verified'
    ) THEN
      -- Auto-publish the profile
      UPDATE profiles 
      SET profile_published = true, updated_at = now()
      WHERE id = req_record.trainer_id;
      
      -- Create success notification for trainer
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
        'Your trainer profile has been approved and published. It is now visible to clients.',
        jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
        jsonb_build_object(
          'trainer_id', req_record.trainer_id,
          'published_at', now()
        ),
        true
      );
    ELSE
      -- Create notification about approval pending verification
      INSERT INTO alerts (
        alert_type,
        title,
        content,
        target_audience,
        metadata,
        is_active
      )
      VALUES (
        'profile_approved_pending_verification',
        'Profile Approved - Verification Required',
        'Your profile publication has been approved! Complete your verification to publish your profile.',
        jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
        jsonb_build_object(
          'trainer_id', req_record.trainer_id,
          'request_id', p_request_id
        ),
        true
      );
    END IF;
  ELSIF p_action = 'rejected' THEN
    -- Create rejection notification for trainer
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'profile_publication_rejected',
      'Profile Publication Rejected',
      'Your profile publication request was not approved. ' || 
      CASE WHEN p_rejection_reason IS NOT NULL THEN 'Reason: ' || p_rejection_reason ELSE 'Please review the feedback and make necessary changes.' END,
      jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
      jsonb_build_object(
        'trainer_id', req_record.trainer_id,
        'request_id', p_request_id,
        'admin_notes', p_admin_notes,
        'rejection_reason', p_rejection_reason
      ),
      true
    );
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    req_record.trainer_id,
    'profile_publication_review',
    jsonb_build_object(
      'request_id', p_request_id,
      'action', p_action,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    'Profile publication request reviewed'
  );
END;
$$;

-- Trigger to auto-publish approved profiles when verification completes
CREATE OR REPLACE FUNCTION auto_publish_on_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When verification status becomes verified, check for approved publication requests
  IF NEW.verification_status = 'verified' AND 
     (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
    
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
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
CREATE TRIGGER auto_publish_on_verification_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_publish_on_verification();