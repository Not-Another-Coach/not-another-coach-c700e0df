-- Create trainer_image_preferences table
CREATE TABLE public.trainer_image_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_images_per_view INTEGER DEFAULT 6,
  auto_sync_instagram BOOLEAN DEFAULT false,
  instagram_sync_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trainer_image_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for trainer image preferences
CREATE POLICY "Trainers can manage their own image preferences" 
ON public.trainer_image_preferences 
FOR ALL 
USING (auth.uid() = trainer_id)
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Users can view image preferences for display purposes" 
ON public.trainer_image_preferences 
FOR SELECT 
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_trainer_image_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trainer_image_preferences_updated_at
BEFORE UPDATE ON public.trainer_image_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_trainer_image_preferences_updated_at();