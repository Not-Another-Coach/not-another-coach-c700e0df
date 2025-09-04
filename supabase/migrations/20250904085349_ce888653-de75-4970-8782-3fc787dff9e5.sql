-- Phase 1: Database Structure for Admin-Configurable Specialties & Training Types

-- Create specialty_categories table
CREATE TABLE public.specialty_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  color TEXT DEFAULT 'blue',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create specialties table
CREATE TABLE public.specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.specialty_categories(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_qualification BOOLEAN NOT NULL DEFAULT false,
  matching_keywords TEXT[], -- Array of keywords for semantic matching
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(name, category_id)
);

-- Create training_types table
CREATE TABLE public.training_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  delivery_formats TEXT[] DEFAULT '{"in-person", "online", "hybrid"}', -- Which delivery formats support this type
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create specialty_qualification_links table for linking specialties to qualifications
CREATE TABLE public.specialty_qualification_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  qualification_id UUID NOT NULL REFERENCES public.popular_qualifications(id) ON DELETE CASCADE,
  matching_weight DECIMAL DEFAULT 1.0, -- Weight for matching algorithm
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(specialty_id, qualification_id)
);

-- Create specialty_matching_rules table for flexible matching logic
CREATE TABLE public.specialty_matching_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  client_goal_keywords TEXT[] NOT NULL, -- Keywords that match client goals
  matching_score DECIMAL NOT NULL DEFAULT 1.0, -- Base matching score
  popularity_weight DECIMAL DEFAULT 1.0, -- Popularity weighting
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create specialty_usage_analytics table for tracking usage
CREATE TABLE public.specialty_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_matched_count INTEGER DEFAULT 0, -- How many times this led to client matches
  conversion_rate DECIMAL DEFAULT 0.0 -- Success rate for this specialty
);

-- Create training_type_usage_analytics table
CREATE TABLE public.training_type_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_type_id UUID NOT NULL REFERENCES public.training_types(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_matched_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL DEFAULT 0.0
);

-- Create custom_specialty_requests table for trainer requests
CREATE TABLE public.custom_specialty_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_name TEXT NOT NULL,
  category_id UUID REFERENCES public.specialty_categories(id) ON DELETE SET NULL,
  description TEXT,
  justification TEXT, -- Why trainer needs this specialty
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.specialty_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialty_qualification_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialty_matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialty_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_type_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_specialty_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Specialty Categories: Anyone can view active categories, admins can manage
CREATE POLICY "Anyone can view active specialty categories" ON public.specialty_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage specialty categories" ON public.specialty_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Specialties: Anyone can view active specialties, admins can manage
CREATE POLICY "Anyone can view active specialties" ON public.specialties
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage specialties" ON public.specialties
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Training Types: Anyone can view active types, admins can manage
CREATE POLICY "Anyone can view active training types" ON public.training_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage training types" ON public.training_types
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Specialty Qualification Links: Anyone can view, admins can manage
CREATE POLICY "Anyone can view specialty qualification links" ON public.specialty_qualification_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage specialty qualification links" ON public.specialty_qualification_links
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Specialty Matching Rules: Anyone can view, admins can manage
CREATE POLICY "Anyone can view specialty matching rules" ON public.specialty_matching_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage specialty matching rules" ON public.specialty_matching_rules
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Usage Analytics: Trainers can view their own, admins can view all
CREATE POLICY "Trainers can view their own specialty analytics" ON public.specialty_usage_analytics
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can view all specialty analytics" ON public.specialty_usage_analytics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert specialty analytics" ON public.specialty_usage_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Trainers can view their own training type analytics" ON public.training_type_usage_analytics
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can view all training type analytics" ON public.training_type_usage_analytics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert training type analytics" ON public.training_type_usage_analytics
  FOR INSERT WITH CHECK (true);

-- Custom Specialty Requests: Trainers can manage their own, admins can view/manage all
CREATE POLICY "Trainers can manage their own specialty requests" ON public.custom_specialty_requests
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can manage all specialty requests" ON public.custom_specialty_requests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial specialty categories
INSERT INTO public.specialty_categories (name, description, icon, color, display_order) VALUES
  ('Strength & Power', 'Building strength, power, and muscle mass', 'Dumbbell', 'red', 1),
  ('Weight Management', 'Weight loss, body composition, and nutrition', 'Target', 'green', 2),
  ('Rehabilitation & Recovery', 'Injury recovery, mobility, and corrective exercise', 'Heart', 'blue', 3),
  ('Specialized Populations', 'Training for specific life stages and conditions', 'Users', 'purple', 4),
  ('Sport & Performance', 'Athletic performance and sport-specific training', 'Trophy', 'orange', 5),
  ('Mind-Body Wellness', 'Mental health, mindfulness, and holistic wellness', 'Brain', 'teal', 6),
  ('Group & Alternative Training', 'Group classes and alternative fitness methods', 'Users', 'pink', 7);

-- Insert specialties with categories
INSERT INTO public.specialties (name, category_id, display_order, matching_keywords) VALUES
  -- Strength & Power
  ('Strength Training', (SELECT id FROM public.specialty_categories WHERE name = 'Strength & Power'), 1, 
   '{"strength", "muscle building", "powerlifting", "resistance training", "weightlifting"}'),
  ('Powerlifting', (SELECT id FROM public.specialty_categories WHERE name = 'Strength & Power'), 2,
   '{"powerlifting", "squat", "bench press", "deadlift", "strength competition"}'),
  ('Olympic Lifting', (SELECT id FROM public.specialty_categories WHERE name = 'Strength & Power'), 3,
   '{"olympic lifting", "clean and jerk", "snatch", "weightlifting", "explosive power"}'),
  ('Bodybuilding', (SELECT id FROM public.specialty_categories WHERE name = 'Strength & Power'), 4,
   '{"bodybuilding", "muscle mass", "physique", "contest prep", "hypertrophy"}'),
  
  -- Weight Management
  ('Weight Loss', (SELECT id FROM public.specialty_categories WHERE name = 'Weight Management'), 1,
   '{"weight loss", "fat loss", "body transformation", "calorie deficit", "metabolism"}'),
  ('Nutrition Coaching', (SELECT id FROM public.specialty_categories WHERE name = 'Weight Management'), 2,
   '{"nutrition", "meal planning", "diet", "macro coaching", "healthy eating"}'),
  
  -- Rehabilitation & Recovery
  ('Rehabilitation', (SELECT id FROM public.specialty_categories WHERE name = 'Rehabilitation & Recovery'), 1,
   '{"rehabilitation", "injury recovery", "physical therapy", "corrective exercise"}'),
  ('Flexibility & Mobility', (SELECT id FROM public.specialty_categories WHERE name = 'Rehabilitation & Recovery'), 2,
   '{"flexibility", "mobility", "stretching", "movement quality", "joint health"}'),
  ('Injury Prevention', (SELECT id FROM public.specialty_categories WHERE name = 'Rehabilitation & Recovery'), 3,
   '{"injury prevention", "movement screening", "corrective exercise", "biomechanics"}'),
  
  -- Specialized Populations
  ('Pre/Postnatal', (SELECT id FROM public.specialty_categories WHERE name = 'Specialized Populations'), 1,
   '{"prenatal", "postnatal", "pregnancy", "postpartum", "maternal fitness"}'),
  ('Menopause Support', (SELECT id FROM public.specialty_categories WHERE name = 'Specialized Populations'), 2,
   '{"menopause", "hormonal changes", "midlife fitness", "bone health"}'),
  ('Senior Fitness', (SELECT id FROM public.specialty_categories WHERE name = 'Specialized Populations'), 3,
   '{"senior fitness", "elderly", "aging", "balance", "fall prevention"}'),
  ('Youth Training', (SELECT id FROM public.specialty_categories WHERE name = 'Specialized Populations'), 4,
   '{"youth training", "kids fitness", "adolescent", "sports development"}'),
  
  -- Sport & Performance
  ('Sports Performance', (SELECT id FROM public.specialty_categories WHERE name = 'Sport & Performance'), 1,
   '{"sports performance", "athletic training", "speed", "agility", "sport specific"}'),
  ('Marathon Training', (SELECT id FROM public.specialty_categories WHERE name = 'Sport & Performance'), 2,
   '{"marathon", "distance running", "endurance", "running coach"}'),
  ('CrossFit', (SELECT id FROM public.specialty_categories WHERE name = 'Sport & Performance'), 3,
   '{"crossfit", "functional fitness", "WOD", "competition training"}'),
  ('HIIT Training', (SELECT id FROM public.specialty_categories WHERE name = 'Sport & Performance'), 4,
   '{"HIIT", "high intensity", "interval training", "metabolic conditioning"}'),
  ('Functional Movement', (SELECT id FROM public.specialty_categories WHERE name = 'Sport & Performance'), 5,
   '{"functional movement", "functional training", "movement patterns", "daily activities"}'),
  
  -- Mind-Body Wellness
  ('Mindfulness & Wellness', (SELECT id FROM public.specialty_categories WHERE name = 'Mind-Body Wellness'), 1,
   '{"mindfulness", "wellness", "stress relief", "mental health", "meditation"}'),
  ('Yoga', (SELECT id FROM public.specialty_categories WHERE name = 'Mind-Body Wellness'), 2,
   '{"yoga", "vinyasa", "hatha", "meditation", "flexibility"}'),
  ('Pilates', (SELECT id FROM public.specialty_categories WHERE name = 'Mind-Body Wellness'), 3,
   '{"pilates", "core strength", "posture", "mind-body connection"}'),
  
  -- Group & Alternative Training
  ('Dance Fitness', (SELECT id FROM public.specialty_categories WHERE name = 'Group & Alternative Training'), 1,
   '{"dance fitness", "zumba", "dance", "cardio dance", "rhythm"}'),
  ('Boxing/Kickboxing', (SELECT id FROM public.specialty_categories WHERE name = 'Group & Alternative Training'), 2,
   '{"boxing", "kickboxing", "martial arts", "combat sports", "self defense"}'),
  ('Swimming', (SELECT id FROM public.specialty_categories WHERE name = 'Group & Alternative Training'), 3,
   '{"swimming", "aquatic fitness", "water aerobics", "stroke technique"}');

-- Insert training types
INSERT INTO public.training_types (name, description, display_order, delivery_formats, min_participants, max_participants) VALUES
  ('1-on-1 Personal Training', 'Individual focused training sessions', 1, '{"in-person", "online"}', 1, 1),
  ('Small Group Training (2-4 people)', 'Intimate group sessions with personalized attention', 2, '{"in-person", "online"}', 2, 4),
  ('Group Classes (5+ people)', 'Larger group fitness classes', 3, '{"in-person", "online"}', 5, 30),
  ('Online Coaching', 'Remote coaching and program delivery', 4, '{"online"}', 1, null),
  ('Hybrid Programs', 'Combination of in-person and online elements', 5, '{"hybrid"}', 1, null),
  ('Nutrition Consulting', 'Specialized nutrition guidance and meal planning', 6, '{"in-person", "online"}', 1, null),
  ('Program Design', 'Custom workout program creation', 7, '{"online"}', 1, null),
  ('Form Checks', 'Video analysis and technique correction', 8, '{"online"}', 1, null),
  ('Workout Plans', 'Structured fitness programming', 9, '{"online"}', 1, null);

-- Create indexes for performance
CREATE INDEX idx_specialties_category_id ON public.specialties(category_id);
CREATE INDEX idx_specialties_active ON public.specialties(is_active);
CREATE INDEX idx_specialty_categories_active ON public.specialty_categories(is_active);
CREATE INDEX idx_training_types_active ON public.training_types(is_active);
CREATE INDEX idx_specialty_usage_trainer ON public.specialty_usage_analytics(trainer_id);
CREATE INDEX idx_specialty_usage_specialty ON public.specialty_usage_analytics(specialty_id);
CREATE INDEX idx_training_type_usage_trainer ON public.training_type_usage_analytics(trainer_id);

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_specialty_categories_updated_at BEFORE UPDATE ON public.specialty_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON public.specialties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_training_types_updated_at BEFORE UPDATE ON public.training_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_specialty_matching_rules_updated_at BEFORE UPDATE ON public.specialty_matching_rules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_custom_specialty_requests_updated_at BEFORE UPDATE ON public.custom_specialty_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();