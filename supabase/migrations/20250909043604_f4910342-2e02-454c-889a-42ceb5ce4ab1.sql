-- Create storage bucket for logo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

-- Create RLS policies for logo bucket
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update logos" 
ON storage.objects
FOR UPDATE
USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));

-- Create app settings table to store logo configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_settings
CREATE POLICY "Anyone can view app settings"
ON public.app_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default logo setting
INSERT INTO public.app_settings (setting_key, setting_value, updated_by)
VALUES ('app_logo', '{"logo_url": null, "fallback_text": "FQ", "app_name": "FitQuest"}', null)
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_settings_updated_at();