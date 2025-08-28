-- Fix the cleanup function - correct table structures and relationships
CREATE OR REPLACE FUNCTION public.admin_cleanup_client_trainer_interactions(
  p_client_id UUID,
  p_trainer_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_counts JSON;
  messages_count INTEGER := 0;
  conversations_count INTEGER := 0;
  feedback_responses_count INTEGER := 0;
  feedback_count INTEGER := 0;
  call_notifications_count INTEGER := 0;
  feedback_notifications_count INTEGER := 0;
  call_notes_count INTEGER := 0;
  discovery_calls_count INTEGER := 0;
  selection_requests_count INTEGER := 0;
  waitlist_entries_count INTEGER := 0;
  commitment_acknowledgments_count INTEGER := 0;
  getting_started_progress_count INTEGER := 0;
  onboarding_progress_count INTEGER := 0;
  template_assignments_count INTEGER := 0;
  ongoing_support_agreements_count INTEGER := 0;
  conditional_evaluations_count INTEGER := 0;
  goal_client_links_count INTEGER := 0;
  instagram_revelations_count INTEGER := 0;
  alerts_count INTEGER := 0;
  engagement_records_count INTEGER := 0;
  journey_stage_reset_count INTEGER := 0;
BEGIN
  -- Ensure only admin users can run this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- 1. Delete messages between client and trainer (via conversation)
  WITH deleted_messages AS (
    DELETE FROM messages m
    USING conversations c
    WHERE m.conversation_id = c.id 
      AND c.client_id = p_client_id 
      AND c.trainer_id = p_trainer_id
    RETURNING m.id
  )
  SELECT COUNT(*) INTO messages_count FROM deleted_messages;

  -- 2. Delete conversations between client and trainer
  WITH deleted_conversations AS (
    DELETE FROM conversations 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO conversations_count FROM deleted_conversations;

  -- 3. Delete discovery call feedback responses
  WITH deleted_feedback_responses AS (
    DELETE FROM discovery_call_feedback_responses 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO feedback_responses_count FROM deleted_feedback_responses;

  -- 4. Delete discovery call feedback
  WITH deleted_feedback AS (
    DELETE FROM discovery_call_feedback 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO feedback_count FROM deleted_feedback;

  -- 5. Delete discovery call notifications
  WITH deleted_call_notifications AS (
    DELETE FROM discovery_call_notifications dcn
    USING discovery_calls dc
    WHERE dcn.discovery_call_id = dc.id 
      AND dc.client_id = p_client_id 
      AND dc.trainer_id = p_trainer_id
    RETURNING dcn.id
  )
  SELECT COUNT(*) INTO call_notifications_count FROM deleted_call_notifications;

  -- 6. Delete discovery call feedback notifications (corrected structure)
  WITH deleted_feedback_notifications AS (
    DELETE FROM discovery_call_feedback_notifications dcfn
    WHERE dcfn.client_id = p_client_id
      AND EXISTS (
        SELECT 1 FROM discovery_calls dc 
        WHERE dc.id = dcfn.discovery_call_id 
          AND dc.trainer_id = p_trainer_id
      )
    RETURNING dcfn.id
  )
  SELECT COUNT(*) INTO feedback_notifications_count FROM deleted_feedback_notifications;

  -- 7. Delete discovery call notes
  WITH deleted_call_notes AS (
    DELETE FROM discovery_call_notes 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO call_notes_count FROM deleted_call_notes;

  -- 8. Delete discovery calls
  WITH deleted_discovery_calls AS (
    DELETE FROM discovery_calls 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO discovery_calls_count FROM deleted_discovery_calls;

  -- 9. Delete coach selection requests
  WITH deleted_selection_requests AS (
    DELETE FROM coach_selection_requests 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO selection_requests_count FROM deleted_selection_requests;

  -- 10. Delete waitlist entries
  WITH deleted_waitlist_entries AS (
    DELETE FROM coach_waitlists 
    WHERE client_id = p_client_id AND coach_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO waitlist_entries_count FROM deleted_waitlist_entries;

  -- 11. Delete commitment acknowledgments (skip if table doesn't exist)
  BEGIN
    WITH deleted_commitment_acknowledgments AS (
      DELETE FROM client_commitment_acknowledgments 
      WHERE client_id = p_client_id AND trainer_id = p_trainer_id
      RETURNING id
    )
    SELECT COUNT(*) INTO commitment_acknowledgments_count FROM deleted_commitment_acknowledgments;
  EXCEPTION 
    WHEN undefined_table THEN
      commitment_acknowledgments_count := 0;
  END;

  -- 12. Delete getting started progress
  WITH deleted_getting_started_progress AS (
    DELETE FROM client_getting_started_progress 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO getting_started_progress_count FROM deleted_getting_started_progress;

  -- 13. Delete onboarding progress (skip if table doesn't exist)
  BEGIN
    WITH deleted_onboarding_progress AS (
      DELETE FROM client_onboarding_progress 
      WHERE client_id = p_client_id AND trainer_id = p_trainer_id
      RETURNING id
    )
    SELECT COUNT(*) INTO onboarding_progress_count FROM deleted_onboarding_progress;
  EXCEPTION 
    WHEN undefined_table THEN
      onboarding_progress_count := 0;
  END;

  -- 14. Delete template assignments
  WITH deleted_template_assignments AS (
    DELETE FROM client_template_assignments 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO template_assignments_count FROM deleted_template_assignments;

  -- 15. Delete ongoing support agreements
  WITH deleted_ongoing_support_agreements AS (
    DELETE FROM client_ongoing_support_agreements 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO ongoing_support_agreements_count FROM deleted_ongoing_support_agreements;

  -- 16. Delete conditional evaluations
  WITH deleted_conditional_evaluations AS (
    DELETE FROM onboarding_conditional_evaluations oce
    USING onboarding_templates ot
    WHERE oce.template_id = ot.id 
      AND oce.client_id = p_client_id 
      AND ot.trainer_id = p_trainer_id
    RETURNING oce.id
  )
  SELECT COUNT(*) INTO conditional_evaluations_count FROM deleted_conditional_evaluations;

  -- 17. Delete goal client links (skip if tables don't exist)
  BEGIN
    WITH deleted_goal_client_links AS (
      DELETE FROM goal_client_links gcl
      USING goals g
      WHERE gcl.goal_id = g.id 
        AND gcl.client_id = p_client_id 
        AND g.trainer_id = p_trainer_id
      RETURNING gcl.id
    )
    SELECT COUNT(*) INTO goal_client_links_count FROM deleted_goal_client_links;
  EXCEPTION 
    WHEN undefined_table THEN
      goal_client_links_count := 0;
  END;

  -- 18. Delete Instagram revelations
  WITH deleted_instagram_revelations AS (
    DELETE FROM instagram_handle_revelations 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO instagram_revelations_count FROM deleted_instagram_revelations;

  -- 19. Skip alerts since user_alerts table doesn't exist
  alerts_count := 0;

  -- 20. Delete engagement records
  WITH deleted_engagement_records AS (
    DELETE FROM client_trainer_engagement 
    WHERE client_id = p_client_id AND trainer_id = p_trainer_id
    RETURNING id
  )
  SELECT COUNT(*) INTO engagement_records_count FROM deleted_engagement_records;

  -- 21. RESET CLIENT JOURNEY STAGE
  WITH reset_journey_stage AS (
    UPDATE profiles 
    SET client_journey_stage = NULL,
        updated_at = now()
    WHERE id = p_client_id 
      AND client_journey_stage IS NOT NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO journey_stage_reset_count FROM reset_journey_stage;

  -- Log admin action
  INSERT INTO admin_actions_log (admin_id, target_user_id, action_type, action_details, reason)
  VALUES (
    auth.uid(),
    p_client_id,
    'client_trainer_cleanup',
    json_build_object(
      'trainer_id', p_trainer_id,
      'deleted_counts', json_build_object(
        'messages', messages_count,
        'conversations', conversations_count,
        'feedback_responses', feedback_responses_count,
        'feedback', feedback_count,
        'call_notifications', call_notifications_count,
        'feedback_notifications', feedback_notifications_count,
        'call_notes', call_notes_count,
        'discovery_calls', discovery_calls_count,
        'selection_requests', selection_requests_count,
        'waitlist_entries', waitlist_entries_count,
        'commitment_acknowledgments', commitment_acknowledgments_count,
        'getting_started_progress', getting_started_progress_count,
        'onboarding_progress', onboarding_progress_count,
        'template_assignments', template_assignments_count,
        'ongoing_support_agreements', ongoing_support_agreements_count,
        'conditional_evaluations', conditional_evaluations_count,
        'goal_client_links', goal_client_links_count,
        'instagram_revelations', instagram_revelations_count,
        'alerts', alerts_count,
        'engagement_records', engagement_records_count,
        'journey_stage_reset', journey_stage_reset_count
      )
    ),
    'Data cleanup between client and trainer'
  );

  -- Return counts
  result_counts := json_build_object(
    'messages', messages_count,
    'conversations', conversations_count,
    'feedback_responses', feedback_responses_count,
    'feedback', feedback_count,
    'call_notifications', call_notifications_count,
    'feedback_notifications', feedback_notifications_count,
    'call_notes', call_notes_count,
    'discovery_calls', discovery_calls_count,
    'selection_requests', selection_requests_count,
    'waitlist_entries', waitlist_entries_count,
    'commitment_acknowledgments', commitment_acknowledgments_count,
    'getting_started_progress', getting_started_progress_count,
    'onboarding_progress', onboarding_progress_count,
    'template_assignments', template_assignments_count,
    'ongoing_support_agreements', ongoing_support_agreements_count,
    'conditional_evaluations', conditional_evaluations_count,
    'goal_client_links', goal_client_links_count,
    'instagram_revelations', instagram_revelations_count,
    'alerts', alerts_count,
    'engagement_records', engagement_records_count,
    'journey_stage_reset', journey_stage_reset_count
  );

  RETURN result_counts;
END;
$$;