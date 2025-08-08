-- Fix search_path warnings for the onboarding functions
CREATE OR REPLACE FUNCTION public.initialize_client_onboarding(p_client_id UUID, p_trainer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert onboarding steps for client based on trainer's template
  INSERT INTO public.client_onboarding_progress (
    client_id,
    trainer_id,
    template_step_id,
    step_name,
    step_type,
    description,
    instructions,
    requires_file_upload,
    completion_method,
    display_order
  )
  SELECT 
    p_client_id,
    p_trainer_id,
    t.id,
    t.step_name,
    t.step_type,
    t.description,
    t.instructions,
    t.requires_file_upload,
    t.completion_method,
    t.display_order
  FROM public.trainer_onboarding_templates t
  WHERE t.trainer_id = p_trainer_id 
    AND t.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.client_onboarding_progress p
      WHERE p.client_id = p_client_id 
        AND p.trainer_id = p_trainer_id 
        AND p.template_step_id = t.id
    )
  ORDER BY t.display_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_initialize_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When engagement becomes active_client, initialize onboarding
  IF NEW.stage = 'active_client' AND (OLD.stage IS NULL OR OLD.stage != 'active_client') THEN
    PERFORM public.initialize_client_onboarding(NEW.client_id, NEW.trainer_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_onboarding_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;