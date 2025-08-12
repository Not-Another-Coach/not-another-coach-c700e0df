-- Add the remaining functions for Phase 5 with proper search_path

-- Function to evaluate conditional logic
CREATE OR REPLACE FUNCTION evaluate_conditional_step(
  p_template_id uuid,
  p_client_id uuid,
  p_step_id text,
  p_client_data jsonb DEFAULT '{}'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  template_record onboarding_templates;
  conditional_rules jsonb;
  rule jsonb;
  condition_met boolean := true;
  rule_result boolean;
BEGIN
  -- Get template with conditional logic
  SELECT * INTO template_record
  FROM onboarding_templates
  WHERE id = p_template_id;

  IF NOT FOUND THEN
    RETURN true; -- Default to visible if template not found
  END IF;

  conditional_rules := template_record.conditional_logic->'rules';
  
  -- If no rules, step is always visible
  IF conditional_rules IS NULL OR jsonb_array_length(conditional_rules) = 0 THEN
    RETURN true;
  END IF;

  -- Evaluate each rule for this step
  FOR rule IN SELECT jsonb_array_elements(conditional_rules)
  LOOP
    -- Skip if rule doesn't apply to this step
    IF NOT (rule->>'step_id' = p_step_id) THEN
      CONTINUE;
    END IF;

    -- Evaluate rule condition
    CASE rule->>'condition_type'
      WHEN 'package_type' THEN
        rule_result := (p_client_data->>'package_type' = rule->>'expected_value');
      WHEN 'previous_answer' THEN
        rule_result := (p_client_data->(rule->>'field_name') = rule->'expected_value');
      WHEN 'step_completed' THEN
        rule_result := EXISTS (
          SELECT 1 FROM client_onboarding_progress cop
          WHERE cop.client_id = p_client_id 
            AND cop.template_step_id::text = rule->>'dependency_step_id'
            AND cop.status = 'completed'
        );
      ELSE
        rule_result := true; -- Unknown condition type defaults to true
    END CASE;

    -- Apply rule operator (AND/OR)
    IF rule->>'operator' = 'OR' THEN
      condition_met := condition_met OR rule_result;
    ELSE -- Default to AND
      condition_met := condition_met AND rule_result;
    END IF;
  END LOOP;

  -- Store evaluation result
  INSERT INTO onboarding_conditional_evaluations (
    client_id, template_id, step_id, condition_result, evaluation_data
  ) VALUES (
    p_client_id, p_template_id, p_step_id, condition_met, 
    jsonb_build_object('client_data', p_client_data, 'rules_evaluated', conditional_rules)
  )
  ON CONFLICT (client_id, template_id, step_id)
  DO UPDATE SET
    condition_result = condition_met,
    evaluation_data = EXCLUDED.evaluation_data,
    evaluated_at = now();

  RETURN condition_met;
END;
$$;

-- Function to create template version
CREATE OR REPLACE FUNCTION create_template_version(
  p_template_id uuid,
  p_changelog text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  template_record onboarding_templates;
  version_id uuid;
  next_version integer;
BEGIN
  -- Only template owners can create versions
  SELECT * INTO template_record
  FROM onboarding_templates
  WHERE id = p_template_id AND trainer_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or unauthorized';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM onboarding_template_versions
  WHERE template_id = p_template_id;

  -- Mark all previous versions as not current
  UPDATE onboarding_template_versions
  SET is_current = false
  WHERE template_id = p_template_id;

  -- Create new version
  INSERT INTO onboarding_template_versions (
    template_id,
    version_number,
    template_data,
    changelog,
    created_by,
    is_current
  ) VALUES (
    p_template_id,
    next_version,
    to_jsonb(template_record),
    p_changelog,
    auth.uid(),
    true
  )
  RETURNING id INTO version_id;

  -- Update template version number
  UPDATE onboarding_templates
  SET version_number = next_version
  WHERE id = p_template_id;

  RETURN version_id;
END;
$$;

-- Function to update template analytics
CREATE OR REPLACE FUNCTION update_template_analytics(
  p_template_id uuid,
  p_metric_type text,
  p_increment integer DEFAULT 1,
  p_metric_data jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trainer_record uuid;
BEGIN
  -- Get trainer from template
  SELECT trainer_id INTO trainer_record
  FROM onboarding_templates
  WHERE id = p_template_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Update or insert analytics
  INSERT INTO onboarding_template_analytics (
    template_id, trainer_id, metric_type, metric_value, metric_data
  ) VALUES (
    p_template_id, trainer_record, p_metric_type, p_increment, p_metric_data
  )
  ON CONFLICT (template_id, trainer_id, metric_type, date_recorded)
  DO UPDATE SET
    metric_value = onboarding_template_analytics.metric_value + p_increment,
    metric_data = EXCLUDED.metric_data,
    updated_at = now();
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_template_analytics_updated_at
  BEFORE UPDATE ON onboarding_template_analytics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_bulk_operations_updated_at
  BEFORE UPDATE ON onboarding_bulk_operations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger to track template usage
CREATE OR REPLACE FUNCTION track_template_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Track template assignment
  IF TG_OP = 'INSERT' AND NEW.template_step_id IS NOT NULL THEN
    PERFORM update_template_analytics(
      (SELECT template_id FROM onboarding_template_sections WHERE id = NEW.template_step_id),
      'assignment',
      1,
      jsonb_build_object('client_id', NEW.client_id, 'step_type', NEW.step_type)
    );
  END IF;

  -- Track step completion
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM update_template_analytics(
      (SELECT template_id FROM onboarding_template_sections WHERE id = NEW.template_step_id),
      'step_completion',
      1,
      jsonb_build_object('client_id', NEW.client_id, 'completion_method', NEW.completion_method)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the usage tracking trigger
CREATE TRIGGER track_onboarding_template_usage
  AFTER INSERT OR UPDATE ON client_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION track_template_usage();