-- Phase 1A: Admin-Configurable Client Goals

-- 1. Create enums for client goal types (using distinct names to avoid conflicts)
CREATE TYPE client_goal_type AS ENUM ('primary', 'secondary');
CREATE TYPE client_goal_mapping_type AS ENUM ('primary', 'secondary', 'optional');

-- 2. Create client_goals table
CREATE TABLE public.client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Target',
  goal_type client_goal_type NOT NULL DEFAULT 'primary',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  visibility_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create client_goal_specialty_mappings table
CREATE TABLE public.client_goal_specialty_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.client_goals(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  mapping_type client_goal_mapping_type NOT NULL DEFAULT 'primary',
  weight SMALLINT NOT NULL DEFAULT 100 CHECK (weight >= 0 AND weight <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(goal_id, specialty_id)
);

-- 4. Create updated_at trigger for client_goals
CREATE OR REPLACE FUNCTION public.update_client_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_client_goals_updated_at
  BEFORE UPDATE ON public.client_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_goals_updated_at();

-- 5. Enable RLS
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_goal_specialty_mappings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for client_goals
-- Authenticated users can read active goals (for client survey)
CREATE POLICY "Authenticated users can read active goals"
  ON public.client_goals
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all goals"
  ON public.client_goals
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. RLS Policies for client_goal_specialty_mappings
-- Authenticated users can read mappings for active goals
CREATE POLICY "Authenticated users can read mappings"
  ON public.client_goal_specialty_mappings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_goals 
      WHERE id = goal_id AND is_active = true
    )
  );

-- Admins can manage all mappings
CREATE POLICY "Admins can manage all mappings"
  ON public.client_goal_specialty_mappings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Create indexes for performance
CREATE INDEX idx_client_goals_active ON public.client_goals(is_active) WHERE is_active = true;
CREATE INDEX idx_client_goals_type ON public.client_goals(goal_type);
CREATE INDEX idx_client_goal_mappings_goal ON public.client_goal_specialty_mappings(goal_id);
CREATE INDEX idx_client_goal_mappings_specialty ON public.client_goal_specialty_mappings(specialty_id);

-- 9. Seed primary goals
INSERT INTO public.client_goals (goal_key, label, description, icon, goal_type, display_order, is_active) VALUES
  ('weight_loss', 'Weight Loss', 'Lose weight and improve body composition', 'TrendingUp', 'primary', 1, true),
  ('strength_training', 'Strength Training', 'Build muscle and increase strength', 'Dumbbell', 'primary', 2, true),
  ('fitness_health', 'General Fitness & Health', 'Improve overall health and fitness', 'Heart', 'primary', 3, true),
  ('energy_confidence', 'Energy & Confidence', 'Boost energy levels and self-confidence', 'Zap', 'primary', 4, true),
  ('injury_prevention', 'Injury Prevention', 'Prevent injuries and improve mobility', 'Shield', 'primary', 5, true),
  ('specific_sport', 'Sport-Specific Training', 'Train for a specific sport or activity', 'Target', 'primary', 6, true);

-- 10. Seed secondary goals
INSERT INTO public.client_goals (goal_key, label, description, icon, goal_type, display_order, is_active) VALUES
  ('improve_flexibility', 'Improve flexibility', NULL, 'Activity', 'secondary', 1, true),
  ('better_sleep', 'Better sleep quality', NULL, 'Moon', 'secondary', 2, true),
  ('stress_reduction', 'Stress reduction', NULL, 'Brain', 'secondary', 3, true),
  ('improve_posture', 'Improve posture', NULL, 'AlignVerticalJustifyCenter', 'secondary', 4, true),
  ('increase_endurance', 'Increase endurance', NULL, 'Flame', 'secondary', 5, true),
  ('social_fitness', 'Social fitness', NULL, 'Users', 'secondary', 6, true),
  ('learn_proper_form', 'Learn proper form', NULL, 'BookOpen', 'secondary', 7, true),
  ('habit_building', 'Habit building', NULL, 'Calendar', 'secondary', 8, true);

-- 11. Seed specialty mappings for primary goals
-- Weight Loss mappings
INSERT INTO public.client_goal_specialty_mappings (goal_id, specialty_id, mapping_type, weight)
SELECT 
  (SELECT id FROM public.client_goals WHERE goal_key = 'weight_loss'),
  s.id,
  CASE 
    WHEN s.name IN ('Weight Loss', 'Nutrition Coaching') THEN 'primary'::client_goal_mapping_type
    WHEN s.name IN ('HIIT Training', 'Functional Movement') THEN 'secondary'::client_goal_mapping_type
    ELSE 'optional'::client_goal_mapping_type
  END,
  CASE 
    WHEN s.name IN ('Weight Loss', 'Nutrition Coaching') THEN 100
    WHEN s.name IN ('HIIT Training', 'Functional Movement') THEN 60
    ELSE 30
  END
FROM public.specialties s
WHERE s.name IN ('Weight Loss', 'Nutrition Coaching', 'HIIT Training', 'Functional Movement')
  AND s.is_active = true;

-- Strength Training mappings
INSERT INTO public.client_goal_specialty_mappings (goal_id, specialty_id, mapping_type, weight)
SELECT 
  (SELECT id FROM public.client_goals WHERE goal_key = 'strength_training'),
  s.id,
  CASE 
    WHEN s.name IN ('Strength Training', 'Bodybuilding', 'Powerlifting') THEN 'primary'::client_goal_mapping_type
    WHEN s.name IN ('Olympic Lifting', 'Functional Movement') THEN 'secondary'::client_goal_mapping_type
    ELSE 'optional'::client_goal_mapping_type
  END,
  CASE 
    WHEN s.name IN ('Strength Training', 'Bodybuilding', 'Powerlifting') THEN 100
    WHEN s.name IN ('Olympic Lifting', 'Functional Movement') THEN 60
    ELSE 30
  END
FROM public.specialties s
WHERE s.name IN ('Strength Training', 'Bodybuilding', 'Powerlifting', 'Olympic Lifting', 'Functional Movement')
  AND s.is_active = true;

-- General Fitness & Health mappings
INSERT INTO public.client_goal_specialty_mappings (goal_id, specialty_id, mapping_type, weight)
SELECT 
  (SELECT id FROM public.client_goals WHERE goal_key = 'fitness_health'),
  s.id,
  CASE 
    WHEN s.name IN ('Functional Movement', 'HIIT Training') THEN 'primary'::client_goal_mapping_type
    WHEN s.name IN ('Yoga', 'Pilates', 'Flexibility & Mobility') THEN 'secondary'::client_goal_mapping_type
    ELSE 'optional'::client_goal_mapping_type
  END,
  CASE 
    WHEN s.name IN ('Functional Movement', 'HIIT Training') THEN 100
    WHEN s.name IN ('Yoga', 'Pilates', 'Flexibility & Mobility') THEN 60
    ELSE 30
  END
FROM public.specialties s
WHERE s.name IN ('Functional Movement', 'HIIT Training', 'Yoga', 'Pilates', 'Flexibility & Mobility')
  AND s.is_active = true;

-- Energy & Confidence mappings
INSERT INTO public.client_goal_specialty_mappings (goal_id, specialty_id, mapping_type, weight)
SELECT 
  (SELECT id FROM public.client_goals WHERE goal_key = 'energy_confidence'),
  s.id,
  CASE 
    WHEN s.name IN ('HIIT Training', 'Functional Movement') THEN 'primary'::client_goal_mapping_type
    WHEN s.name IN ('Mindfulness & Wellness', 'Yoga') THEN 'secondary'::client_goal_mapping_type
    ELSE 'optional'::client_goal_mapping_type
  END,
  CASE 
    WHEN s.name IN ('HIIT Training', 'Functional Movement') THEN 100
    WHEN s.name IN ('Mindfulness & Wellness', 'Yoga') THEN 60
    ELSE 30
  END
FROM public.specialties s
WHERE s.name IN ('HIIT Training', 'Functional Movement', 'Mindfulness & Wellness', 'Yoga')
  AND s.is_active = true;

-- Injury Prevention mappings
INSERT INTO public.client_goal_specialty_mappings (goal_id, specialty_id, mapping_type, weight)
SELECT 
  (SELECT id FROM public.client_goals WHERE goal_key = 'injury_prevention'),
  s.id,
  CASE 
    WHEN s.name IN ('Rehabilitation', 'Injury Prevention', 'Flexibility & Mobility') THEN 'primary'::client_goal_mapping_type
    WHEN s.name IN ('Functional Movement', 'Pilates') THEN 'secondary'::client_goal_mapping_type
    ELSE 'optional'::client_goal_mapping_type
  END,
  CASE 
    WHEN s.name IN ('Rehabilitation', 'Injury Prevention', 'Flexibility & Mobility') THEN 100
    WHEN s.name IN ('Functional Movement', 'Pilates') THEN 60
    ELSE 30
  END
FROM public.specialties s
WHERE s.name IN ('Rehabilitation', 'Injury Prevention', 'Flexibility & Mobility', 'Functional Movement', 'Pilates')
  AND s.is_active = true;

-- Sport-Specific Training mappings
INSERT INTO public.client_goal_specialty_mappings (goal_id, specialty_id, mapping_type, weight)
SELECT 
  (SELECT id FROM public.client_goals WHERE goal_key = 'specific_sport'),
  s.id,
  CASE 
    WHEN s.name IN ('Sports Performance', 'Marathon Training', 'CrossFit') THEN 'primary'::client_goal_mapping_type
    WHEN s.name IN ('Strength Training', 'HIIT Training') THEN 'secondary'::client_goal_mapping_type
    ELSE 'optional'::client_goal_mapping_type
  END,
  CASE 
    WHEN s.name IN ('Sports Performance', 'Marathon Training', 'CrossFit') THEN 100
    WHEN s.name IN ('Strength Training', 'HIIT Training') THEN 60
    ELSE 30
  END
FROM public.specialties s
WHERE s.name IN ('Sports Performance', 'Marathon Training', 'CrossFit', 'Strength Training', 'HIIT Training')
  AND s.is_active = true;