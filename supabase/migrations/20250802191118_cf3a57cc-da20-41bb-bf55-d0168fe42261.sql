-- Add quiz-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN quiz_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN quiz_answers JSONB DEFAULT '{}',
ADD COLUMN quiz_completed_at TIMESTAMP WITH TIME ZONE;