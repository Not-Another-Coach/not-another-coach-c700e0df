-- Create ways of working categories mapping table
CREATE TABLE public.ways_of_working_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL,
  section_name TEXT NOT NULL,
  activity_category TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ways_of_working_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage category mappings" 
ON public.ways_of_working_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view category mappings" 
ON public.ways_of_working_categories 
FOR SELECT 
USING (true);

-- Create unique constraint
CREATE UNIQUE INDEX idx_ways_of_working_categories_section_category 
ON public.ways_of_working_categories (section_key, activity_category);

-- Create index for ordering
CREATE INDEX idx_ways_of_working_categories_display_order 
ON public.ways_of_working_categories (section_key, display_order);

-- Insert existing mappings from hardcoded system
INSERT INTO public.ways_of_working_categories (section_key, section_name, activity_category, display_order) VALUES
('onboarding', 'Onboarding Process', 'Onboarding', 1),
('first_week', 'First Week Experience', 'First Week', 2),
('ongoing_structure', 'Ongoing Structure', 'Ongoing Structure', 3),
('tracking_tools', 'Tracking & Progress Tools', 'Tracking Tools', 4),
('client_expectations', 'What I Expect From Clients', 'Client Expectations', 5),
('what_i_bring', 'What I Bring', 'What I Bring', 6);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_ways_of_working_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ways_of_working_categories_updated_at
BEFORE UPDATE ON public.ways_of_working_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_ways_of_working_categories_updated_at();