-- Fix the get_system_default_visibility function to return TEXT types instead of ENUM types
CREATE OR REPLACE FUNCTION get_system_default_visibility()
RETURNS TABLE (
  content_type TEXT,
  stage_group TEXT,
  visibility_state TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    svd.content_type::TEXT,
    svd.stage_group::TEXT,
    svd.visibility_state::TEXT
  FROM system_visibility_defaults svd
  ORDER BY svd.content_type, svd.stage_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;