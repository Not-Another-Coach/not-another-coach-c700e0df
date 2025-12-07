-- =========================================
-- Client Motivators & Activity Mappings
-- =========================================

-- Table: client_motivators
-- Stores the motivation factors shown in client survey
CREATE TABLE public.client_motivators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  icon text DEFAULT 'Flame',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_motivators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_motivators
CREATE POLICY "Anyone can view active motivators"
  ON public.client_motivators FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all motivators"
  ON public.client_motivators FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table: motivator_activity_mappings
-- Maps motivators to trainer onboarding activities
CREATE TABLE public.motivator_activity_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motivator_id uuid NOT NULL REFERENCES public.client_motivators(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.trainer_onboarding_activities(id) ON DELETE CASCADE,
  weight smallint DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  UNIQUE(motivator_id, activity_id)
);

-- Enable RLS
ALTER TABLE public.motivator_activity_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for motivator_activity_mappings
CREATE POLICY "Authenticated users can view mappings"
  ON public.motivator_activity_mappings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage mappings"
  ON public.motivator_activity_mappings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at on client_motivators
CREATE OR REPLACE FUNCTION public.update_client_motivators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_client_motivators_updated_at
  BEFORE UPDATE ON public.client_motivators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_motivators_updated_at();

-- Seed initial motivators from the hardcoded list
INSERT INTO public.client_motivators (key, label, description, icon, display_order, is_active) VALUES
  ('positive_reinforcement', 'Positive reinforcement', 'Encouragement and praise for effort and progress', 'ThumbsUp', 1, true),
  ('celebrating_small_wins', 'Celebrating small wins', 'Acknowledging achievements along the way', 'Award', 2, true),
  ('setting_clear_goals', 'Setting clear goals', 'Having specific, measurable targets to work toward', 'Target', 3, true),
  ('friendly_competition', 'Friendly competition', 'Being challenged and competing with others', 'Trophy', 4, true),
  ('progress_tracking', 'Progress tracking', 'Seeing measurable improvements over time', 'TrendingUp', 5, true),
  ('personal_connection', 'Personal connection', 'Building a genuine relationship with your trainer', 'Heart', 6, true),
  ('variety_in_workouts', 'Variety in workouts', 'Keeping things fresh and interesting', 'Shuffle', 7, true),
  ('understanding_my_why', 'Understanding my ''why''', 'Connecting exercise to deeper personal meaning', 'Lightbulb', 8, true),
  ('flexible_expectations', 'Flexible expectations', 'Adapting to life circumstances without judgment', 'Leaf', 9, true),
  ('professional_expertise', 'Professional expertise', 'Learning from someone with deep knowledge', 'GraduationCap', 10, true)
ON CONFLICT (key) DO NOTHING;