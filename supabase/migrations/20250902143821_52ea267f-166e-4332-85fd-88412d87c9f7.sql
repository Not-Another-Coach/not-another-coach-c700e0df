-- Create comprehensive user deletion function
CREATE OR REPLACE FUNCTION public.admin_delete_user_completely(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result_counts jsonb := '{}';
  deletion_log jsonb := '[]';
  user_email text;
  user_type text;
  total_deleted integer := 0;
  temp_count integer;
BEGIN
  -- Only admins can run this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Get user info before deletion
  SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
  SELECT profiles.user_type INTO user_type FROM profiles WHERE id = p_user_id;

  -- Initialize deletion log
  deletion_log := jsonb_build_array(
    jsonb_build_object(
      'timestamp', now(),
      'action', 'deletion_started',
      'user_id', p_user_id,
      'user_email', user_email,
      'user_type', user_type,
      'admin_id', auth.uid()
    )
  );

  -- 1. Delete user alert interactions
  DELETE FROM user_alert_interactions WHERE user_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{user_alert_interactions}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 2. Delete consent audit log
  DELETE FROM consent_audit_log WHERE user_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{consent_audit_log}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 3. Delete login history
  DELETE FROM login_history WHERE user_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{login_history}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 4. Delete user journey tracking
  DELETE FROM user_journey_tracking WHERE user_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{user_journey_tracking}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 5. Delete message publish ledger
  DELETE FROM message_publish_ledger WHERE recipient_id = p_user_id OR sender_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{message_publish_ledger}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 6. Delete trainer-specific data if user is trainer
  IF user_type = 'trainer' THEN
    -- Delete trainer verification requests
    DELETE FROM trainer_verification_requests WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{trainer_verification_requests}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete trainer visibility settings
    DELETE FROM trainer_visibility_settings WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{trainer_visibility_settings}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete trainer Instagram selections
    DELETE FROM trainer_instagram_selections WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{trainer_instagram_selections}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete trainer onboarding activities
    DELETE FROM trainer_onboarding_activities WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{trainer_onboarding_activities}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete onboarding templates and related data
    DELETE FROM onboarding_conditional_evaluations WHERE template_id IN (
      SELECT id FROM onboarding_templates WHERE trainer_id = p_user_id
    );
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{onboarding_conditional_evaluations}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM onboarding_activity_assignments WHERE template_id IN (
      SELECT id FROM onboarding_templates WHERE trainer_id = p_user_id
    );
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{onboarding_activity_assignments}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM onboarding_commitments WHERE template_id IN (
      SELECT id FROM onboarding_templates WHERE trainer_id = p_user_id
    );
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{onboarding_commitments}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM onboarding_getting_started WHERE template_id IN (
      SELECT id FROM onboarding_templates WHERE trainer_id = p_user_id
    );
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{onboarding_getting_started}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM onboarding_templates WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{onboarding_templates}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete critical tasks
    DELETE FROM critical_tasks WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{critical_tasks}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete goal client links
    DELETE FROM goal_client_links WHERE goal_id IN (
      SELECT id FROM goals WHERE trainer_id = p_user_id
    );
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{goal_client_links}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete profile update streaks
    DELETE FROM profile_update_streaks WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{profile_update_streaks}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Delete waitlist exclusive periods
    DELETE FROM waitlist_exclusive_periods WHERE coach_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{waitlist_exclusive_periods}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    -- Clean up all trainer-client relationships
    DELETE FROM coach_waitlists WHERE coach_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{coach_waitlists_as_coach}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM coach_selection_requests WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{coach_selection_requests_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_trainer_engagement WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_trainer_engagement_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM conversations WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{conversations_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM discovery_calls WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{discovery_calls_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_template_assignments WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_template_assignments_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_getting_started_progress WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_getting_started_progress_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_ongoing_support_agreements WHERE trainer_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_ongoing_support_agreements_as_trainer}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;
  END IF;

  -- 7. Delete client-specific data if user is client
  IF user_type = 'client' THEN
    DELETE FROM coach_waitlists WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{coach_waitlists_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM coach_selection_requests WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{coach_selection_requests_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_trainer_engagement WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_trainer_engagement_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM conversations WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{conversations_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM discovery_calls WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{discovery_calls_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM discovery_call_feedback_responses WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{discovery_call_feedback_responses}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_template_assignments WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_template_assignments_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_getting_started_progress WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_getting_started_progress_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM client_ongoing_support_agreements WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{client_ongoing_support_agreements_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;

    DELETE FROM onboarding_conditional_evaluations WHERE client_id = p_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    result_counts := jsonb_set(result_counts, '{onboarding_conditional_evaluations_as_client}', to_jsonb(temp_count));
    total_deleted := total_deleted + temp_count;
  END IF;

  -- 8. Delete messages sent by user
  DELETE FROM messages WHERE sender_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{messages}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 9. Delete discovery call notifications
  DELETE FROM discovery_call_notifications WHERE discovery_call_id IN (
    SELECT id FROM discovery_calls WHERE client_id = p_user_id OR trainer_id = p_user_id
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{discovery_call_notifications}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 10. Delete user roles
  DELETE FROM user_roles WHERE user_id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{user_roles}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- 11. Finally delete the profile
  DELETE FROM profiles WHERE id = p_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  result_counts := jsonb_set(result_counts, '{profiles}', to_jsonb(temp_count));
  total_deleted := total_deleted + temp_count;

  -- Log the final deletion
  deletion_log := deletion_log || jsonb_build_array(
    jsonb_build_object(
      'timestamp', now(),
      'action', 'deletion_completed',
      'total_records_deleted', total_deleted,
      'deletion_counts', result_counts
    )
  );

  -- Log admin action
  INSERT INTO admin_actions_log (admin_id, target_user_id, action_type, action_details, reason)
  VALUES (
    auth.uid(),
    p_user_id,
    'complete_user_deletion',
    jsonb_build_object(
      'user_email', user_email,
      'user_type', user_type,
      'total_records_deleted', total_deleted,
      'deletion_counts', result_counts,
      'deletion_log', deletion_log
    ),
    'Complete user deletion from admin portal'
  );

  -- Return detailed results
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_email', user_email,
    'user_type', user_type,
    'total_records_deleted', total_deleted,
    'deletion_counts', result_counts,
    'deletion_log', deletion_log,
    'deleted_at', now()
  );
END;
$function$;