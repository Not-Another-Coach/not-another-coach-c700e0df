-- Create onboarding step templates for trainers
CREATE TABLE public.trainer_onboarding_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL DEFAULT 'mandatory', -- 'mandatory' or 'optional'
  description TEXT,
  instructions TEXT,
  requires_file_upload BOOLEAN NOT NULL DEFAULT false,
  completion_method TEXT NOT NULL DEFAULT 'client', -- 'client', 'trainer', 'auto'
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client onboarding progress tracking
CREATE TABLE public.client_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  template_step_id UUID REFERENCES public.trainer_onboarding_templates(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL, -- Copied from template for customization
  step_type TEXT NOT NULL DEFAULT 'mandatory',
  description TEXT,
  instructions TEXT,
  requires_file_upload BOOLEAN NOT NULL DEFAULT false,
  completion_method TEXT NOT NULL DEFAULT 'client',
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'skipped'
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID, -- who marked it complete
  completion_notes TEXT,
  uploaded_file_url TEXT,
  trainer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, trainer_id, template_step_id)
);

-- Enable RLS
ALTER TABLE public.trainer_onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_onboarding_templates
CREATE POLICY "Trainers can manage their own templates" 
ON public.trainer_onboarding_templates 
FOR ALL 
USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can view their trainer's templates" 
ON public.trainer_onboarding_templates 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.client_trainer_engagement 
  WHERE client_id = auth.uid() 
    AND trainer_id = trainer_onboarding_templates.trainer_id 
    AND stage = 'active_client'
));

-- RLS Policies for client_onboarding_progress
CREATE POLICY "Clients can view their own progress" 
ON public.client_onboarding_progress 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can update their own progress" 
ON public.client_onboarding_progress 
FOR UPDATE 
USING (auth.uid() = client_id AND completion_method = 'client');

CREATE POLICY "Trainers can manage their clients' progress" 
ON public.client_onboarding_progress 
FOR ALL 
USING (auth.uid() = trainer_id);

CREATE POLICY "System can create progress records" 
ON public.client_onboarding_progress 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_trainer_onboarding_templates_trainer_id ON public.trainer_onboarding_templates(trainer_id);
CREATE INDEX idx_trainer_onboarding_templates_display_order ON public.trainer_onboarding_templates(trainer_id, display_order);
CREATE INDEX idx_client_onboarding_progress_client_trainer ON public.client_onboarding_progress(client_id, trainer_id);
CREATE INDEX idx_client_onboarding_progress_display_order ON public.client_onboarding_progress(client_id, trainer_id, display_order);

-- Function to initialize client onboarding from trainer template
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

-- Function to auto-initialize onboarding when client becomes active
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

-- Create trigger for auto-initialization
CREATE TRIGGER trigger_auto_initialize_onboarding
  AFTER INSERT OR UPDATE ON public.client_trainer_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_initialize_onboarding();

-- Function to update updated_at timestamp
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

-- Create triggers for updated_at
CREATE TRIGGER trigger_trainer_onboarding_templates_updated_at
  BEFORE UPDATE ON public.trainer_onboarding_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_updated_at();

CREATE TRIGGER trigger_client_onboarding_progress_updated_at
  BEFORE UPDATE ON public.client_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_updated_at();