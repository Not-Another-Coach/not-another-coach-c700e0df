-- Create table to store system default visibility settings
CREATE TABLE IF NOT EXISTS public.system_visibility_defaults (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type content_type NOT NULL,
    stage_group engagement_stage_group NOT NULL,
    visibility_state visibility_state NOT NULL DEFAULT 'hidden',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    UNIQUE(content_type, stage_group)
);

-- Enable RLS
ALTER TABLE public.system_visibility_defaults ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage system visibility defaults" 
ON public.system_visibility_defaults 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view system visibility defaults" 
ON public.system_visibility_defaults 
FOR SELECT 
USING (true);

-- Create function to get system default visibility
CREATE OR REPLACE FUNCTION public.get_system_default_visibility(
    p_content_type content_type,
    p_stage_group engagement_stage_group
)
RETURNS visibility_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    default_visibility visibility_state;
BEGIN
    -- Get stored default
    SELECT visibility_state INTO default_visibility
    FROM system_visibility_defaults
    WHERE content_type = p_content_type
        AND stage_group = p_stage_group;
    
    -- If no stored default, return hardcoded defaults
    IF default_visibility IS NULL THEN
        CASE p_content_type
            WHEN 'stats_ratings' THEN
                RETURN 'visible'::visibility_state; -- Always visible
            WHEN 'specializations', 'description_bio', 'certifications_qualifications', 'professional_journey', 'professional_milestones' THEN
                RETURN 'visible'::visibility_state; -- Default visible
            ELSE
                -- Admin controllable defaults based on stage group
                CASE p_stage_group
                    WHEN 'committed' THEN
                        RETURN 'visible'::visibility_state;
                    WHEN 'browsing' THEN
                        IF p_content_type IN ('profile_image', 'basic_information', 'pricing_discovery_call') THEN
                            RETURN 'visible'::visibility_state;
                        ELSE
                            RETURN 'blurred'::visibility_state;
                        END IF;
                    WHEN 'shortlisted', 'discovery_process' THEN
                        IF p_content_type = 'testimonial_images' THEN
                            RETURN 'visible'::visibility_state;
                        ELSE
                            RETURN 'blurred'::visibility_state;
                        END IF;
                    ELSE
                        RETURN 'hidden'::visibility_state;
                END CASE;
        END CASE;
    END IF;
    
    RETURN default_visibility;
END;
$$;

-- Create function to save system default visibility
CREATE OR REPLACE FUNCTION public.save_system_default_visibility(
    p_content_type content_type,
    p_stage_group engagement_stage_group,
    p_visibility_state visibility_state
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only admins can save system defaults
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can save system defaults';
    END IF;

    INSERT INTO system_visibility_defaults (content_type, stage_group, visibility_state, created_by)
    VALUES (p_content_type, p_stage_group, p_visibility_state, auth.uid())
    ON CONFLICT (content_type, stage_group)
    DO UPDATE SET 
        visibility_state = p_visibility_state,
        updated_at = now();
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_system_visibility_defaults_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_system_visibility_defaults_updated_at
    BEFORE UPDATE ON public.system_visibility_defaults
    FOR EACH ROW
    EXECUTE FUNCTION public.update_system_visibility_defaults_updated_at();