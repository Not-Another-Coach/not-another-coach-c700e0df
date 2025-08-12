-- Phase 5: Advanced Template Features

-- Add conditional logic fields to onboarding templates
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS conditional_logic jsonb DEFAULT '{"rules": [], "dependencies": {}}'::jsonb;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS package_type_restrictions text[] DEFAULT '{}';
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS parent_template_id uuid;
ALTER TABLE onboarding_templates ADD COLUMN IF NOT EXISTS is_version boolean DEFAULT false;

-- Create template analytics table
CREATE TABLE IF NOT EXISTS onboarding_template_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('usage', 'completion', 'assignment', 'step_completion')),
  metric_value integer DEFAULT 0,
  metric_data jsonb DEFAULT '{}',
  date_recorded date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(template_id, trainer_id, metric_type, date_recorded)
);

-- Create template versions table
CREATE TABLE IF NOT EXISTS onboarding_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  template_data jsonb NOT NULL,
  changelog text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_current boolean DEFAULT false,
  UNIQUE(template_id, version_number)
);

-- Create bulk operations queue table
CREATE TABLE IF NOT EXISTS onboarding_bulk_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL CHECK (operation_type IN ('assign_template', 'update_steps', 'bulk_complete', 'bulk_update')),
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL,
  target_clients uuid[] NOT NULL,
  operation_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_count integer DEFAULT 0,
  total_count integer NOT NULL,
  error_log text[],
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create conditional step evaluations table
CREATE TABLE IF NOT EXISTS onboarding_conditional_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  condition_result boolean NOT NULL,
  evaluation_data jsonb DEFAULT '{}',
  evaluated_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, template_id, step_id)
);

-- Enable RLS on new tables
ALTER TABLE onboarding_template_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_conditional_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics
CREATE POLICY "Trainers can view their own template analytics"
  ON onboarding_template_analytics FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "System can create analytics records"
  ON onboarding_template_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics records"
  ON onboarding_template_analytics FOR UPDATE
  USING (true);

-- RLS policies for versions
CREATE POLICY "Trainers can view their template versions"
  ON onboarding_template_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create template versions"
  ON onboarding_template_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

-- RLS policies for bulk operations
CREATE POLICY "Trainers can manage their bulk operations"
  ON onboarding_bulk_operations FOR ALL
  USING (auth.uid() = trainer_id);

-- RLS policies for conditional evaluations
CREATE POLICY "Clients can view their evaluations"
  ON onboarding_conditional_evaluations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view client evaluations"
  ON onboarding_conditional_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_templates ot
      WHERE ot.id = template_id AND ot.trainer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage evaluations"
  ON onboarding_conditional_evaluations FOR ALL
  USING (true);

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

-- Function to process bulk operations
CREATE OR REPLACE FUNCTION process_bulk_operation(
  p_operation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  operation_record onboarding_bulk_operations;
  client_id uuid;
  success_count integer := 0;
  error_count integer := 0;
  errors text[] := '{}';
BEGIN
  -- Get operation
  SELECT * INTO operation_record
  FROM onboarding_bulk_operations
  WHERE id = p_operation_id AND trainer_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Operation not found or unauthorized';
  END IF;

  -- Update status to processing
  UPDATE onboarding_bulk_operations
  SET status = 'processing', started_at = now()
  WHERE id = p_operation_id;

  -- Process each target client
  FOREACH client_id IN ARRAY operation_record.target_clients
  LOOP
    BEGIN
      CASE operation_record.operation_type
        WHEN 'assign_template' THEN
          -- Create onboarding steps from template
          PERFORM create_onboarding_steps_from_templates(client_id);
          
        WHEN 'bulk_complete' THEN
          -- Mark specified steps as completed
          UPDATE client_onboarding_progress
          SET status = 'completed', completed_at = now(), completed_by = auth.uid()
          WHERE client_id = client_id
            AND trainer_id = operation_record.trainer_id
            AND step_name = ANY((operation_record.operation_data->>'step_names')::text[]);
            
        WHEN 'bulk_update' THEN
          -- Update step properties
          UPDATE client_onboarding_progress
          SET 
            instructions = COALESCE(operation_record.operation_data->>'instructions', instructions),
            description = COALESCE(operation_record.operation_data->>'description', description),
            trainer_notes = COALESCE(operation_record.operation_data->>'trainer_notes', trainer_notes)
          WHERE client_id = client_id
            AND trainer_id = operation_record.trainer_id;
      END CASE;

      success_count := success_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        errors := array_append(errors, 'Client ' || client_id || ': ' || SQLERRM);
    END;

    -- Update progress
    UPDATE onboarding_bulk_operations
    SET progress_count = success_count + error_count
    WHERE id = p_operation_id;
  END LOOP;

  -- Complete operation
  UPDATE onboarding_bulk_operations
  SET 
    status = CASE WHEN error_count = 0 THEN 'completed' ELSE 'failed' END,
    completed_at = now(),
    error_log = errors
  WHERE id = p_operation_id;
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