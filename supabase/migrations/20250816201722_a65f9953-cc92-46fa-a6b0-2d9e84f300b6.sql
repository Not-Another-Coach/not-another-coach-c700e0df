-- Fix RLS policies for onboarding_first_week table to use correct template table
DROP POLICY IF EXISTS "Trainers can view their own first week tasks" ON public.onboarding_first_week;
DROP POLICY IF EXISTS "Trainers can create their own first week tasks" ON public.onboarding_first_week;
DROP POLICY IF EXISTS "Trainers can update their own first week tasks" ON public.onboarding_first_week;
DROP POLICY IF EXISTS "Trainers can delete their own first week tasks" ON public.onboarding_first_week;

-- Create corrected policies that reference the trainer_onboarding_templates table
CREATE POLICY "Trainers can view their own first week tasks" 
ON public.onboarding_first_week 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates 
  WHERE trainer_onboarding_templates.id = onboarding_first_week.template_id 
  AND trainer_onboarding_templates.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can create their own first week tasks" 
ON public.onboarding_first_week 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates 
  WHERE trainer_onboarding_templates.id = onboarding_first_week.template_id 
  AND trainer_onboarding_templates.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can update their own first week tasks" 
ON public.onboarding_first_week 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates 
  WHERE trainer_onboarding_templates.id = onboarding_first_week.template_id 
  AND trainer_onboarding_templates.trainer_id = auth.uid()
));

CREATE POLICY "Trainers can delete their own first week tasks" 
ON public.onboarding_first_week 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates 
  WHERE trainer_onboarding_templates.id = onboarding_first_week.template_id 
  AND trainer_onboarding_templates.trainer_id = auth.uid()
));