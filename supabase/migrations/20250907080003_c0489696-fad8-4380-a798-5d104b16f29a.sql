-- Fix database functions to use valid alert types from the check constraint
-- Valid types: discovery_call_booked, discovery_call_cancelled, discovery_call_rescheduled,
-- coach_selection_request, coach_selection_sent, waitlist_joined, waitlist_left,
-- verification_request, verification_update, coach_update, waitlist_exclusive_access, waitlist_exclusivity_ended

-- Fix check_verification_expiry function with correct alert types
CREATE OR REPLACE FUNCTION public.check_verification_expiry()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  expiring_check RECORD;
  expired_check RECORD;
BEGIN
  -- Create notifications for certificates expiring within 14 days
  FOR expiring_check IN 
    SELECT tvc.*, p.first_name, p.last_name
    FROM trainer_verification_checks tvc
    JOIN profiles p ON tvc.trainer_id = p.id
    WHERE tvc.expiry_date BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 14
      AND tvc.status = 'verified'
      AND NOT EXISTS (
        SELECT 1 FROM alerts 
        WHERE alert_type = 'verification_update'
          AND metadata->>'check_id' = tvc.id::text
          AND created_at > CURRENT_DATE - INTERVAL '7 days'
      )
  LOOP
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'verification_update',
      'Document Expiring Soon',
      'Your ' || expiring_check.check_type || ' expires on ' || expiring_check.expiry_date::text || '. Please update it soon.',
      jsonb_build_object('trainers', jsonb_build_array(expiring_check.trainer_id)),
      jsonb_build_object(
        'trainer_id', expiring_check.trainer_id,
        'check_id', expiring_check.id,
        'check_type', expiring_check.check_type,
        'expiry_date', expiring_check.expiry_date,
        'days_until_expiry', expiring_check.expiry_date - CURRENT_DATE,
        'alert_subtype', 'expiry_warning'
      ),
      true
    );
  END LOOP;

  -- Update expired checks and create notifications
  FOR expired_check IN 
    SELECT tvc.*, p.first_name, p.last_name
    FROM trainer_verification_checks tvc
    JOIN profiles p ON tvc.trainer_id = p.id
    WHERE tvc.expiry_date < CURRENT_DATE 
      AND tvc.status = 'verified'
  LOOP
    -- Update status to expired
    UPDATE trainer_verification_checks 
    SET 
      status = 'expired',
      updated_at = now()
    WHERE id = expired_check.id;
    
    -- Create expiry notification for trainer
    INSERT INTO alerts (
      alert_type,
      title,
      content,
      target_audience,
      metadata,
      is_active
    )
    VALUES (
      'verification_update',
      'Document Expired',
      'Your ' || expired_check.check_type || ' has expired. Please upload a new document to maintain your verification status.',
      jsonb_build_object('trainers', jsonb_build_array(expired_check.trainer_id)),
      jsonb_build_object(
        'trainer_id', expired_check.trainer_id,
        'check_id', expired_check.id,
        'check_type', expired_check.check_type,
        'expired_on', expired_check.expiry_date,
        'alert_subtype', 'expired'
      ),
      true
    );
    
    -- Log expiry action
    INSERT INTO trainer_verification_audit_log (
      trainer_id, check_id, actor, action, previous_status, new_status, reason
    )
    VALUES (
      expired_check.trainer_id, expired_check.id, 'system', 'expire', 
      'verified', 'expired', 'Document expired on ' || expired_check.expiry_date::text
    );
  END LOOP;

  -- Update overall verification status for affected trainers
  PERFORM update_trainer_verification_status(trainer_id)
  FROM (
    SELECT DISTINCT trainer_id 
    FROM trainer_verification_checks 
    WHERE expiry_date <= CURRENT_DATE + 14 AND status IN ('verified', 'expired')
  ) AS affected_trainers;
END;
$function$;

-- Fix request_profile_publication function with correct alert types
CREATE OR REPLACE FUNCTION public.request_profile_publication()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Get trainer name (removed email dependency)
  SELECT COALESCE(first_name || ' ' || last_name, 'Trainer') INTO trainer_name
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
    'coach_update',
    'New Profile Publication Request',
    trainer_name || ' has requested to publish their trainer profile',
    jsonb_build_object('admins', jsonb_build_array('all')),
    jsonb_build_object(
      'trainer_id', auth.uid(),
      'request_id', request_id,
      'trainer_name', trainer_name,
      'alert_subtype', 'publication_request'
    ),
    true
  );
  
  RETURN request_id;
END;
$function$;

-- Fix review_profile_publication function with correct alert types
CREATE OR REPLACE FUNCTION public.review_profile_publication(p_request_id uuid, p_action publication_request_status, p_admin_notes text DEFAULT NULL::text, p_rejection_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Get trainer name (removed email dependency)
  SELECT COALESCE(first_name || ' ' || last_name, 'Trainer') INTO trainer_name
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
        'coach_update',
        'Profile Published!',
        'Your trainer profile has been approved and published. It is now visible to clients.',
        jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
        jsonb_build_object(
          'trainer_id', req_record.trainer_id,
          'published_at', now(),
          'alert_subtype', 'profile_published'
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
        'coach_update',
        'Profile Approved - Verification Required',
        'Your profile publication has been approved! Complete your verification to publish your profile.',
        jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
        jsonb_build_object(
          'trainer_id', req_record.trainer_id,
          'request_id', p_request_id,
          'alert_subtype', 'approved_pending_verification'
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
      'coach_update',
      'Profile Publication Rejected',
      'Your profile publication request was not approved. ' || 
      CASE WHEN p_rejection_reason IS NOT NULL THEN 'Reason: ' || p_rejection_reason ELSE 'Please review the feedback and make necessary changes.' END,
      jsonb_build_object('trainers', jsonb_build_array(req_record.trainer_id)),
      jsonb_build_object(
        'trainer_id', req_record.trainer_id,
        'request_id', p_request_id,
        'admin_notes', p_admin_notes,
        'rejection_reason', p_rejection_reason,
        'alert_subtype', 'publication_rejected'
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
$function$;