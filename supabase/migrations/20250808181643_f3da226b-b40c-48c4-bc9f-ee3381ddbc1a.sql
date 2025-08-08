-- Create the trainer_onboarding_activities table
CREATE TABLE public.trainer_onboarding_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  requires_file_upload BOOLEAN NOT NULL DEFAULT false,
  completion_method TEXT NOT NULL DEFAULT 'client',
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for template-activity relationships
CREATE TABLE public.template_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.trainer_onboarding_templates(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.trainer_onboarding_activities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, activity_id)
);

-- Add activity_id column to client_onboarding_progress
ALTER TABLE public.client_onboarding_progress 
ADD COLUMN activity_id UUID REFERENCES public.trainer_onboarding_activities(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.trainer_onboarding_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_onboarding_activities
CREATE POLICY "Trainers can manage their own activities" 
  ON public.trainer_onboarding_activities 
  FOR ALL 
  USING (auth.uid() = trainer_id);

-- RLS Policies for template_activities  
CREATE POLICY "Trainers can manage their template-activity relationships" 
  ON public.template_activities 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.trainer_onboarding_templates t 
      WHERE t.id = template_activities.template_id 
      AND t.trainer_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_trainer_onboarding_activities_trainer_id ON public.trainer_onboarding_activities(trainer_id);
CREATE INDEX idx_template_activities_template_id ON public.template_activities(template_id);
CREATE INDEX idx_template_activities_activity_id ON public.template_activities(activity_id);
CREATE INDEX idx_client_onboarding_progress_activity_id ON public.client_onboarding_progress(activity_id);

-- Create updated_at trigger for trainer_onboarding_activities
CREATE OR REPLACE FUNCTION public.update_trainer_onboarding_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_onboarding_activities_updated_at
  BEFORE UPDATE ON public.trainer_onboarding_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trainer_onboarding_activities_updated_at();