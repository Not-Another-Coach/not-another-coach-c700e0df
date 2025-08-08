-- Enhanced function to initialize client onboarding from trainer's Ways of Working
CREATE OR REPLACE FUNCTION public.initialize_client_onboarding_from_ways_of_working(p_client_id UUID, p_trainer_id UUID, p_package_id TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trainer_profile RECORD;
  onboarding_items JSONB;
  first_week_items JSONB;
  ongoing_items JSONB;
  tracking_items JSONB;
  expectations_items JSONB;
  what_i_bring_items JSONB;
  item JSONB;
  step_order INTEGER := 1;
BEGIN
  -- Get trainer's Ways of Working data
  SELECT 
    ways_of_working_onboarding,
    ways_of_working_first_week,
    ways_of_working_ongoing_structure,
    ways_of_working_tracking_tools,
    ways_of_working_client_expectations,
    ways_of_working_what_i_bring,
    package_options
  INTO trainer_profile
  FROM public.profiles
  WHERE id = p_trainer_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Initialize arrays for different sections
  onboarding_items := COALESCE(trainer_profile.ways_of_working_onboarding, '[]'::jsonb);
  first_week_items := COALESCE(trainer_profile.ways_of_working_first_week, '[]'::jsonb);
  ongoing_items := COALESCE(trainer_profile.ways_of_working_ongoing_structure, '[]'::jsonb);
  tracking_items := COALESCE(trainer_profile.ways_of_working_tracking_tools, '[]'::jsonb);
  expectations_items := COALESCE(trainer_profile.ways_of_working_client_expectations, '[]'::jsonb);
  what_i_bring_items := COALESCE(trainer_profile.ways_of_working_what_i_bring, '[]'::jsonb);

  -- Process Onboarding items
  FOR item IN SELECT * FROM jsonb_array_elements(onboarding_items)
  LOOP
    INSERT INTO public.client_onboarding_progress (
      client_id, trainer_id, step_name, step_type, description,
      completion_method, display_order, requires_file_upload
    ) VALUES (
      p_client_id, p_trainer_id,
      COALESCE(item->>'text', item->>'name', 'Onboarding Step'),
      'mandatory',
      'Complete this onboarding step to get started with your training journey.',
      'client',
      step_order,
      CASE WHEN (item->>'text' ILIKE '%photo%' OR item->>'text' ILIKE '%document%' OR item->>'text' ILIKE '%form%') 
           THEN true ELSE false END
    )
    ON CONFLICT (client_id, trainer_id, template_step_id) DO NOTHING;
    
    step_order := step_order + 1;
  END LOOP;

  -- Process First Week items
  FOR item IN SELECT * FROM jsonb_array_elements(first_week_items)
  LOOP
    INSERT INTO public.client_onboarding_progress (
      client_id, trainer_id, step_name, step_type, description,
      completion_method, display_order, requires_file_upload
    ) VALUES (
      p_client_id, p_trainer_id,
      COALESCE(item->>'text', item->>'name', 'First Week Activity'),
      'mandatory',
      'This will be completed during your first week of training.',
      CASE WHEN (item->>'text' ILIKE '%call%' OR item->>'text' ILIKE '%session%') 
           THEN 'trainer' ELSE 'client' END,
      step_order,
      false
    )
    ON CONFLICT (client_id, trainer_id, template_step_id) DO NOTHING;
    
    step_order := step_order + 1;
  END LOOP;

  -- Process Ongoing Structure items (optional)
  FOR item IN SELECT * FROM jsonb_array_elements(ongoing_items)
  LOOP
    INSERT INTO public.client_onboarding_progress (
      client_id, trainer_id, step_name, step_type, description,
      completion_method, display_order, requires_file_upload
    ) VALUES (
      p_client_id, p_trainer_id,
      COALESCE(item->>'text', item->>'name', 'Ongoing Process'),
      'optional',
      'Part of the ongoing training structure - will be set up as needed.',
      'trainer',
      step_order,
      false
    )
    ON CONFLICT (client_id, trainer_id, template_step_id) DO NOTHING;
    
    step_order := step_order + 1;
  END LOOP;

  -- Add tracking tools setup
  IF jsonb_array_length(tracking_items) > 0 THEN
    INSERT INTO public.client_onboarding_progress (
      client_id, trainer_id, step_name, step_type, description,
      completion_method, display_order, requires_file_upload
    ) VALUES (
      p_client_id, p_trainer_id,
      'Set Up Tracking Tools',
      'mandatory',
      'Configure the tracking tools and platforms we''ll use: ' || 
      (SELECT string_agg(item->>'text', ', ') FROM jsonb_array_elements(tracking_items) item),
      'trainer',
      step_order,
      false
    )
    ON CONFLICT (client_id, trainer_id, template_step_id) DO NOTHING;
    
    step_order := step_order + 1;
  END IF;

  -- Add expectations review
  IF jsonb_array_length(expectations_items) > 0 THEN
    INSERT INTO public.client_onboarding_progress (
      client_id, trainer_id, step_name, step_type, description,
      completion_method, display_order, requires_file_upload
    ) VALUES (
      p_client_id, p_trainer_id,
      'Review Client Expectations',
      'mandatory',
      'Review and acknowledge the expectations: ' || 
      (SELECT string_agg(item->>'text', ', ') FROM jsonb_array_elements(expectations_items) item),
      'client',
      step_order,
      false
    )
    ON CONFLICT (client_id, trainer_id, template_step_id) DO NOTHING;
    
    step_order := step_order + 1;
  END IF;

  -- Add package-specific steps if package ID is provided
  IF p_package_id IS NOT NULL THEN
    -- Look for package-specific ways of working
    SELECT * FROM public.package_ways_of_working
    WHERE trainer_id = p_trainer_id AND package_id = p_package_id
    LIMIT 1;
    
    -- Add package-specific onboarding if found
    -- This could be enhanced further based on package_ways_of_working table
  END IF;

END;
$$;

-- Update the auto-initialization trigger to use the enhanced function
CREATE OR REPLACE FUNCTION public.auto_initialize_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_package_id TEXT;
BEGIN
  -- When engagement becomes active_client, initialize onboarding
  IF NEW.stage = 'active_client' AND (OLD.stage IS NULL OR OLD.stage != 'active_client') THEN
    
    -- Try to get package ID from coach selection request
    SELECT package_id INTO client_package_id
    FROM public.coach_selection_requests
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id
      AND status = 'accepted'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- First try to initialize from Ways of Working
    PERFORM public.initialize_client_onboarding_from_ways_of_working(
      NEW.client_id, 
      NEW.trainer_id, 
      client_package_id
    );
    
    -- If no Ways of Working items were created, fall back to templates
    IF NOT EXISTS (
      SELECT 1 FROM public.client_onboarding_progress 
      WHERE client_id = NEW.client_id AND trainer_id = NEW.trainer_id
    ) THEN
      PERFORM public.initialize_client_onboarding(NEW.client_id, NEW.trainer_id);
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;