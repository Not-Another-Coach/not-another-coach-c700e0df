-- Add profile section mapping to ways of working categories
ALTER TABLE public.ways_of_working_categories 
ADD COLUMN profile_section_key text;

-- Create template sections table to make template sections configurable
CREATE TABLE public.ways_of_working_template_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  section_name text NOT NULL,
  profile_section_key text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ways_of_working_template_sections ENABLE ROW LEVEL SECURITY;

-- RLS policies for template sections
CREATE POLICY "Admins can manage template sections" 
ON public.ways_of_working_template_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active template sections" 
ON public.ways_of_working_template_sections 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_template_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_sections_updated_at
BEFORE UPDATE ON public.ways_of_working_template_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_template_sections_updated_at();

-- Insert the current 6 hardcoded template sections mapped to the 3 profile sections
INSERT INTO public.ways_of_working_template_sections (section_key, section_name, profile_section_key, display_order) VALUES
('onboarding', 'Onboarding & Welcome', 'onboarding', 1),
('first_week', 'First Week Experience', 'onboarding', 2),
('commitments_expectations', 'Commitments & Expectations', 'first_week', 3),
('tracking_tools', 'Tracking & Tools', 'first_week', 4),
('ongoing_support', 'Ongoing Support', 'ongoing_support', 5),
('trainer_specific', 'Trainer-Specific Approach', 'ongoing_support', 6);

-- Update the existing categories to reference template sections
UPDATE public.ways_of_working_categories 
SET profile_section_key = CASE 
  WHEN section_key IN ('onboarding', 'first_week') THEN 'onboarding'
  WHEN section_key IN ('commitments_expectations', 'tracking_tools') THEN 'first_week'  
  WHEN section_key IN ('ongoing_support', 'trainer_specific') THEN 'ongoing_support'
  ELSE 'onboarding'
END;