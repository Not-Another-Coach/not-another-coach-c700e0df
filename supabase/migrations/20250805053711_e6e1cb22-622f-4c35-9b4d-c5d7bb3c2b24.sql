-- Create configurable feedback questions schema
CREATE TABLE public.discovery_call_feedback_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('free_text', 'star_rating', 'yes_no', 'emoji_response', 'toggle')),
  audience TEXT NOT NULL CHECK (audience IN ('client', 'pt')),
  visible_to_pt BOOLEAN NOT NULL DEFAULT false,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  question_group TEXT DEFAULT 'general',
  placeholder_text TEXT,
  help_text TEXT,
  
  -- Configuration options for different question types
  options JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Unique constraint on order within active questions
  UNIQUE(display_order, is_archived) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS
ALTER TABLE public.discovery_call_feedback_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage feedback questions" 
ON public.discovery_call_feedback_questions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active feedback questions" 
ON public.discovery_call_feedback_questions 
FOR SELECT 
USING (is_archived = false);

-- Create updated feedback responses table to handle dynamic questions
CREATE TABLE public.discovery_call_feedback_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discovery_call_id UUID NOT NULL,
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.discovery_call_feedback_questions(id),
  response_value TEXT,
  response_data JSONB DEFAULT '{}',
  
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one response per question per discovery call
  UNIQUE(discovery_call_id, question_id)
);

-- Enable RLS for responses
ALTER TABLE public.discovery_call_feedback_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responses
CREATE POLICY "Clients can manage their own responses" 
ON public.discovery_call_feedback_responses 
FOR ALL 
USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view shared responses" 
ON public.discovery_call_feedback_responses 
FOR SELECT 
USING (
  auth.uid() = trainer_id 
  AND EXISTS (
    SELECT 1 FROM public.discovery_call_feedback_questions 
    WHERE id = question_id AND visible_to_pt = true
  )
);

-- Add indexes for performance
CREATE INDEX idx_feedback_questions_order ON public.discovery_call_feedback_questions(display_order) WHERE is_archived = false;
CREATE INDEX idx_feedback_questions_audience ON public.discovery_call_feedback_questions(audience) WHERE is_archived = false;
CREATE INDEX idx_feedback_responses_discovery_call ON public.discovery_call_feedback_responses(discovery_call_id);
CREATE INDEX idx_feedback_responses_trainer ON public.discovery_call_feedback_responses(trainer_id);

-- Add updated_at trigger
CREATE TRIGGER update_feedback_questions_updated_at
BEFORE UPDATE ON public.discovery_call_feedback_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default questions to migrate existing feedback structure
INSERT INTO public.discovery_call_feedback_questions (
  question_text, question_type, audience, visible_to_pt, is_mandatory, display_order, question_group, help_text
) VALUES 
-- Client private feedback
('Did you feel comfortable with this coach?', 'emoji_response', 'client', false, true, 1, 'private', 'Your honest comfort level helps you make better decisions'),
('Would you consider training with them?', 'yes_no', 'client', false, true, 2, 'private', 'Consider their approach, communication style, and expertise'),
('What stood out to you?', 'free_text', 'client', false, false, 3, 'private', 'What did you like or dislike about their approach, communication style, etc.?'),
('How do they compare to others?', 'free_text', 'client', false, false, 4, 'private', 'Any thoughts on how this coach compares to others you''ve spoken with?'),

-- Coach feedback (shareable)
('Was the conversation helpful?', 'star_rating', 'client', true, true, 5, 'coach_feedback', 'Rate how helpful the conversation was overall'),
('Did the coach ask the right questions?', 'star_rating', 'client', true, true, 6, 'coach_feedback', 'Did they understand your needs and goals?'),
('How professional did they seem?', 'star_rating', 'client', true, true, 7, 'coach_feedback', 'Consider their communication and presentation'),
('Share feedback with coach?', 'toggle', 'client', false, true, 8, 'sharing', 'Anonymous feedback helps coaches improve'),
('Any notes for the coach?', 'free_text', 'client', true, false, 9, 'coach_feedback', 'Any constructive feedback or positive comments for the coach?');

-- Function to reorder questions
CREATE OR REPLACE FUNCTION public.reorder_feedback_questions(question_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  question_id UUID;
  new_order INTEGER := 1;
BEGIN
  -- Only admins can reorder
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reorder questions';
  END IF;

  -- Update display_order for each question
  FOREACH question_id IN ARRAY question_ids LOOP
    UPDATE public.discovery_call_feedback_questions 
    SET display_order = new_order, updated_at = now()
    WHERE id = question_id;
    
    new_order := new_order + 1;
  END LOOP;
END;
$$;