-- Create separate table for first week tasks
CREATE TABLE public.onboarding_first_week (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  rich_guidance TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  requires_attachment BOOLEAN NOT NULL DEFAULT false,
  attachment_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  max_attachments INTEGER DEFAULT 5,
  max_file_size_mb INTEGER DEFAULT 10,
  due_days INTEGER,
  sla_hours INTEGER DEFAULT 24,
  display_order INTEGER NOT NULL DEFAULT 0,
  activity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_first_week ENABLE ROW LEVEL SECURITY;

-- Create policies for first week tasks
CREATE POLICY "Trainers can view their own first week tasks" 
ON public.onboarding_first_week 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM onboarding_templates 
  WHERE onboarding_templates.id = onboarding_first_week.template_id 
  AND onboarding_templates.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can create their own first week tasks" 
ON public.onboarding_first_week 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM onboarding_templates 
  WHERE onboarding_templates.id = onboarding_first_week.template_id 
  AND onboarding_templates.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can update their own first week tasks" 
ON public.onboarding_first_week 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM onboarding_templates 
  WHERE onboarding_templates.id = onboarding_first_week.template_id 
  AND onboarding_templates.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can delete their own first week tasks" 
ON public.onboarding_first_week 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM onboarding_templates 
  WHERE onboarding_templates.id = onboarding_first_week.template_id 
  AND onboarding_templates.trainer_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_onboarding_first_week_updated_at
BEFORE UPDATE ON public.onboarding_first_week
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();