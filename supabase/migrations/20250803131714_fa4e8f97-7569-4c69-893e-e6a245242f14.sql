-- Create a new table for package-specific ways of working
CREATE TABLE public.package_ways_of_working (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL,
  package_id text NOT NULL,
  package_name text NOT NULL,
  onboarding_items jsonb DEFAULT '[]'::jsonb,
  first_week_items jsonb DEFAULT '[]'::jsonb,
  ongoing_structure_items jsonb DEFAULT '[]'::jsonb,
  tracking_tools_items jsonb DEFAULT '[]'::jsonb,
  client_expectations_items jsonb DEFAULT '[]'::jsonb,
  what_i_bring_items jsonb DEFAULT '[]'::jsonb,
  visibility text DEFAULT 'public',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, package_id)
);

-- Enable RLS on the new table
ALTER TABLE public.package_ways_of_working ENABLE ROW LEVEL SECURITY;

-- Create policies for package ways of working
CREATE POLICY "Trainers can view their own package ways of working" 
ON public.package_ways_of_working 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert their own package ways of working" 
ON public.package_ways_of_working 
FOR INSERT 
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own package ways of working" 
ON public.package_ways_of_working 
FOR UPDATE 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own package ways of working" 
ON public.package_ways_of_working 
FOR DELETE 
USING (auth.uid() = trainer_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_package_ways_of_working_updated_at
BEFORE UPDATE ON public.package_ways_of_working
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();