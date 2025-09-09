-- Create new types for grouped engagement stages
DO $$ BEGIN
    CREATE TYPE engagement_stage_group AS ENUM (
        'browsing',
        'liked', 
        'shortlisted',
        'discovery_process',
        'committed',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to map individual stages to groups
CREATE OR REPLACE FUNCTION public.get_stage_group_for_individual_stage(stage engagement_stage)
RETURNS engagement_stage_group
LANGUAGE plpgsql
IMMUTABLE
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

-- Create function to get all individual stages for a group
CREATE OR REPLACE FUNCTION public.get_individual_stages_for_group(stage_group engagement_stage_group)
RETURNS engagement_stage[]
LANGUAGE plpgsql
IMMUTABLE
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

-- Create function to get content visibility by group (applies to all individual stages in the group)
CREATE OR REPLACE FUNCTION public.get_content_visibility_by_group(
    p_trainer_id uuid,
    p_content_type content_type,
    p_stage_group engagement_stage_group
)
RETURNS visibility_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    individual_stages engagement_stage[];
    stage engagement_stage;
    visibility visibility_state;
BEGIN
    -- Get all individual stages for this group
    individual_stages := get_individual_stages_for_group(p_stage_group);
    
    -- Check the first stage in the group (they should all have the same setting)
    stage := individual_stages[1];
    
    -- Get visibility setting for this stage
    SELECT tvs.visibility_state INTO visibility
    FROM trainer_visibility_settings tvs
    WHERE tvs.trainer_id = p_trainer_id
        AND tvs.content_type = p_content_type
        AND tvs.engagement_stage = stage;
    
    -- If no setting found, return default based on content type
    IF visibility IS NULL THEN
        CASE p_content_type
            WHEN 'stats_ratings' THEN
                RETURN 'visible'::visibility_state; -- Always visible
            WHEN 'specializations', 'description_bio', 'certifications_qualifications', 'professional_journey', 'professional_milestones' THEN
                RETURN 'visible'::visibility_state; -- Default visible
            ELSE
                RETURN 'hidden'::visibility_state; -- Admin controllable, default hidden
        END CASE;
    END IF;
    
    RETURN visibility;
END;
$$;

-- Create function to update visibility for a group (applies to all individual stages in the group)
CREATE OR REPLACE FUNCTION public.update_visibility_for_group(
    p_trainer_id uuid,
    p_content_type content_type,
    p_stage_group engagement_stage_group,
    p_visibility_state visibility_state
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    individual_stages engagement_stage[];
    stage engagement_stage;
BEGIN
    -- Get all individual stages for this group
    individual_stages := get_individual_stages_for_group(p_stage_group);
    
    -- Update visibility for each individual stage in the group
    FOREACH stage IN ARRAY individual_stages LOOP
        INSERT INTO trainer_visibility_settings (trainer_id, content_type, engagement_stage, visibility_state)
        VALUES (p_trainer_id, p_content_type, stage, p_visibility_state)
        ON CONFLICT (trainer_id, content_type, engagement_stage)
        DO UPDATE SET 
            visibility_state = p_visibility_state,
            updated_at = now();
    END LOOP;
END;
$$;