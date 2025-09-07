-- Create RPC function to handle admin verification check updates with audit logging and live activity notifications
CREATE OR REPLACE FUNCTION public.admin_update_verification_check(
  p_check_id uuid,
  p_status verification_check_status,
  p_admin_notes text DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  check_record RECORD;
  trainer_name TEXT;
BEGIN
  -- Only admins can update verification checks
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification checks';
  END IF;

  -- Get the verification check record
  SELECT * INTO check_record
  FROM trainer_verification_checks
  WHERE id = p_check_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification check not found';
  END IF;

  -- Update the verification check
  UPDATE trainer_verification_checks
  SET 
    status = p_status,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at = now()
  WHERE id = p_check_id;

  -- Create audit log entry
  INSERT INTO trainer_verification_audit_log (
    trainer_id, check_id, actor, action, previous_status, new_status, reason, metadata
  )
  VALUES (
    check_record.trainer_id,
    p_check_id,
    'admin',
    CASE WHEN p_status = 'verified' THEN 'approve' ELSE 'reject' END,
    check_record.status,
    p_status,
    COALESCE(p_admin_notes, 'Admin review completed'),
    jsonb_build_object(
      'admin_id', auth.uid(),
      'review_timestamp', now(),
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    )
  );

  -- Get trainer name for notifications
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO trainer_name
  FROM profiles WHERE id = check_record.trainer_id;

  -- Create alert for trainer
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    CASE WHEN p_status = 'verified' THEN 'verification_approved' ELSE 'verification_rejected' END,
    CASE WHEN p_status = 'verified' 
         THEN 'Verification Document Approved!' 
         ELSE 'Verification Document Rejected' END,
    CASE WHEN p_status = 'verified'
         THEN 'Your ' || check_record.check_type || ' verification has been approved.'
         ELSE 'Your ' || check_record.check_type || ' verification was rejected. ' || 
              COALESCE('Reason: ' || p_rejection_reason, 'Please review the feedback and resubmit.') END,
    jsonb_build_object('trainers', jsonb_build_array(check_record.trainer_id)),
    jsonb_build_object(
      'trainer_id', check_record.trainer_id,
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    true
  );

  -- Create alert for admin live activity feed
  INSERT INTO alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'admin_verification_action',
    'Verification Document ' || CASE WHEN p_status = 'verified' THEN 'Approved' ELSE 'Rejected' END,
    trainer_name || '''s ' || check_record.check_type || ' verification was ' || p_status,
    jsonb_build_object('admins', jsonb_build_array('all')),
    jsonb_build_object(
      'trainer_id', check_record.trainer_id,
      'trainer_name', trainer_name,
      'check_id', p_check_id,
      'check_type', check_record.check_type,
      'status', p_status,
      'admin_id', auth.uid(),
      'action_type', 'verification_review'
    ),
    true
  );

  -- Update overall verification status for trainer
  PERFORM update_trainer_verification_status(check_record.trainer_id);

  -- Check if trainer is now fully verified and has approved publication request
  IF p_status = 'verified' THEN
    DECLARE
      verification_status verification_overall_status;
      has_approved_publication BOOLEAN;
    BEGIN
      -- Get updated verification status
      verification_status := compute_trainer_verification_status(check_record.trainer_id);
      
      -- Check for approved publication request
      SELECT EXISTS (
        SELECT 1 FROM profile_publication_requests 
        WHERE trainer_id = check_record.trainer_id AND status = 'approved'
      ) INTO has_approved_publication;

      -- Auto-publish if fully verified and has approved publication request
      IF verification_status = 'verified' AND has_approved_publication THEN
        UPDATE profiles 
        SET profile_published = true, updated_at = now()
        WHERE id = check_record.trainer_id;
        
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
          'profile_auto_published',
          'Profile Published!',
          'Your verification is complete and your trainer profile is now published and visible to clients!',
          jsonb_build_object('trainers', jsonb_build_array(check_record.trainer_id)),
          jsonb_build_object(
            'trainer_id', check_record.trainer_id,
            'published_at', now(),
            'auto_published_on_verification', true
          ),
          true
        );
      END IF;
    END;
  END IF;
END;
$$;