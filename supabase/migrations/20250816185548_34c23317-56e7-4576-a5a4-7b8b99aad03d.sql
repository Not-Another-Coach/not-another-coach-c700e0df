-- Create template assignments table to track which templates are assigned to clients
CREATE TABLE public.client_template_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_base_id UUID NULL, -- Reference to the original template if applicable
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  expired_at TIMESTAMP WITH TIME ZONE NULL,
  removed_at TIMESTAMP WITH TIME ZONE NULL,
  removed_by UUID NULL,
  assignment_notes TEXT NULL,
  expiry_reason TEXT NULL,
  removal_reason TEXT NULL,
  correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_template_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clients can view their own template assignments" 
ON public.client_template_assignments 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Trainers can manage their clients' template assignments" 
ON public.client_template_assignments 
FOR ALL 
USING (auth.uid() = trainer_id);

CREATE POLICY "System can create template assignments" 
ON public.client_template_assignments 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_client_template_assignments_client_trainer ON public.client_template_assignments(client_id, trainer_id);
CREATE INDEX idx_client_template_assignments_status ON public.client_template_assignments(status);

-- Add reference to assignment in onboarding progress
ALTER TABLE public.client_onboarding_progress 
ADD COLUMN assignment_id UUID REFERENCES public.client_template_assignments(id);

-- Create function to enforce only one active template per client
CREATE OR REPLACE FUNCTION public.enforce_single_active_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting a new active template, expire any existing active templates for this client
  IF NEW.status = 'active' THEN
    UPDATE public.client_template_assignments
    SET 
      status = 'expired',
      expired_at = now(),
      expiry_reason = 'Automatically expired due to new template assignment',
      updated_at = now()
    WHERE client_id = NEW.client_id 
      AND trainer_id = NEW.trainer_id
      AND status = 'active'
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce single active template
CREATE TRIGGER enforce_single_active_template_trigger
  BEFORE INSERT OR UPDATE ON public.client_template_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_active_template();

-- Update existing onboarding progress records to link to template assignments
-- First, create assignment records for existing progress items grouped by correlation_id
INSERT INTO public.client_template_assignments (client_id, trainer_id, template_name, assigned_at, correlation_id)
SELECT DISTINCT 
  client_id,
  trainer_id,
  step_name || ' Template',
  created_at,
  correlation_id
FROM public.client_onboarding_progress 
WHERE correlation_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update progress records to reference their assignments
UPDATE public.client_onboarding_progress 
SET assignment_id = (
  SELECT cta.id 
  FROM public.client_template_assignments cta 
  WHERE cta.client_id = client_onboarding_progress.client_id 
    AND cta.trainer_id = client_onboarding_progress.trainer_id
    AND cta.correlation_id = client_onboarding_progress.correlation_id
)
WHERE correlation_id IS NOT NULL AND assignment_id IS NULL;