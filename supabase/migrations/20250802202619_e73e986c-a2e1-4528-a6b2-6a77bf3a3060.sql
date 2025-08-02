-- Create saved_trainers table for shortlisting functionality
CREATE TABLE public.saved_trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id TEXT NOT NULL, -- Using TEXT since trainers are currently sample data
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT, -- Optional notes about why they saved this trainer
  
  -- Ensure unique combination of user and trainer
  UNIQUE(user_id, trainer_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_trainers ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_trainers
CREATE POLICY "Users can view their own saved trainers" 
ON public.saved_trainers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save trainers for themselves" 
ON public.saved_trainers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved trainers" 
ON public.saved_trainers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved trainers" 
ON public.saved_trainers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_saved_trainers_user_id ON public.saved_trainers(user_id);
CREATE INDEX idx_saved_trainers_trainer_id ON public.saved_trainers(trainer_id);