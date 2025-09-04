-- Create popular_qualifications table for admin-managed qualifications
CREATE TABLE public.popular_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  requires_verification BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  description TEXT,
  verification_requirements JSONB DEFAULT '{}'::jsonb
);

-- Create custom_qualification_requests table for trainer-submitted qualifications
CREATE TABLE public.custom_qualification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL,
  qualification_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  usage_count INTEGER DEFAULT 1,
  similar_existing_qualification_id UUID REFERENCES public.popular_qualifications(id)
);

-- Create qualification_usage_stats for analytics
CREATE TABLE public.qualification_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qualification_id UUID REFERENCES public.popular_qualifications(id),
  trainer_id UUID NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  qualification_type TEXT NOT NULL DEFAULT 'popular' CHECK (qualification_type IN ('popular', 'custom'))
);

-- Enable RLS on all tables
ALTER TABLE public.popular_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_qualification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for popular_qualifications
CREATE POLICY "Anyone can view active qualifications" 
ON public.popular_qualifications 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage qualifications" 
ON public.popular_qualifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for custom_qualification_requests
CREATE POLICY "Trainers can create their own requests" 
ON public.custom_qualification_requests 
FOR INSERT 
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can view their own requests" 
ON public.custom_qualification_requests 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can manage all requests" 
ON public.custom_qualification_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for qualification_usage_stats
CREATE POLICY "System can insert usage stats" 
ON public.qualification_usage_stats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view usage stats" 
ON public.qualification_usage_stats 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Trainers can view their own usage stats" 
ON public.qualification_usage_stats 
FOR SELECT 
USING (auth.uid() = trainer_id);

-- Create indexes for performance
CREATE INDEX idx_popular_qualifications_category ON public.popular_qualifications(category);
CREATE INDEX idx_popular_qualifications_display_order ON public.popular_qualifications(display_order);
CREATE INDEX idx_custom_qualification_requests_status ON public.custom_qualification_requests(status);
CREATE INDEX idx_custom_qualification_requests_trainer ON public.custom_qualification_requests(trainer_id);
CREATE INDEX idx_qualification_usage_stats_qualification ON public.qualification_usage_stats(qualification_id);

-- Insert initial popular qualifications from the existing hardcoded list
INSERT INTO public.popular_qualifications (name, category, display_order, requires_verification, is_active) VALUES
('NASM Certified Personal Trainer', 'personal_training', 1, true, true),
('ACE Personal Trainer Certification', 'personal_training', 2, true, true),
('ACSM Certified Personal Trainer', 'personal_training', 3, true, true),
('NSCA Certified Strength & Conditioning Specialist', 'strength_training', 4, true, true),
('ISSA Personal Training Certification', 'personal_training', 5, true, true),
('200-Hour Yoga Teacher Training', 'yoga', 6, true, true),
('500-Hour Yoga Teacher Training', 'yoga', 7, true, true),
('Pilates Instructor Certification', 'pilates', 8, true, true),
('CrossFit Level 1 Trainer', 'crossfit', 9, true, true),
('TRX Suspension Training Certification', 'functional_training', 10, false, true),
('Kettlebell Instructor Certification', 'strength_training', 11, false, true),
('Spinning/Cycling Instructor', 'cardio', 12, false, true),
('Zumba Fitness Instructor', 'dance_fitness', 13, false, true),
('Barre Instructor Certification', 'barre', 14, false, true),
('Nutrition Coach Certification', 'nutrition', 15, true, true),
('Sports Massage Therapy', 'massage_therapy', 16, true, true),
('HIIT (High-Intensity Interval Training) Specialist', 'hiit', 17, false, true),
('Functional Movement Screen (FMS)', 'movement_assessment', 18, true, true),
('Pre/Postnatal Exercise Specialist', 'specialty', 19, true, true),
('Senior Fitness Specialist', 'specialty', 20, true, true),
('Youth Fitness Specialist', 'specialty', 21, true, true),
('Corrective Exercise Specialist', 'corrective_exercise', 22, true, true),
('Athletic Performance Enhancement', 'performance', 23, false, true),
('Group Fitness Instructor', 'group_fitness', 24, false, true),
('Martial Arts Instructor', 'martial_arts', 25, false, true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_popular_qualifications_updated_at
  BEFORE UPDATE ON public.popular_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_qualification_requests_updated_at
  BEFORE UPDATE ON public.custom_qualification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();