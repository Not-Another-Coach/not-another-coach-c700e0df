-- Create table for discovery call notes
CREATE TABLE public.discovery_call_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL,
  client_id uuid NOT NULL,
  note_content text,
  discovery_call_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, client_id)
);

-- Enable Row Level Security
ALTER TABLE public.discovery_call_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for trainer access only
CREATE POLICY "Trainers can view their own notes" 
ON public.discovery_call_notes 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert their own notes" 
ON public.discovery_call_notes 
FOR INSERT 
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own notes" 
ON public.discovery_call_notes 
FOR UPDATE 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own notes" 
ON public.discovery_call_notes 
FOR DELETE 
USING (auth.uid() = trainer_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_discovery_call_notes_updated_at
BEFORE UPDATE ON public.discovery_call_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();