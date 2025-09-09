-- Fix security issues by updating functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_stage_group_for_individual_stage(stage engagement_stage)
RETURNS engagement_stage_group
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    CASE stage
        WHEN 'browsing' THEN
            RETURN 'browsing'::engagement_stage_group;
        WHEN 'liked' THEN
            RETURN 'liked'::engagement_stage_group;
        WHEN 'shortlisted' THEN
            RETURN 'shortlisted'::engagement_stage_group;
        WHEN 'getting_to_know_your_coach', 'discovery_in_progress', 'matched' THEN
            RETURN 'discovery_process'::engagement_stage_group;
        WHEN 'discovery_completed', 'agreed', 'payment_pending', 'active_client' THEN
            RETURN 'committed'::engagement_stage_group;
        WHEN 'unmatched', 'declined', 'declined_dismissed' THEN
            RETURN 'rejected'::engagement_stage_group;
        ELSE
            RETURN 'browsing'::engagement_stage_group; -- fallback
    END CASE;
END;
$$;

-- Fix second function 
CREATE OR REPLACE FUNCTION public.get_individual_stages_for_group(stage_group engagement_stage_group)
RETURNS engagement_stage[]
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    CASE stage_group
        WHEN 'browsing' THEN
            RETURN ARRAY['browsing'::engagement_stage];
        WHEN 'liked' THEN
            RETURN ARRAY['liked'::engagement_stage];
        WHEN 'shortlisted' THEN
            RETURN ARRAY['shortlisted'::engagement_stage];
        WHEN 'discovery_process' THEN
            RETURN ARRAY['getting_to_know_your_coach'::engagement_stage, 'discovery_in_progress'::engagement_stage, 'matched'::engagement_stage];
        WHEN 'committed' THEN
            RETURN ARRAY['discovery_completed'::engagement_stage, 'agreed'::engagement_stage, 'payment_pending'::engagement_stage, 'active_client'::engagement_stage];
        WHEN 'rejected' THEN
            RETURN ARRAY['unmatched'::engagement_stage, 'declined'::engagement_stage, 'declined_dismissed'::engagement_stage];
        ELSE
            RETURN ARRAY['browsing'::engagement_stage]; -- fallback
    END CASE;
END;
$$;