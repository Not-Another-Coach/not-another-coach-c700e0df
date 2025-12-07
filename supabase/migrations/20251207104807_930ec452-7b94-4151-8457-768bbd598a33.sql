-- Create client coaching styles table (options shown to clients in survey)
CREATE TABLE public.client_coaching_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Heart',
  keywords TEXT[] DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer coaching styles table (options shown to trainers)
CREATE TABLE public.trainer_coaching_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '💪',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching style mappings table (how client styles map to trainer styles)
CREATE TABLE public.coaching_style_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_style_id UUID NOT NULL REFERENCES public.client_coaching_styles(id) ON DELETE CASCADE,
  trainer_style_id UUID NOT NULL REFERENCES public.trainer_coaching_styles(id) ON DELETE CASCADE,
  weight SMALLINT NOT NULL DEFAULT 100 CHECK (weight >= 0 AND weight <= 100),
  mapping_type TEXT NOT NULL DEFAULT 'primary' CHECK (mapping_type IN ('primary', 'secondary', 'tertiary')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_style_id, trainer_style_id)
);

-- Enable RLS
ALTER TABLE public.client_coaching_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_coaching_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_style_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_coaching_styles
CREATE POLICY "Authenticated users can read active client coaching styles"
ON public.client_coaching_styles FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all client coaching styles"
ON public.client_coaching_styles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for trainer_coaching_styles
CREATE POLICY "Authenticated users can read active trainer coaching styles"
ON public.trainer_coaching_styles FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all trainer coaching styles"
ON public.trainer_coaching_styles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for coaching_style_mappings
CREATE POLICY "Authenticated users can read coaching style mappings"
ON public.coaching_style_mappings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all coaching style mappings"
ON public.coaching_style_mappings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_client_coaching_styles_active ON public.client_coaching_styles(is_active, display_order);
CREATE INDEX idx_trainer_coaching_styles_active ON public.trainer_coaching_styles(is_active, display_order);
CREATE INDEX idx_coaching_style_mappings_client ON public.coaching_style_mappings(client_style_id);
CREATE INDEX idx_coaching_style_mappings_trainer ON public.coaching_style_mappings(trainer_style_id);

-- Seed client coaching styles (from CoachingStyleSection.tsx)
INSERT INTO public.client_coaching_styles (style_key, label, description, icon, keywords, display_order) VALUES
('motivational', 'Motivational & Encouraging', 'Positive reinforcement, celebrating wins, building confidence', 'Heart', ARRAY['encouraging', 'supportive', 'positive'], 1),
('structured', 'Structured & Disciplined', 'Clear plans, strict schedules, consistent tracking', 'Target', ARRAY['structured', 'disciplined', 'systematic'], 2),
('tough_love', 'Tough Love', 'Direct feedback, high expectations, pushing limits', 'Flame', ARRAY['challenging', 'direct', 'intense'], 3),
('educational', 'Educational & Analytical', 'Understanding the why, data-driven, learning-focused', 'BookOpen', ARRAY['analytical', 'educational', 'scientific'], 4),
('flexible', 'Flexible & Adaptive', 'Adjusts to your life, understanding of constraints', 'Sparkles', ARRAY['flexible', 'adaptive', 'understanding'], 5),
('holistic', 'Holistic & Mindful', 'Mind-body connection, stress management, overall wellness', 'Leaf', ARRAY['holistic', 'mindful', 'wellness'], 6);

-- Seed trainer coaching styles (from ClientFitSection.tsx)
INSERT INTO public.trainer_coaching_styles (style_key, label, description, emoji, display_order) VALUES
('motivational', 'Motivational & Encouraging', 'Positive reinforcement, celebrating wins, building confidence', '🎉', 1),
('structured', 'Structured & Disciplined', 'Clear plans, strict schedules, consistent tracking', '📋', 2),
('tough_love', 'Tough Love', 'Direct feedback, high expectations, pushing limits', '💪', 3),
('educational', 'Educational & Analytical', 'Understanding the why, data-driven, learning-focused', '📚', 4),
('flexible', 'Flexible & Adaptive', 'Adjusts to life circumstances, understanding of constraints', '🔄', 5),
('holistic', 'Holistic & Mindful', 'Mind-body connection, stress management, overall wellness', '🧘', 6);

-- Create default mappings (same style = 100, related styles = 60)
DO $$
DECLARE
  client_rec RECORD;
  trainer_rec RECORD;
BEGIN
  -- Primary mappings (same style_key = 100 weight)
  FOR client_rec IN SELECT id, style_key FROM public.client_coaching_styles LOOP
    FOR trainer_rec IN SELECT id, style_key FROM public.trainer_coaching_styles LOOP
      IF client_rec.style_key = trainer_rec.style_key THEN
        INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
        VALUES (client_rec.id, trainer_rec.id, 100, 'primary');
      END IF;
    END LOOP;
  END LOOP;
  
  -- Secondary mappings (related styles = 60 weight)
  -- motivational <-> flexible
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'motivational' AND t.style_key = 'flexible';
  
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'flexible' AND t.style_key = 'motivational';
  
  -- structured <-> educational
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'structured' AND t.style_key = 'educational';
  
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'educational' AND t.style_key = 'structured';
  
  -- tough_love <-> structured
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'tough_love' AND t.style_key = 'structured';
  
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'structured' AND t.style_key = 'tough_love';
  
  -- holistic <-> flexible
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'holistic' AND t.style_key = 'flexible';
  
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'flexible' AND t.style_key = 'holistic';
  
  -- holistic <-> motivational
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'holistic' AND t.style_key = 'motivational';
  
  INSERT INTO public.coaching_style_mappings (client_style_id, trainer_style_id, weight, mapping_type)
  SELECT c.id, t.id, 60, 'secondary'
  FROM public.client_coaching_styles c, public.trainer_coaching_styles t
  WHERE c.style_key = 'motivational' AND t.style_key = 'holistic';
END $$;

-- Create updated_at triggers
CREATE TRIGGER update_client_coaching_styles_updated_at
BEFORE UPDATE ON public.client_coaching_styles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainer_coaching_styles_updated_at
BEFORE UPDATE ON public.trainer_coaching_styles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();