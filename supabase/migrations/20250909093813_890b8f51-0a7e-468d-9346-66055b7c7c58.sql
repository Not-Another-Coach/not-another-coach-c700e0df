-- Drop all versions of the conflicting functions and recreate them with consistent TEXT types
DROP FUNCTION IF EXISTS get_content_visibility_by_group(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_content_visibility_by_group(UUID, content_type, engagement_stage_group);
DROP FUNCTION IF EXISTS get_content_visibility(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_content_visibility(UUID, content_type, engagement_stage);

-- Recreate the functions with TEXT parameters only
CREATE OR REPLACE FUNCTION get_content_visibility_by_group(
  p_trainer_id UUID,
  p_content_type TEXT,
  p_stage_group TEXT
) RETURNS TEXT AS $$
DECLARE
  v_visibility_state TEXT;
BEGIN
  -- Only get system default visibility, ignore trainer-specific settings
  SELECT visibility_state::TEXT
  INTO v_visibility_state
  FROM system_visibility_defaults
  WHERE content_type::TEXT = p_content_type 
    AND stage_group::TEXT = p_stage_group;
  
  -- Return system default or 'hidden' if no default found
  RETURN COALESCE(v_visibility_state, 'hidden');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the single stage function with TEXT parameters
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
  SELECT visibility_state::TEXT
  INTO v_visibility_state
  FROM system_visibility_defaults
  WHERE content_type::TEXT = p_content_type 
    AND stage_group::TEXT = v_stage_group;
  
  -- Return system default or 'hidden' if no default found
  RETURN COALESCE(v_visibility_state, 'hidden');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;