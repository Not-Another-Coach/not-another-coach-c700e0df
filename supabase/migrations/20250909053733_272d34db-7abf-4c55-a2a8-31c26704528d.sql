-- Create highlights submissions table
CREATE TABLE public.highlights_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('transformation', 'motivational', 'article', 'tip')),
  media_urls text[] DEFAULT '{}',
  submission_status text NOT NULL DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create highlights content table (approved submissions become content)
CREATE TABLE public.highlights_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES highlights_submissions(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  content_type text NOT NULL,
  media_urls text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  featured_until timestamp with time zone,
  engagement_score integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user highlight interactions table for analytics
CREATE TABLE public.user_highlight_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  highlight_id uuid NOT NULL REFERENCES highlights_content(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('viewed', 'liked', 'shared', 'trainer_visited')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.highlights_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_highlight_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for highlights_submissions
CREATE POLICY "Trainers can manage their own submissions" ON public.highlights_submissions
  FOR ALL USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Admins can manage all submissions" ON public.highlights_submissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for highlights_content
CREATE POLICY "Anyone can view active highlights" ON public.highlights_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Trainers can view their own content" ON public.highlights_content
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can manage all content" ON public.highlights_content
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_highlight_interactions
CREATE POLICY "Users can manage their own interactions" ON public.user_highlight_interactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions" ON public.user_highlight_interactions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for highlights media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('highlights-media', 'highlights-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for highlights media
CREATE POLICY "Trainers can upload their own media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'highlights-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view highlights media" ON storage.objects
  FOR SELECT USING (bucket_id = 'highlights-media');

CREATE POLICY "Trainers can update their own media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'highlights-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Trainers can delete their own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'highlights-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create update triggers
CREATE OR REPLACE FUNCTION update_highlights_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_highlights_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_highlights_submissions_updated_at
  BEFORE UPDATE ON highlights_submissions
  FOR EACH ROW EXECUTE FUNCTION update_highlights_submissions_updated_at();

CREATE TRIGGER update_highlights_content_updated_at
  BEFORE UPDATE ON highlights_content
  FOR EACH ROW EXECUTE FUNCTION update_highlights_content_updated_at();

-- Create indexes for performance
CREATE INDEX idx_highlights_submissions_trainer_id ON highlights_submissions(trainer_id);
CREATE INDEX idx_highlights_submissions_status ON highlights_submissions(submission_status);
CREATE INDEX idx_highlights_content_active ON highlights_content(is_active);
CREATE INDEX idx_highlights_content_featured ON highlights_content(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX idx_user_highlight_interactions_user ON user_highlight_interactions(user_id);
CREATE INDEX idx_user_highlight_interactions_highlight ON user_highlight_interactions(highlight_id);