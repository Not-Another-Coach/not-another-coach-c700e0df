-- Create a public function to get all system default visibility settings
-- This is accessible to all users (no admin check) for system-wide visibility logic
CREATE OR REPLACE FUNCTION public.get_all_system_visibility_defaults()
RETURNS TABLE (
  content_type content_type,
  stage_group engagement_stage_group,
  visibility_state visibility_state
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return all system visibility defaults
  -- No admin check - this is public information needed for UI rendering
  RETURN QUERY
  SELECT 
    svd.content_type,
    svd.stage_group,
    svd.visibility_state
  FROM system_visibility_defaults svd
  ORDER BY svd.content_type, svd.stage_group;
END;
$$;

-- Grant execute permission to all users including anonymous
GRANT EXECUTE ON FUNCTION public.get_all_system_visibility_defaults() TO anon, authenticated;

COMMENT ON FUNCTION public.get_all_system_visibility_defaults() IS 
'Returns all system visibility defaults. Accessible to all users for rendering trainer profiles with proper visibility rules.';