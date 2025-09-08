-- Create highlights content table
CREATE TABLE public.highlights_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  content_type TEXT NOT NULL CHECK (content_type IN ('transformation', 'motivational', 'article', 'tip')),
  engagement_score INTEGER DEFAULT 0,
  featured_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create highlights submissions workflow table
CREATE TABLE public.highlights_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL,
  content_id UUID REFERENCES public.highlights_content(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily highlights batches table
CREATE TABLE public.daily_highlights_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  highlight_ids UUID[] DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create user highlight interactions table
CREATE TABLE public.user_highlight_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  highlight_id UUID NOT NULL REFERENCES public.highlights_content(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'clicked', 'trainer_visited')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.highlights_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_highlights_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_highlight_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for highlights_content
CREATE POLICY "Trainers can manage their own content" ON public.highlights_content
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Users can view active highlights" ON public.highlights_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all highlights" ON public.highlights_content
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for highlights_submissions
CREATE POLICY "Trainers can manage their own submissions" ON public.highlights_submissions
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can manage all submissions" ON public.highlights_submissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for daily_highlights_batches
CREATE POLICY "Users can view their own daily highlights" ON public.daily_highlights_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage daily batches" ON public.daily_highlights_batches
  FOR ALL USING (true);

-- RLS Policies for user_highlight_interactions
CREATE POLICY "Users can manage their own interactions" ON public.user_highlight_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_highlights_content_trainer_id ON public.highlights_content(trainer_id);
CREATE INDEX idx_highlights_content_active_created ON public.highlights_content(is_active, created_at DESC);
CREATE INDEX idx_highlights_submissions_status ON public.highlights_submissions(status);
CREATE INDEX idx_daily_highlights_batches_user_date ON public.daily_highlights_batches(user_id, date);
CREATE INDEX idx_user_highlight_interactions_user_highlight ON public.user_highlight_interactions(user_id, highlight_id);

-- Create updated_at trigger for highlights_content
CREATE OR REPLACE FUNCTION update_highlights_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_highlights_content_updated_at
  BEFORE UPDATE ON public.highlights_content
  FOR EACH ROW
  EXECUTE FUNCTION update_highlights_content_updated_at();

-- Create updated_at trigger for highlights_submissions  
CREATE OR REPLACE FUNCTION update_highlights_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_highlights_submissions_updated_at
  BEFORE UPDATE ON public.highlights_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_highlights_submissions_updated_at();