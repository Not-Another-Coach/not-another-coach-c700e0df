-- Update the function to only use system defaults, ignoring trainer-specific settings
CREATE OR REPLACE FUNCTION get_content_visibility_by_group(
  p_trainer_id UUID,
  p_content_type TEXT,
  p_stage_group TEXT
) RETURNS TEXT AS $$
DECLARE
  v_visibility_state TEXT;
BEGIN
  -- Only get system default visibility, ignore trainer-specific settings
  SELECT visibility_state 
  INTO v_visibility_state
  FROM system_visibility_defaults
  WHERE content_type = p_content_type 
    AND stage_group = p_stage_group;
  
  -- Return system default or 'hidden' if no default found
  RETURN COALESCE(v_visibility_state, 'hidden');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the single stage function to only use system defaults
CREATE OR REPLACE FUNCTION get_content_visibility(
  p_trainer_id UUID,
  p_content_type TEXT,
  p_engagement_stage TEXT
) RETURNS TEXT AS $$
DECLARE
  v_stage_group TEXT;
  v_visibility_state TEXT;
BEGIN
  -- Map engagement stage to stage group
  CASE p_engagement_stage
    WHEN 'browsing' THEN v_stage_group := 'exploration';
    WHEN 'interested' THEN v_stage_group := 'exploration';
    WHEN 'matched' THEN v_stage_group := 'consideration';
    WHEN 'agreed' THEN v_stage_group := 'consideration';
    WHEN 'contracted' THEN v_stage_group := 'engagement';
    WHEN 'active' THEN v_stage_group := 'engagement';
    ELSE v_stage_group := 'exploration';
  END CASE;
  
  -- Only get system default visibility
  SELECT visibility_state 
  INTO v_visibility_state
  FROM system_visibility_defaults
  WHERE content_type = p_content_type 
    AND stage_group = v_stage_group;
  
  -- Return system default or 'hidden' if no default found
  RETURN COALESCE(v_visibility_state, 'hidden');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;