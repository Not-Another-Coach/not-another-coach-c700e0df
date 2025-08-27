-- Create storage bucket for trainer images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trainer-images', 
  'trainer-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create RLS policies for trainer images bucket
CREATE POLICY "Trainers can upload their own images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'trainer-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Trainers can update their own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'trainer-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Trainers can delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'trainer-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view trainer images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'trainer-images');

-- Create table for trainer uploaded images
CREATE TABLE public.trainer_uploaded_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  is_selected_for_display boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainer_uploaded_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Trainers can manage their own uploaded images"
ON public.trainer_uploaded_images
FOR ALL
USING (auth.uid() = trainer_id);

CREATE POLICY "Anyone can view selected trainer images"
ON public.trainer_uploaded_images
FOR SELECT
USING (is_selected_for_display = true);

-- Create table for Instagram media selections
CREATE TABLE public.trainer_instagram_selections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL,
  instagram_media_id text NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL, -- 'IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'
  thumbnail_url text,
  caption text,
  is_selected_for_display boolean DEFAULT false,
  display_order integer DEFAULT 0,
  synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(trainer_id, instagram_media_id)
);

-- Enable RLS
ALTER TABLE public.trainer_instagram_selections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Trainers can manage their own Instagram selections"
ON public.trainer_instagram_selections
FOR ALL
USING (auth.uid() = trainer_id);

CREATE POLICY "Anyone can view selected Instagram media"
ON public.trainer_instagram_selections
FOR SELECT
USING (is_selected_for_display = true);

-- Create table for trainer image display preferences
CREATE TABLE public.trainer_image_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL UNIQUE,
  max_images_per_view integer DEFAULT 6,
  auto_sync_instagram boolean DEFAULT false,
  instagram_sync_frequency text DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'manual'
  last_instagram_sync timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainer_image_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Trainers can manage their own image preferences"
ON public.trainer_image_preferences
FOR ALL
USING (auth.uid() = trainer_id);

-- Create indexes for performance
CREATE INDEX idx_trainer_uploaded_images_trainer_id ON public.trainer_uploaded_images(trainer_id);
CREATE INDEX idx_trainer_uploaded_images_selected ON public.trainer_uploaded_images(trainer_id, is_selected_for_display);
CREATE INDEX idx_trainer_instagram_selections_trainer_id ON public.trainer_instagram_selections(trainer_id);
CREATE INDEX idx_trainer_instagram_selections_selected ON public.trainer_instagram_selections(trainer_id, is_selected_for_display);

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainer_uploaded_images_updated_at
  BEFORE UPDATE ON public.trainer_uploaded_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainer_instagram_selections_updated_at
  BEFORE UPDATE ON public.trainer_instagram_selections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainer_image_preferences_updated_at
  BEFORE UPDATE ON public.trainer_image_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();