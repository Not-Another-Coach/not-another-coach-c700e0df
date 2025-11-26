-- Remove anonymous_sessions table and related functionality
-- This feature is being removed as users must now authenticate before using the platform

-- Drop the cleanup function first (depends on table)
DROP FUNCTION IF EXISTS public.cleanup_expired_anonymous_sessions();

-- Drop the anonymous_sessions table
DROP TABLE IF EXISTS public.anonymous_sessions CASCADE;

-- Add comment documenting the removal
COMMENT ON SCHEMA public IS 
'Anonymous sessions feature removed 2025-01-26. Users must authenticate before accessing platform features.';