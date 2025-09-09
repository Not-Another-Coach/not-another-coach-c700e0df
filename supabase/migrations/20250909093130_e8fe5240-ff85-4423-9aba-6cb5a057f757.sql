-- Create the missing get_system_default_visibility RPC function
CREATE OR REPLACE FUNCTION get_system_default_visibility()
RETURNS TABLE (
  content_type TEXT,
  stage_group TEXT,
  visibility_state TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    svd.content_type,
    svd.stage_group,
    svd.visibility_state
  FROM system_visibility_defaults svd
  ORDER BY svd.content_type, svd.stage_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;