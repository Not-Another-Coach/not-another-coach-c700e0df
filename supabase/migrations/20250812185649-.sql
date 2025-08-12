-- Phase 4: Accessibility Schema Enforcement
-- Add accessibility fields to onboarding templates
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS accessibility_metadata jsonb DEFAULT '{
  "alt_texts_verified": false,
  "color_contrast_checked": false,
  "keyboard_navigation_tested": false,
  "screen_reader_compatible": false,
  "focus_management_implemented": false,
  "aria_labels_complete": false,
  "heading_structure_valid": false,
  "semantic_markup_verified": false,
  "axe_score": null,
  "axe_violations": [],
  "last_accessibility_audit": null,
  "wcag_compliance_level": null
}'::jsonb;

ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS accessibility_required boolean DEFAULT true;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS accessibility_approved boolean DEFAULT false;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS accessibility_approved_by uuid;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS accessibility_approved_at timestamp with time zone;

-- Create accessibility audit log table
CREATE TABLE IF NOT EXISTS accessibility_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  template_type text NOT NULL DEFAULT 'onboarding',
  audit_type text NOT NULL CHECK (audit_type IN ('automated', 'manual', 'pre_publish')),
  axe_results jsonb DEFAULT '{}',
  violations_count integer DEFAULT 0,
  compliance_score numeric(3,2) DEFAULT 0.00,
  wcag_level text CHECK (wcag_level IN ('A', 'AA', 'AAA')),
  audited_by uuid,
  audited_at timestamp with time zone DEFAULT now(),
  passed boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on accessibility audit log
ALTER TABLE accessibility_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for accessibility audit log
CREATE POLICY "Admins and trainers can view accessibility audits"
  ON accessibility_audit_log FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

CREATE POLICY "System can create accessibility audits"
  ON accessibility_audit_log FOR INSERT
  WITH CHECK (true);

-- Phase 5: DSAR & Retention Compliance

-- Create data subject access requests table
CREATE TABLE IF NOT EXISTS data_subject_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('access', 'portability', 'deletion', 'rectification')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  requested_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  processed_by uuid,
  request_details jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  verification_token text,
  verification_expires_at timestamp with time zone,
  verified_at timestamp with time zone,
  legal_basis text DEFAULT 'gdpr_article_15',
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE data_subject_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for DSAR
CREATE POLICY "Users can view their own DSAR requests"
  ON data_subject_access_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own DSAR requests"
  ON data_subject_access_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all DSAR requests"
  ON data_subject_access_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create data retention tracking table
CREATE TABLE IF NOT EXISTS data_retention_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  data_category text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  retention_period_months integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  purged_at timestamp with time zone,
  purge_reason text,
  legal_basis text NOT NULL DEFAULT 'consent',
  metadata jsonb DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE data_retention_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for retention tracking
CREATE POLICY "Admins can manage retention tracking"
  ON data_retention_tracking FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create retention records"
  ON data_retention_tracking FOR INSERT
  WITH CHECK (true);

-- Create function to automatically set retention periods
CREATE OR REPLACE FUNCTION set_data_retention_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  retention_months integer;
  data_cat text;
BEGIN
  -- Determine data category and retention period based on table
  CASE TG_TABLE_NAME
    WHEN 'messages' THEN
      data_cat := 'communications';
      retention_months := 36; -- 3 years for communications
    WHEN 'discovery_calls' THEN
      data_cat := 'session_records';
      retention_months := 84; -- 7 years for session records
    WHEN 'client_onboarding_progress' THEN
      data_cat := 'client_data';
      retention_months := 60; -- 5 years for client progress
    WHEN 'coach_waitlists' THEN
      data_cat := 'marketing_data';
      retention_months := 24; -- 2 years for waitlist data
    ELSE
      data_cat := 'general';
      retention_months := 36; -- Default 3 years
  END CASE;

  -- Insert retention tracking record
  INSERT INTO data_retention_tracking (
    user_id,
    data_category,
    table_name,
    record_id,
    retention_period_months,
    expires_at,
    legal_basis
  ) VALUES (
    COALESCE(NEW.client_id, NEW.user_id, NEW.trainer_id),
    data_cat,
    TG_TABLE_NAME,
    NEW.id,
    retention_months,
    now() + make_interval(months => retention_months),
    'legitimate_interest'
  );

  RETURN NEW;
END;
$$;

-- Function to process DSAR requests
CREATE OR REPLACE FUNCTION process_dsar_request(
  p_request_id uuid,
  p_admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  request_record data_subject_access_requests;
  user_data jsonb := '{}';
  result jsonb;
BEGIN
  -- Only admins can process DSAR requests
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can process DSAR requests';
  END IF;

  -- Get the request
  SELECT * INTO request_record
  FROM data_subject_access_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DSAR request not found';
  END IF;

  -- Process based on request type
  CASE request_record.request_type
    WHEN 'access' THEN
      -- Compile all user data
      SELECT jsonb_build_object(
        'profile', (SELECT to_jsonb(p.*) FROM profiles p WHERE p.id = request_record.user_id),
        'conversations', (SELECT jsonb_agg(to_jsonb(c.*)) FROM conversations c WHERE c.client_id = request_record.user_id OR c.trainer_id = request_record.user_id),
        'messages', (SELECT jsonb_agg(to_jsonb(m.*)) FROM messages m JOIN conversations c ON c.id = m.conversation_id WHERE c.client_id = request_record.user_id OR c.trainer_id = request_record.user_id),
        'discovery_calls', (SELECT jsonb_agg(to_jsonb(dc.*)) FROM discovery_calls dc WHERE dc.client_id = request_record.user_id OR dc.trainer_id = request_record.user_id),
        'onboarding_progress', (SELECT jsonb_agg(to_jsonb(cop.*)) FROM client_onboarding_progress cop WHERE cop.client_id = request_record.user_id OR cop.trainer_id = request_record.user_id),
        'waitlist_entries', (SELECT jsonb_agg(to_jsonb(cw.*)) FROM coach_waitlists cw WHERE cw.client_id = request_record.user_id OR cw.coach_id = request_record.user_id),
        'analytics', (SELECT jsonb_agg(to_jsonb(ca.*)) FROM coach_analytics ca WHERE ca.trainer_id::uuid = request_record.user_id)
      ) INTO user_data;

    WHEN 'deletion' THEN
      -- Mark for deletion (actual deletion should be done carefully)
      UPDATE profiles SET
        account_status = 'deletion_requested',
        updated_at = now()
      WHERE id = request_record.user_id;

      user_data := jsonb_build_object('deletion_scheduled', true);

    WHEN 'portability' THEN
      -- Same as access but formatted for portability
      SELECT jsonb_build_object(
        'export_format', 'json',
        'export_date', now(),
        'data', user_data
      ) INTO user_data;

    WHEN 'rectification' THEN
      -- Handle data correction requests
      user_data := jsonb_build_object('rectification_notes', 'Manual review required');
  END CASE;

  -- Update request status
  UPDATE data_subject_access_requests
  SET
    status = 'completed',
    completed_at = now(),
    processed_by = p_admin_id,
    response_data = user_data,
    updated_at = now()
  WHERE id = p_request_id;

  -- Log the action
  PERFORM log_admin_action(
    request_record.user_id,
    'dsar_processed',
    jsonb_build_object(
      'request_type', request_record.request_type,
      'request_id', p_request_id
    ),
    'DSAR request processed'
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'data', user_data
  );
END;
$$;

-- Function to check accessibility compliance before publish
CREATE OR REPLACE FUNCTION check_accessibility_compliance(
  p_template_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  template_record onboarding_templates;
  accessibility_meta jsonb;
  required_checks text[] := ARRAY[
    'alt_texts_verified',
    'color_contrast_checked',
    'aria_labels_complete',
    'heading_structure_valid',
    'semantic_markup_verified'
  ];
  check_item text;
BEGIN
  -- Get template
  SELECT * INTO template_record
  FROM onboarding_templates
  WHERE id = p_template_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Skip if accessibility not required
  IF NOT template_record.accessibility_required THEN
    RETURN true;
  END IF;

  accessibility_meta := COALESCE(template_record.accessibility_metadata, '{}');

  -- Check all required accessibility items
  FOREACH check_item IN ARRAY required_checks LOOP
    IF NOT COALESCE((accessibility_meta->>check_item)::boolean, false) THEN
      RAISE NOTICE 'Accessibility check failed: %', check_item;
      RETURN false;
    END IF;
  END LOOP;

  -- Check minimum axe score
  IF COALESCE((accessibility_meta->>'axe_score')::numeric, 0) < 85.0 THEN
    RAISE NOTICE 'Accessibility score too low: %', accessibility_meta->>'axe_score';
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Add trigger to check accessibility before publish
CREATE OR REPLACE FUNCTION validate_accessibility_before_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If template is being published, check accessibility
  IF NEW.published_at IS NOT NULL AND OLD.published_at IS NULL THEN
    IF NOT check_accessibility_compliance(NEW.id) THEN
      RAISE EXCEPTION 'Template fails accessibility compliance checks. Cannot publish.';
    END IF;
    
    -- Mark as accessibility approved
    NEW.accessibility_approved := true;
    NEW.accessibility_approved_by := auth.uid();
    NEW.accessibility_approved_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_accessibility_on_publish ON onboarding_templates;
CREATE TRIGGER validate_accessibility_on_publish
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW
  EXECUTE FUNCTION validate_accessibility_before_publish();

-- Add updated_at triggers
CREATE TRIGGER update_dsar_updated_at
  BEFORE UPDATE ON data_subject_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_retention_tracking_updated_at
  BEFORE UPDATE ON data_retention_tracking
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();